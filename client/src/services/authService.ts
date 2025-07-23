import { 
  signInWithPopup, 
  signOut, 
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
      const result = await signInWithPopup(auth, googleProvider);
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
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
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
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return new Error('Sign-in was cancelled. Please try again.');
      case 'auth/popup-blocked':
        return new Error('Popup was blocked. Please allow popups for this site.');
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your internet connection.');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later.');
      default:
        return new Error('Authentication failed. Please try again.');
    }
  }
}

export const authService = new AuthService();
export default authService;