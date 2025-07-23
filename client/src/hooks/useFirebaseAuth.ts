import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences?: {
    childrenAges?: number[];
    primaryConcerns?: string[];
    communicationStyle?: 'detailed' | 'concise';
  };
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log('Setting up Firebase auth listener...');
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            console.log('Firebase user authenticated:', firebaseUser);
            const userProfile = await getUserProfile(firebaseUser);
            setUser(userProfile);
          } else {
            console.log('No Firebase user');
            setUser(null);
          }
        } catch (profileError) {
          console.error('Error getting user profile:', profileError);
          setError('Failed to load user profile');
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      });

      return unsubscribe;
    } catch (authError) {
      console.error('Error setting up auth listener:', authError);
      setError('Authentication setup failed');
      setIsLoading(false);
      return () => {};
    }
  }, []);

  const createOrUpdateUserProfile = async (firebaseUser: User): Promise<void> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user profile
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        preferences: {
          childrenAges: [],
          primaryConcerns: [],
          communicationStyle: 'detailed'
        }
      });
    } else {
      // Update last login time
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    }
  };

  const getUserProfile = async (firebaseUser: User): Promise<UserProfile> => {
    try {
      await createOrUpdateUserProfile(firebaseUser);
      
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      
      // Fallback to Firebase user data if Firestore profile doesn't exist
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Anonymous User',
        photoURL: firebaseUser.photoURL || undefined
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      // Return basic profile on error
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Anonymous User',
        photoURL: firebaseUser.photoURL || undefined
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting Google sign in...');
      console.log('Auth object:', auth);
      console.log('Google provider:', googleProvider);
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign in successful:', result.user);
      
      // User profile will be set by onAuthStateChanged
    } catch (error) {
      const authError = error as AuthError;
      console.error('Google sign in error details:', {
        code: authError.code,
        message: authError.message,
        customData: authError.customData
      });
      
      let errorMessage = 'Failed to sign in with Google';
      switch (authError.code) {
        case 'auth/invalid-api-key':
          errorMessage = 'Firebase API key is invalid. Please check Firebase Console configuration.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups for this site.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Google sign-in is not enabled in Firebase Console.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'This domain is not authorized. Please add it to Firebase Console.';
          break;
        default:
          errorMessage = authError.message || 'Failed to sign in with Google';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    if (!user) return;
    
    try {
      setError(null);
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        preferences: { ...user.preferences, ...preferences }
      }, { merge: true });
      
      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        preferences: { ...prev.preferences, ...preferences }
      } : null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut,
    updatePreferences
  };
}