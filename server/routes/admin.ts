import express from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || req.user.email !== 'joecmartineau@gmail.com') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all users with their subscription info
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const allUsers = await db
      .select({
        uid: users.uid,
        email: users.email,
        displayName: users.displayName,
        credits: users.credits,
        subscription: users.subscription,
        lastActive: users.updatedAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    res.json(allUsers.map(user => ({
      ...user,
      subscription: user.subscription || 'free',
      credits: user.credits || 0,
    })));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user credits
router.post('/update-credits', requireAdmin, async (req, res) => {
  try {
    const { userId, creditChange } = req.body;

    if (!userId || typeof creditChange !== 'number') {
      return res.status(400).json({ error: 'Invalid userId or creditChange' });
    }

    // Get current user
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.uid, userId));

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentCredits = currentUser.credits || 0;
    const newCredits = Math.max(0, currentCredits + creditChange);

    // Update user credits
    const [updatedUser] = await db
      .update(users)
      .set({ 
        credits: newCredits,
        updatedAt: new Date(),
      })
      .where(eq(users.uid, userId))
      .returning();

    res.json({
      uid: updatedUser.uid,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      credits: updatedUser.credits,
    });
  } catch (error) {
    console.error('Error updating credits:', error);
    res.status(500).json({ error: 'Failed to update credits' });
  }
});

// Get user statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await db.select().from(users);
    const premiumUsers = totalUsers.filter(user => user.subscription === 'premium');

    const stats = {
      totalUsers: totalUsers.length,
      premiumUsers: premiumUsers.length,
      freeUsers: totalUsers.length - premiumUsers.length,
      totalCredits: totalUsers.reduce((sum, user) => sum + (user.credits || 0), 0),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export { router as adminRoutes };