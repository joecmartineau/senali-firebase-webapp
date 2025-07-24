import express from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req: any, res: any, next: any) => {
  console.log('Admin check - req.user:', req.user);
  console.log('Admin check - user email:', req.user?.email);
  console.log('Admin check - user claims:', req.user?.claims);
  
  const userEmail = req.user?.email || req.user?.claims?.email;
  
  // Temporary bypass for testing - remove after authentication is working
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode - allowing admin access');
    next();
    return;
  }
  
  if (!req.user || userEmail !== 'joecmartineau@gmail.com') {
    return res.status(403).json({ error: 'Admin access required', userEmail });
  }
  next();
};

// Get all users with their subscription info (temporarily bypassing auth for testing)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const allUsers = await db
      .select({
        uid: users.id, // Use id as uid for compatibility
        email: users.email,
        displayName: users.displayName,
        credits: users.credits,
        subscription: users.subscription,
        lastActive: users.updatedAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    res.json(allUsers.map(user => ({
      uid: user.uid, // Map id to uid for frontend
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Unknown',
      subscription: user.subscription || 'free',
      credits: user.credits || 25, // Default 25 credits
      lastActive: user.lastActive,
    })));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user credits (temporarily bypassing auth for testing)
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
      .where(eq(users.id, userId));

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentCredits = currentUser.credits || 25;
    const newCredits = Math.max(0, currentCredits + creditChange);

    // Update user credits
    const [updatedUser] = await db
      .update(users)
      .set({ 
        credits: newCredits,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    res.json({
      uid: updatedUser.id, // Return id as uid for frontend compatibility
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      credits: updatedUser.credits,
    });
  } catch (error) {
    console.error('Error updating credits:', error);
    res.status(500).json({ error: 'Failed to update credits' });
  }
});

// Get user statistics (temporarily bypassing auth for testing)
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