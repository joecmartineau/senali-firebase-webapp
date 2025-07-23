import { ReactNode } from 'react';

// Simple wrapper component - authentication is now handled by useFirebaseAuth hook
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Deprecated - use useFirebaseAuth hook instead
export function useFirebaseAuthContext() {
  throw new Error('useFirebaseAuthContext is deprecated. Use useFirebaseAuth hook instead.');
}