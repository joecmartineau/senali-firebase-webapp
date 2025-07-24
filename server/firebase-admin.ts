import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
let app;
if (getApps().length === 0) {
  try {
    // For Replit deployment - use project ID (requires proper IAM permissions)
    app = initializeApp({
      projectId: 'senali-235fb',
    });
    console.log('Firebase Admin initialized successfully with project senali-235fb');
  } catch (error: any) {
    console.warn('Firebase Admin initialization failed:', error.message);
    console.log('Will use fallback for admin routes');
    app = null;
  }
} else {
  app = getApps()[0];
}

export const adminDb = app ? getFirestore(app) : null;
export const adminAuth = app ? getAuth(app) : null;

// Export admin object for compatibility
export const admin = {
  auth: () => adminAuth,
  firestore: () => adminDb
};