import { useState, useEffect } from 'react';
import { authService, UserProfile } from '@/services/authService';

export function useFirebaseAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await authService.signInWithGoogle();
      setUser(user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign out');
    }
  };

  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    if (!user) return;
    
    try {
      setError(null);
      await authService.updateUserPreferences(user.uid, preferences);
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