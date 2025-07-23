import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration - using direct values since env vars aren't loading
const firebaseConfig = {
  apiKey: "AIzaSyA306aIofubqZ6sHP2ID0X7Zs49El6JrKU",
  authDomain: "senali-235fb.firebaseapp.com",
  projectId: "senali-235fb",
  storageBucket: "senali-235fb.firebasestorage.app",
  messagingSenderId: "67286745357",
  appId: "1:67286745357:web:ec18d40025c29e2583b044",
  measurementId: "G-GE6PL1J1Q7"
};

console.log('Firebase initializing...', {
  projectId: firebaseConfig.projectId,
  apiKey: firebaseConfig.apiKey.substring(0, 10) + '...',
  authDomain: firebaseConfig.authDomain,
  appId: firebaseConfig.appId
});

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase config incomplete:', firebaseConfig);
  throw new Error('Firebase configuration is incomplete');
}

console.log('Firebase config validation passed');

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth provider
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Initialize Analytics
export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId
  ? getAnalytics(app) 
  : null;

export const useFirebase = true;

export default app;