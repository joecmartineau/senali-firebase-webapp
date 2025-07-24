import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBqO8O-3--wKFmV8Uy2M1SG2RDBSwePLmo",
  authDomain: "senali-235fb.firebaseapp.com",
  projectId: "senali-235fb",
  storageBucket: "senali-235fb.firebasestorage.app",
  messagingSenderId: "493244463693",
  appId: "1:493244463693:web:eec3d8b4b9b85be30b17d0"
};

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