import { Router } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get subscription status for user
router.get('/status/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      credits: user.credits,
      subscription: user.subscription,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlatform: user.subscriptionPlatform,
      lastCreditRefill: user.lastCreditRefill
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// Purchase credits (in-app purchase)
router.post('/purchase-credits', async (req, res) => {
  try {
    const { uid, credits, purchaseToken, platform } = req.body;
    
    if (!uid || !credits || !purchaseToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // In a real app, you would verify the purchase token with the respective store
    // For now, we'll simulate successful purchase verification
    
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add purchased credits to user's account
    const newCredits = user.credits + credits;
    
    await db.update(users)
      .set({ 
        credits: newCredits,
        updatedAt: new Date()
      })
      .where(eq(users.id, uid));
    
    res.json({
      success: true,
      newCredits,
      message: `Successfully added ${credits} credits to your account`
    });
  } catch (error) {
    console.error('Error purchasing credits:', error);
    res.status(500).json({ error: 'Failed to process credit purchase' });
  }
});

// Activate subscription
router.post('/activate', async (req, res) => {
  try {
    const { uid, subscriptionId, platform } = req.body;
    
    if (!uid || !subscriptionId || !platform) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // In a real app, you would verify the subscription with the respective store
    // For now, we'll simulate successful subscription verification
    
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Activate subscription and give monthly credits
    await db.update(users)
      .set({ 
        subscription: 'premium',
        subscriptionStatus: 'active',
        subscriptionPlatform: platform,
        subscriptionId: subscriptionId,
        credits: user.credits + 1000, // Add monthly credits
        lastCreditRefill: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, uid));
    
    res.json({
      success: true,
      message: 'Subscription activated successfully',
      newCredits: user.credits + 1000
    });
  } catch (error) {
    console.error('Error activating subscription:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
});

// Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    await db.update(users)
      .set({ 
        subscription: 'free',
        subscriptionStatus: 'cancelled',
        subscriptionPlatform: null,
        subscriptionId: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, uid));
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Refill credits for active subscribers (called monthly)
router.post('/refill-credits', async (req, res) => {
  try {
    const { uid } = req.body;
    
    const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.subscription !== 'premium' || user.subscriptionStatus !== 'active') {
      return res.status(400).json({ error: 'User does not have active premium subscription' });
    }
    
    // Check if it's been a month since last refill
    const lastRefill = user.lastCreditRefill ? new Date(user.lastCreditRefill) : new Date(0);
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    if (lastRefill > monthAgo) {
      return res.status(400).json({ error: 'Credits already refilled this month' });
    }
    
    // Refill credits to 1000 (don't add, just set to 1000)
    await db.update(users)
      .set({ 
        credits: 1000,
        lastCreditRefill: now,
        updatedAt: now
      })
      .where(eq(users.id, uid));
    
    res.json({
      success: true,
      newCredits: 1000,
      message: 'Monthly credits refilled successfully'
    });
  } catch (error) {
    console.error('Error refilling credits:', error);
    res.status(500).json({ error: 'Failed to refill credits' });
  }
});

export default router;