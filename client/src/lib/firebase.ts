import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "GOOGLE_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "senali-235fb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "senali-235fb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "senali-235fb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "67286745357",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:67286745357:web:ec18d40025c29e2583b044",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GE6PL1J1Q7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (only in production and when supported)
export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId
  ? getAnalytics(app) 
  : null;

// Configure Google Auth provider
googleProvider.addScope('email');
googleProvider.addScope('profile');

export default app;