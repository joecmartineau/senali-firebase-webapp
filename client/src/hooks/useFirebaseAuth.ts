import { useState, useEffect } from 'react';

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
      setError(error instanceof Error ? error.message : 'Failed to sign in');
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign out');
    }
  };

  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    if (!user) return;
    
    try {
      setError(null);
      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        preferences: { ...prev.preferences, ...preferences }
      } : null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update preferences');
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