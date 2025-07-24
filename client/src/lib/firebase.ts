import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA306aIofubqZ6sHP2ID0X7Zs49El6JrKU",
  authDomain: "senali-235fb.firebaseapp.com",
  projectId: "senali-235fb",
  storageBucket: "senali-235fb.firebasestorage.app",
  messagingSenderId: "67286745357",
  appId: "1:67286745357:web:ec18d40025c29e2583b044"
};

// Debug logging
console.log('Firebase config being used:', {
  apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId ? 'Present' : 'Missing'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;