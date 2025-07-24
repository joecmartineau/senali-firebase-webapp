import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
let app;
if (getApps().length === 0) {
  // For development, we'll use the project ID directly
  // In production, you would use a service account key
  app = initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'senali-235fb',
  });
} else {
  app = getApps()[0];
}

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);

// Export admin object for compatibility
export const admin = {
  auth: () => adminAuth,
  firestore: () => adminDb
};