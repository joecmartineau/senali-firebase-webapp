import { Router } from 'express';
import { adminAuth } from '../firebase-admin';

const router = Router();

// Middleware to verify admin access
const verifyAdmin = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
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
    console.log('Fetching all Firebase users...');
    
    const listUsersResult = await adminAuth.listUsers();
    
    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || null,
      createdAt: userRecord.metadata.creationTime,
      lastSignIn: userRecord.metadata.lastSignInTime || userRecord.metadata.creationTime,
      // Default values for credits and subscription
      credits: 25, // Default trial credits
      subscriptionStatus: 'trial'
    }));

    console.log(`Found ${users.length} users`);
    
    res.json({ 
      users,
      totalCount: users.length 
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

    // Get current user record
    const userRecord = await adminAuth.getUser(uid);
    
    // For now, we'll simulate credit adjustment
    // In a real app, you'd store this in a database
    const currentCredits = 25; // This would come from your database
    const newCredits = Math.max(0, currentCredits + adjustment);

    console.log(`Adjusting credits for ${userRecord.email}: ${currentCredits} + ${adjustment} = ${newCredits}`);

    // Return updated user data
    const updatedUser = {
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || null,
      createdAt: userRecord.metadata.creationTime,
      lastSignIn: userRecord.metadata.lastSignInTime || userRecord.metadata.creationTime,
      credits: newCredits,
      subscriptionStatus: newCredits > 25 ? 'active' : 'trial'
    };

    res.json(updatedUser);
  } catch (error) {
    console.error('Error adjusting credits:', error);
    res.status(500).json({ error: 'Failed to adjust credits' });
  }
});

export default router;