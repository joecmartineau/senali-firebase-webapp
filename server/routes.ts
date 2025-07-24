import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateChatResponse, generateDailyTip } from "./openai";
import { insertMessageSchema, insertTipInteractionSchema, insertSymptomChecklistSchema, insertChildProfileSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { childProfiles, symptomChecklists } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Firebase-compatible Chat API route
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, context = [] } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      // System prompt for neurodivergent parenting support
      const SYSTEM_PROMPT = `You are Senali, a specialized AI assistant dedicated to supporting parents of neurodivergent children, including those with ADHD, autism, ADD, ODD, and other neurological differences.

Your role is to provide:
- Evidence-based parenting strategies and behavioral management techniques
- Emotional support and validation for parenting challenges
- Practical daily tips and actionable advice
- Resources and information about neurodivergent conditions
- Compassionate guidance without judgment

Key principles:
- Always respond with empathy and understanding
- Provide specific, actionable advice when possible
- Acknowledge that every child is unique
- Encourage professional support when appropriate
- Use simple, clear language that's easy to understand
- Focus on strengths-based approaches
- Validate parental feelings and experiences

Remember: You are not a replacement for professional medical or therapeutic advice, but a supportive companion in the parenting journey.`;

      // Build conversation context
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...context.slice(-10), // Limit context to last 10 messages
        { role: 'user', content: message }
      ];

      const startTime = Date.now();

      // Get response from OpenAI
      const completion = await generateChatResponse(message, context.slice(-5));

      const processingTime = Date.now() - startTime;

      res.json({
        response: completion,
        model: 'gpt-3.5-turbo',
        processingTime
      });

    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Legacy Chat routes (keeping for compatibility)
  app.post('/api/chat/message', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content } = insertMessageSchema.parse(req.body);

      // Save user message
      await storage.createMessage({
        userId,
        content,
        role: "user"
      });

      // Get recent message history for context
      const recentMessages = await storage.getUserMessages(userId, 10);
      const messageHistory = recentMessages
        .reverse()
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Generate AI response
      const aiResponse = await generateChatResponse(content, messageHistory);

      // Save AI response
      const assistantMessage = await storage.createMessage({
        userId,
        content: aiResponse,
        role: "assistant"
      });

      res.json({
        userMessage: { content, role: "user", timestamp: new Date() },
        assistantMessage
      });
    } catch (error) {
      console.error("Error processing chat message:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message format" });
      } else {
        res.status(500).json({ message: "Failed to process message" });
      }
    }
  });

  app.get('/api/chat/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const messages = await storage.getUserMessages(userId, limit);
      res.json(messages.reverse()); // Return in chronological order
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Daily tips routes
  app.get('/api/tips/today', isAuthenticated, async (req: any, res) => {
    try {
      let todaysTip = await storage.getTodaysTip();
      
      // If no tip for today, generate one
      if (!todaysTip) {
        const generatedTip = await generateDailyTip();
        todaysTip = await storage.createDailyTip(generatedTip);
      }
      
      res.json(todaysTip);
    } catch (error) {
      console.error("Error fetching today's tip:", error);
      res.status(500).json({ message: "Failed to fetch today's tip" });
    }
  });

  // Firebase-compatible Tips generation API route
  app.post('/api/tips/generate', async (req, res) => {
    try {
      const { userId, preferences = {} } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      // Generate tip using existing function but return Firebase-compatible format
      const generatedTip = await generateDailyTip();
      
      // Format for Firebase frontend
      const tipData = {
        title: generatedTip.title,
        content: generatedTip.content,
        category: generatedTip.category || 'general',
        targetAge: getAgeRange(preferences.childAge),
        difficulty: 'beginner',
        estimatedTime: '5-15 minutes',
        tags: ['parenting', 'neurodivergent', generatedTip.category].filter(Boolean)
      };

      res.json(tipData);

    } catch (error) {
      console.error('Tip generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate tip',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Legacy tips route (keeping for compatibility)  
  app.post('/api/tips/generate-legacy', isAuthenticated, async (req: any, res) => {
    try {
      const generatedTip = await generateDailyTip();
      const tip = await storage.createDailyTip(generatedTip);
      res.json(tip);
    } catch (error) {
      console.error("Error generating new tip:", error);
      res.status(500).json({ message: "Failed to generate new tip" });
    }
  });

  app.get('/api/tips/recent', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const tips = await storage.getRecentTips(limit);
      res.json(tips);
    } catch (error) {
      console.error("Error fetching recent tips:", error);
      res.status(500).json({ message: "Failed to fetch recent tips" });
    }
  });

  app.post('/api/tips/:tipId/interact', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tipId = parseInt(req.params.tipId);
      const { isHelpful } = insertTipInteractionSchema.parse(req.body);

      // Check if interaction already exists
      const existingInteraction = await storage.getUserTipInteraction(userId, tipId);
      
      if (existingInteraction) {
        return res.status(400).json({ message: "Already interacted with this tip" });
      }

      const interaction = await storage.createTipInteraction({
        userId,
        tipId,
        isHelpful
      });

      res.json(interaction);
    } catch (error) {
      console.error("Error creating tip interaction:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid interaction data" });
      } else {
        res.status(500).json({ message: "Failed to save tip interaction" });
      }
    }
  });

  // Symptom Checklist Management Routes
  
  // Get or create child profile
  app.get('/api/children/:childName/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const childName = req.params.childName;
      
      const [profile] = await db.select()
        .from(childProfiles)
        .where(and(
          eq(childProfiles.userId, userId),
          eq(childProfiles.childName, childName)
        ));
      
      if (!profile) {
        return res.status(404).json({ message: "Child profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching child profile:", error);
      res.status(500).json({ message: "Failed to fetch child profile" });
    }
  });
  
  // Create or update child profile
  app.post('/api/children/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertChildProfileSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if profile exists
      const [existingProfile] = await db.select()
        .from(childProfiles)
        .where(and(
          eq(childProfiles.userId, userId),
          eq(childProfiles.childName, profileData.childName)
        ));
      
      if (existingProfile) {
        // Update existing profile
        const [updatedProfile] = await db.update(childProfiles)
          .set({ ...profileData, updatedAt: new Date() })
          .where(eq(childProfiles.id, existingProfile.id))
          .returning();
        
        res.json(updatedProfile);
      } else {
        // Create new profile
        const [newProfile] = await db.insert(childProfiles)
          .values(profileData)
          .returning();
        
        // Initialize empty symptom checklist
        await db.insert(symptomChecklists)
          .values({ childId: newProfile.id })
          .onConflictDoNothing();
        
        res.json(newProfile);
      }
    } catch (error) {
      console.error("Error creating/updating child profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save child profile" });
      }
    }
  });
  
  // Get symptom checklist for a child
  app.get('/api/children/:childId/symptoms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const childId = parseInt(req.params.childId);
      
      // Verify child belongs to user
      const [profile] = await db.select()
        .from(childProfiles)
        .where(and(
          eq(childProfiles.id, childId),
          eq(childProfiles.userId, userId)
        ));
      
      if (!profile) {
        return res.status(404).json({ message: "Child not found" });
      }
      
      // Get symptom checklist
      const [symptoms] = await db.select()
        .from(symptomChecklists)
        .where(eq(symptomChecklists.childId, childId));
      
      res.json({
        childProfile: profile,
        symptoms: symptoms || {}
      });
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  });
  
  // Update symptom checklist for a child
  app.post('/api/children/:childId/symptoms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const childId = parseInt(req.params.childId);
      
      // Verify child belongs to user
      const [profile] = await db.select()
        .from(childProfiles)
        .where(and(
          eq(childProfiles.id, childId),
          eq(childProfiles.userId, userId)
        ));
      
      if (!profile) {
        return res.status(404).json({ message: "Child not found" });
      }
      
      const symptomData = insertSymptomChecklistSchema.parse({
        ...req.body,
        childId
      });
      
      // Check if symptom checklist exists
      const [existingSymptoms] = await db.select()
        .from(symptomChecklists)
        .where(eq(symptomChecklists.childId, childId));
      
      if (existingSymptoms) {
        // Update existing checklist
        const [updatedSymptoms] = await db.update(symptomChecklists)
          .set({ ...symptomData, lastUpdated: new Date() })
          .where(eq(symptomChecklists.childId, childId))
          .returning();
        
        res.json(updatedSymptoms);
      } else {
        // Create new checklist
        const [newSymptoms] = await db.insert(symptomChecklists)
          .values(symptomData)
          .returning();
        
        res.json(newSymptoms);
      }
    } catch (error) {
      console.error("Error updating symptoms:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid symptom data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update symptoms" });
      }
    }
  });

  // Get all children for a user
  app.get('/api/children', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const children = await db.select()
        .from(childProfiles)
        .where(eq(childProfiles.userId, userId))
        .orderBy(childProfiles.createdAt);
      
      res.json(children);
    } catch (error) {
      console.error("Error fetching children:", error);
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to determine age range from child age
function getAgeRange(age?: number): string {
  if (!age) return 'all ages';
  if (age <= 3) return '0-3';
  if (age <= 6) return '3-6';
  if (age <= 12) return '7-12';
  if (age <= 18) return '13-18';
  return 'adult';
}
