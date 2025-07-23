import { auth, googleProvider } from '@/lib/firebase';

export function debugFirebaseConfig() {
  console.log('=== Firebase Debug Info ===');
  console.log('Auth instance:', auth);
  console.log('Google Provider:', googleProvider);
  console.log('Auth app:', auth.app);
  console.log('Auth config:', auth.config);
  console.log('Current user:', auth.currentUser);
  
  // Test Firebase connection
  try {
    console.log('Firebase project ID:', auth.app.options.projectId);
    console.log('Firebase auth domain:', auth.app.options.authDomain);
    console.log('Firebase API key exists:', !!auth.app.options.apiKey);
  } catch (error) {
    console.error('Firebase config error:', error);
  }
}