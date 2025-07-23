import { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfile {
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

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: any | null;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate demo login
      setTimeout(() => {
        const demoUser: UserProfile = {
          uid: 'demo-user-123',
          email: 'demo@senali.app',
          displayName: 'Demo Parent',
          photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          preferences: {
            childrenAges: [8, 12],
            primaryConcerns: ['ADHD', 'Focus', 'Social Skills'],
            communicationStyle: 'detailed'
          }
        };
        setUser(demoUser);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setUser(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      setError(errorMessage);
      throw error;
    }
  };

  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    if (!user) return;
    
    try {
      setError(null);
      setUser(prev => prev ? {
        ...prev,
        preferences: { ...prev.preferences, ...preferences }
      } : null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
      setError(errorMessage);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser: null,
    isLoading,
    error,
    signInWithGoogle,
    signOut,
    updatePreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useFirebaseAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuthContext must be used within FirebaseAuthProvider');
  }
  return context;
}