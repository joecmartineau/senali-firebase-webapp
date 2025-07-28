import type { Express } from "express";
import { createServer, type Server } from "http";
import chatRoutes from './routes/chat';
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateChatResponse, generateDailyTip } from "./openai";
import { insertMessageSchema, insertTipInteractionSchema, insertSymptomChecklistSchema, insertChildProfileSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { childProfiles, symptomChecklists, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat routes
  app.use('/api', chatRoutes);
  
  // Admin routes - import dynamically to avoid circular dependency
  const { default: adminRoutes } = await import('./routes/admin');
  app.use('/api/admin', adminRoutes);
  
  // Credit purchase routes
  app.post('/api/purchase/credits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId, credits, price, platform } = req.body;
      
      console.log(`Credit purchase: ${credits} credits for user ${userId}`);
      
      // In production, verify the purchase with the app store here
      // For now, we'll grant credits directly
      
      // Get current user data first
      const [currentUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const [updatedUser] = await db.update(users)
        .set({ 
          credits: (currentUser.credits || 0) + credits,
          totalPurchasedCredits: (currentUser.totalPurchasedCredits || 0) + credits,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      res.json({ 
        success: true, 
        newCreditsTotal: updatedUser?.credits || 0,
        purchasedCredits: credits
      });
    } catch (error) {
      console.error('Credit purchase error:', error);
      res.status(500).json({ error: 'Purchase failed' });
    }
  });

  // Get user credits
  app.get('/api/user/credits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      res.json({ 
        credits: user?.credits || 0,
        totalPurchased: user?.totalPurchasedCredits || 0
      });
    } catch (error) {
      console.error('Error fetching credits:', error);
      res.status(500).json({ error: 'Failed to fetch credits' });
    }
  });

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

  // Store Firebase user when they sign in (for admin panel tracking)
  app.post('/api/auth/firebase-signin', async (req, res) => {
    try {
      const { uid, email, displayName, photoURL } = req.body;
      
      if (!uid || !email) {
        return res.status(400).json({ error: 'Missing required user data' });
      }
      
      console.log('Firebase user signing in:', email);
      
      // Check if user exists in database
      const existingUser = await db.select().from(users).where(eq(users.id, uid)).limit(1);
      
      if (existingUser.length === 0) {
        // Create new user record with starting credits
        await db.insert(users).values({
          id: uid,
          email,
          displayName: displayName || email.split('@')[0],
          profileImageUrl: photoURL || null,
          credits: 25, // Starting credits for new users
          totalPurchasedCredits: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('Created new user record for:', email);
      } else {
        // Update last active time but DO NOT reset credits
        await db.update(users)
          .set({ 
            displayName: displayName || existingUser[0].displayName,
            profileImageUrl: photoURL || existingUser[0].profileImageUrl,
            updatedAt: new Date() 
          })
          .where(eq(users.id, uid));
        console.log('Updated existing user record for:', email, 'Credits preserved:', existingUser[0].credits);
      }
      
      // Return user info including profile completion status
      const [updatedUser] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
      
      res.json({ 
        success: true,
        user: {
          uid,
          email,
          hasCompletedProfile: updatedUser?.hasCompletedProfile || false,
          fullName: updatedUser?.fullName || null
        }
      });
    } catch (error) {
      console.error('Error storing Firebase user:', error);
      res.status(500).json({ error: 'Failed to store user data' });
    }
  });

  // Complete user profile setup
  app.post('/api/auth/complete-profile', async (req, res) => {
    try {
      const { uid, fullName } = req.body;

      if (!uid || !fullName) {
        return res.status(400).json({ error: 'UID and full name are required' });
      }

      // Update user profile
      const [updatedUser] = await db.update(users)
        .set({ 
          fullName: fullName.trim(),
          hasCompletedProfile: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, uid))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log('Profile completed for user:', updatedUser.email);
      res.json({ 
        message: 'Profile completed successfully',
        user: {
          uid: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          hasCompletedProfile: updatedUser.hasCompletedProfile
        }
      });
    } catch (error) {
      console.error('Complete profile error:', error);
      res.status(500).json({ error: 'Failed to complete profile' });
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

  // Generate new tip
  app.post('/api/tips/generate', isAuthenticated, async (req: any, res) => {
    try {
      const generatedTip = await generateDailyTip();
      const newTip = await storage.createDailyTip(generatedTip);
      res.json(newTip);
    } catch (error) {
      console.error("Error generating new tip:", error);
      res.status(500).json({ message: "Failed to generate new tip" });
    }
  });

  // Tip interactions
  app.post('/api/tips/:tipId/interact', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tipId } = req.params;
      const { isHelpful } = insertTipInteractionSchema.parse(req.body);

      // Check if user already interacted with this tip
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
        res.status(500).json({ message: "Failed to record interaction" });
      }
    }
  });

  // Child profile routes  
  app.post('/api/children/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertChildProfileSchema.parse(req.body);

      const profile = await db.insert(childProfiles).values({
        ...profileData,
        userId
      }).returning();

      res.json(profile[0]);
    } catch (error) {
      console.error("Error creating child profile:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create profile" });
      }
    }
  });

  // Get child profile
  app.get('/api/children/:childName/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { childName } = req.params;
      
      const profile = await db.select()
        .from(childProfiles)
        .where(and(
          eq(childProfiles.userId, userId),
          eq(childProfiles.childName, childName)
        ))
        .limit(1);
      
      if (profile.length === 0) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile[0]);
    } catch (error) {
      console.error("Error fetching child profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update child profile
  app.put('/api/children/:childId/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { childId } = req.params;
      const updateData = req.body;
      
      // Verify ownership
      const existing = await db.select()
        .from(childProfiles)
        .where(and(
          eq(childProfiles.id, childId),
          eq(childProfiles.userId, userId)
        ))
        .limit(1);
      
      if (existing.length === 0) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const updated = await db.update(childProfiles)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(childProfiles.id, childId))
        .returning();
      
      res.json(updated[0]);
    } catch (error) {
      console.error("Error updating child profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Symptom checklist routes (continued)
  app.put('/api/children/:childId/symptoms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profiles = await storage.getUserChildProfiles(userId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching children profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  // Family profile API routes removed - deleting family profile system

  app.post('/api/children', async (req: any, res) => {
    try {
      const userId = 'demo-user'; // Temporary demo user for testing
      const validation = insertChildProfileSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }

      const profileData = {
        ...validation.data,
        userId
      };

      const profile = await storage.createChildProfile(profileData);
      console.log('Created child profile:', profile.childName);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating child profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.get('/api/children/:id', async (req: any, res) => {
    try {
      const userId = 'demo-user'; // Temporary demo user for testing
      const childId = parseInt(req.params.id);

      const profile = await storage.getChildProfile(childId);
      
      if (!profile || profile.userId !== userId) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching child profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put('/api/children/:id', async (req: any, res) => {
    try {
      const userId = 'demo-user'; // Temporary demo user for testing
      const childId = parseInt(req.params.id);

      // Verify ownership
      const existingProfile = await storage.getChildProfile(childId);
      
      if (!existingProfile || existingProfile.userId !== userId) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const validation = insertChildProfileSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }

      const updatedProfile = await storage.updateChildProfile(childId, validation.data);
      console.log('Updated child profile:', updatedProfile.childName);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating child profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.delete('/api/children/:id', async (req: any, res) => {
    try {
      const userId = 'demo-user'; // Temporary demo user for testing
      const childId = parseInt(req.params.id);

      // Verify ownership
      const existingProfile = await storage.getChildProfile(childId);
      
      if (!existingProfile || existingProfile.userId !== userId) {
        return res.status(404).json({ message: "Profile not found" });
      }

      await storage.deleteChildProfile(childId);
      console.log('Deleted child profile:', existingProfile.childName);
      res.json({ message: "Profile deleted successfully" });
    } catch (error) {
      console.error("Error deleting child profile:", error);
      res.status(500).json({ message: "Failed to delete profile" });
    }
  });

  // Symptom checklist routes
  app.post('/api/children/:childId/symptoms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { childId } = req.params;
      const symptomData = insertSymptomChecklistSchema.parse(req.body);

      // Verify child ownership
      const childProfile = await db.select()
        .from(childProfiles)
        .where(and(
          eq(childProfiles.id, childId),
          eq(childProfiles.userId, userId)
        ))
        .limit(1);
      
      if (childProfile.length === 0) {
        return res.status(404).json({ message: "Child not found" });
      }

      const symptoms = await db.insert(symptomChecklists).values({
        ...symptomData,
        childId
      }).returning();

      res.json(symptoms[0]);
    } catch (error) {
      console.error("Error creating symptom checklist:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid symptom data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create symptoms" });
      }
    }
  });

  // Get symptom checklist
  app.get('/api/children/:childId/symptoms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { childId } = req.params;
      
      // Verify child ownership
      const childProfile = await db.select()
        .from(childProfiles)
        .where(and(
          eq(childProfiles.id, childId),
          eq(childProfiles.userId, userId)
        ))
        .limit(1);
      
      if (childProfile.length === 0) {
        return res.status(404).json({ message: "Child not found" });
      }
      
      const symptoms = await db.select()
        .from(symptomChecklists)
        .where(eq(symptomChecklists.childId, childId))
        .limit(1);
      
      res.json(symptoms[0] || null);
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  });

  // Update symptom checklist
  app.put('/api/children/:childId/symptoms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { childId } = req.params;
      const updateData = req.body;
      
      // Verify child ownership
      const childProfile = await db.select()
        .from(childProfiles)
        .where(and(
          eq(childProfiles.id, childId),
          eq(childProfiles.userId, userId)
        ))
        .limit(1);
      
      if (childProfile.length === 0) {
        return res.status(404).json({ message: "Child not found" });
      }
      
      const updated = await db.update(symptomChecklists)
        .set({
          ...updateData,
          lastUpdated: new Date()
        })
        .where(eq(symptomChecklists.childId, childId))
        .returning();
      
      res.json(updated[0]);
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
  app.get('/api/children', async (req: any, res) => {
    try {
      const userId = 'demo-user'; // Temporary demo user for testing
      
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

  // Use remaining modular routes (disabled for now)
  // app.use('/api/profiles', profilesRouter);
  
  // Remove test/fake users (admin only)
  app.delete('/api/admin/clear-test-data', async (req, res) => {
    try {
      // Remove fake test users
      const deleted = await db.delete(users).where(
        eq(users.id, 'test-user-1')
      ).returning();
      
      const deleted2 = await db.delete(users).where(
        eq(users.id, 'admin-user')
      ).returning();
      
      console.log('Deleted test users:', deleted.length + deleted2.length);
      res.json({ message: 'Test data cleared', deleted: deleted.length + deleted2.length });
    } catch (error) {
      console.error('Error clearing test data:', error);
      res.status(500).json({ error: 'Failed to clear test data' });
    }
  });

  // Temporary admin testing route (bypass all auth)
  app.get('/api/test-admin-users', async (req, res) => {
    try {
      console.log('Fetching users from database...');
      const allUsers = await db.select().from(users);
      console.log('Raw users from DB:', allUsers);
      
      const mappedUsers = allUsers.map(user => ({
        uid: user.id,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Unknown',
        subscription: user.subscription || 'free', 
        credits: user.credits || 25,
        lastActive: user.updatedAt,
      }));
      
      console.log('Mapped users:', mappedUsers);
      res.json(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
  });

  // Family profiles management routes (local server for development)
  app.get('/api/family-profiles', async (req, res) => {
    try {
      console.log('Local server: Getting family profiles');
      res.json([]);
    } catch (error) {
      console.error('Error getting family profiles:', error);
      res.status(500).json({ error: 'Failed to get profiles' });
    }
  });

  app.post('/api/family-profiles', async (req, res) => {
    try {
      const profileData = {
        ...req.body,
        id: Date.now().toString(),
        userId: 'demo-user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Local server: Creating family profile for:', profileData.name);
      res.status(201).json(profileData);
    } catch (error) {
      console.error('Error creating family profile:', error);
      res.status(500).json({ error: 'Failed to create profile' });
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