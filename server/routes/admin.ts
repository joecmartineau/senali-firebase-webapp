import { Router } from 'express';
import { adminAuth } from '../firebase-admin';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Middleware to verify admin access
const verifyAdmin = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // If Firebase Admin is not available, check if token looks like a real Firebase token
    if (!adminAuth) {
      console.log('Firebase Admin not available, using fallback verification');
      // Check if it's a Firebase-style JWT token (has 3 parts separated by dots)
      if (!token || token.split('.').length !== 3 || token.length < 100) {
        return res.status(401).json({ error: 'Invalid token format' });
      }
      // For development, allow bypass if token looks like Firebase JWT
      console.log('Bypassing admin verification for development');
      req.user = { email: 'joecmartineau@gmail.com' };
      return next();
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user is admin
    if (decodedToken.email !== 'joecmartineau@gmail.com') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    console.log('Admin: Fetching all users...');
    
    if (adminAuth) {
      // Try Firebase Admin first
      try {
        console.log('Using Firebase Admin to fetch users...');
        const listUsersResult = await adminAuth.listUsers();
        
        const users = listUsersResult.users.map(userRecord => ({
          uid: userRecord.uid,
          email: userRecord.email || '',
          displayName: userRecord.displayName || '',
          photoURL: userRecord.photoURL || null,
          createdAt: userRecord.metadata.creationTime,
          lastSignIn: userRecord.metadata.lastSignInTime || userRecord.metadata.creationTime,
          credits: 25, // Default trial credits
          subscriptionStatus: 'trial'
        }));

        console.log(`Firebase Admin: Found ${users.length} users`);
        return res.json({ users, totalCount: users.length });
      } catch (firebaseError) {
        console.error('Firebase Admin error:', firebaseError);
        console.log('Falling back to database users...');
      }
    }
    
    // Fallback to database users
    console.log('Using database to fetch users...');
    const dbUsers = await db.select().from(users);
    
    const mappedUsers = dbUsers.map(user => ({
      uid: user.id,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Unknown',
      photoURL: user.profileImageUrl || null,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      lastSignIn: user.updatedAt?.toISOString() || user.createdAt?.toISOString() || new Date().toISOString(),
      credits: user.credits || 25,
      subscriptionStatus: user.subscription === 'premium' ? 'active' : 'trial'
    }));

    console.log(`Database: Found ${mappedUsers.length} users`);
    
    res.json({ 
      users: mappedUsers,
      totalCount: mappedUsers.length 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Adjust user credits
router.patch('/users/:uid/credits', verifyAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { adjustment } = req.body;

    if (typeof adjustment !== 'number') {
      return res.status(400).json({ error: 'Invalid adjustment value' });
    }

    console.log(`Admin: Adjusting credits for user ${uid} by ${adjustment}`);

    // Get current user first
    const currentUser = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    const currentCredits = currentUser[0]?.credits || 25;
    const newCredits = Math.max(0, currentCredits + adjustment);

    // Update in database
    const [updatedUser] = await db.update(users)
      .set({ 
        credits: newCredits,
        updatedAt: new Date()
      })
      .where(eq(users.id, uid))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Credits updated: ${updatedUser.email} now has ${updatedUser.credits} credits`);

    // Return formatted user data
    const responseUser = {
      uid: updatedUser.id,
      email: updatedUser.email || '',
      displayName: updatedUser.displayName || updatedUser.email?.split('@')[0] || 'Unknown',
      photoURL: updatedUser.profileImageUrl || null,
      createdAt: updatedUser.createdAt?.toISOString() || new Date().toISOString(),
      lastSignIn: updatedUser.updatedAt?.toISOString() || new Date().toISOString(),
      credits: updatedUser.credits || 0,
      subscriptionStatus: updatedUser.subscription === 'premium' ? 'active' : 'trial'
    };

    res.json(responseUser);
  } catch (error) {
    console.error('Error adjusting credits:', error);
    res.status(500).json({ error: 'Failed to adjust credits' });
  }
});

export default router;