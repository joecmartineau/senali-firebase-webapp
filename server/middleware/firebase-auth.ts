import { Request, Response, NextFunction } from 'express';

// Extend the Express Request type to avoid conflicts
declare module 'express-serve-static-core' {
  interface Request {
    firebaseUser?: {
      uid: string;
      email: string;
      name?: string;
    };
  }
}
import { adminAuth } from '../firebase-admin';

// Remove AuthenticatedRequest interface since we're extending the base Request

export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name
    };

    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.firebaseUser || req.firebaseUser.email !== 'joecmartineau@gmail.com') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};