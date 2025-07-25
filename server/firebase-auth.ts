import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Firebase Auth middleware for API routes
export async function requireFirebaseAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request
    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// Demo auth middleware for development (allows all requests)
export function allowDemoAuth(req: Request, res: Response, next: NextFunction) {
  // For demo mode, create a mock user
  (req as any).user = {
    uid: 'demo-user',
    email: 'demo@example.com',
    emailVerified: true
  };
  next();
}