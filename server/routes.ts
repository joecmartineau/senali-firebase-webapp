import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateChatResponse, generateDailyTip } from "./openai";
import { insertMessageSchema, insertTipInteractionSchema } from "@shared/schema";
import { z } from "zod";

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

  // Chat routes
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

  app.post('/api/tips/generate', isAuthenticated, async (req: any, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
