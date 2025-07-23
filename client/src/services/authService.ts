import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db, useFirebase } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt?: any;
  lastLoginAt?: any;
  preferences?: {
    childrenAges?: number[];
    primaryConcerns?: string[];
    communicationStyle?: 'detailed' | 'concise';
  };
}

class AuthService {
  // Sign in with Google
  async signInWithGoogle(): Promise<UserProfile | null> {
    try {
      if (!useFirebase || !auth || !googleProvider) {
        console.log('Firebase not available, simulating login...');
        // Return mock user for development
        const mockUser: UserProfile = {
          uid: 'demo-user-123',
          email: 'demo@example.com',
          displayName: 'Demo User',
          photoURL: 'https://via.placeholder.com/100',
          preferences: {
            childrenAges: [8],
            primaryConcerns: ['ADHD', 'Focus'],
            communicationStyle: 'detailed'
          }
        };
        return mockUser;
      }
      
      console.log('Starting signInWithPopup...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('signInWithPopup completed:', result);
      const user = result.user;
      
      // Create or update user profile in Firestore
      await this.createOrUpdateUserProfile(user);
      
      return this.mapFirebaseUserToProfile(user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      if (!useFirebase || !auth) {
        console.log('Firebase not available, simulating logout...');
        return;
      }
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    if (!useFirebase || !auth) {
      console.log('Firebase not available, using fallback auth state');
      // Return empty unsubscribe function for fallback mode
      setTimeout(() => callback(null), 100);
      return () => {};
    }
    
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional profile data from Firestore
        const profile = await this.getUserProfile(user.uid);
        callback(profile);
      } else {
        callback(null);
      }
    });
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Create or update user profile in Firestore
  private async createOrUpdateUserProfile(user: User): Promise<void> {
    if (!useFirebase || !db) {
      console.log('Firestore not available, skipping user profile creation');
      return;
    }
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user profile
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
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
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      if (!useFirebase || !db) {
        console.log('Firestore not available, returning basic profile');
        return {
          uid,
          email: 'demo@example.com',
          displayName: 'Demo User'
        };
      }
      
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user preferences
  async updateUserPreferences(uid: string, preferences: Partial<UserProfile['preferences']>): Promise<void> {
    try {
      if (!useFirebase || !db) {
        console.log('Firestore not available, preferences update skipped');
        return;
      }
      
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        preferences: preferences
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Map Firebase User to UserProfile
  private mapFirebaseUserToProfile(user: User): UserProfile {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || undefined,
    };
  }

  // Handle authentication errors
  private handleAuthError(error: AuthError): Error {
    console.error('Firebase Auth Error Details:', {
      code: error.code,
      message: error.message,
      customData: error.customData
    });
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return new Error('Sign-in was cancelled. Please try again.');
      case 'auth/popup-blocked':
        return new Error('Popup was blocked. Please allow popups for this site.');
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your internet connection.');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later.');
      case 'auth/configuration-not-found':
        return new Error('Google sign-in is not configured. Please contact support.');
      case 'auth/operation-not-allowed':
        return new Error('Google sign-in is not enabled. Please contact support.');
      case 'auth/invalid-api-key':
        return new Error('Invalid Firebase configuration. Please contact support.');
      default:
        return new Error(`Authentication failed: ${error.message || 'Please try again.'}`);
    }
  }
}

export const authService = new AuthService();
export default authService;