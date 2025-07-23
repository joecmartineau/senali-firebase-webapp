import { auth, googleProvider, useFirebase } from '@/lib/firebase';

export function debugFirebaseConfig() {
  console.log('=== Firebase Debug Info ===');
  console.log('Firebase enabled:', useFirebase);
  
  if (useFirebase && auth) {
    console.log('Auth instance:', auth);
    console.log('Google Provider:', googleProvider);
    console.log('Current user:', auth.currentUser);
    
    // Test Firebase connection
    try {
      console.log('Firebase project ID:', auth.app?.options.projectId);
      console.log('Firebase auth domain:', auth.app?.options.authDomain);
      console.log('Firebase API key exists:', !!auth.app?.options.apiKey);
    } catch (error) {
      console.error('Firebase config error:', error);
    }
  } else {
    console.log('Firebase not available - using fallback mode');
  }
}