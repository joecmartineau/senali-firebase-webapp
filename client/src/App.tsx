import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Lightbulb, Heart } from "lucide-react";
import { ParentingQuote } from "@/components/ParentingQuote";
import { InfinityIcon } from "@/components/ui/infinity-icon";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import FamilySetup from "@/pages/family-setup";
import FamilyProfiles from "@/pages/family-profiles";
import AdminPanel from "@/components/admin/admin-panel";
import ChatInterface from "@/pages/chat";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';



function SenaliApp() {
  // Firebase authentication state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Remove unused userProfile state since we eliminated the simple profile setup
  
  // Initialize Firebase auth listener
  useEffect(() => {
    console.log('Setting up Firebase auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', {
        email: firebaseUser?.email || 'No user',
        uid: firebaseUser?.uid || 'No UID',
        displayName: firebaseUser?.displayName || 'No display name'
      });
      
      // If user is signing in, sync their data with the server
      if (firebaseUser && firebaseUser !== user) {
        try {
          const response = await fetch('/api/auth/firebase-signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('User data synced on auth state change');
            // User data synced successfully
            console.log('User profile synced:', data.user);
          }
        } catch (syncError) {
          console.warn('Error syncing user data on auth state change:', syncError);
        }
      }
      
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  // Real Firebase Google sign in
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Firebase Google sign-in...');
      console.log('Current auth state before sign-in:', auth.currentUser?.email || 'No user');
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Sign-in successful! User details:', {
        email: result.user.email,
        uid: result.user.uid,
        displayName: result.user.displayName
      });
      
      // Sync user data with server for admin panel tracking
      try {
        const response = await fetch('/api/auth/firebase-signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('User data synced with server');
          // User data synced successfully
          console.log('User profile synced:', data.user);
        } else {
          console.warn('Failed to sync user data with server');
        }
      } catch (syncError) {
        console.warn('Error syncing user data:', syncError);
      }
      
      // Don't set loading to false here - let the auth state listener handle it
    } catch (error: any) {
      console.error('Firebase sign-in error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Sign-in failed. ';
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for sign-in. This usually happens when accessing the app from a new domain. The app administrator needs to add this domain to the Firebase Console under Authentication > Settings > Authorized domains.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage += 'Popup was blocked. Please allow popups for this site and try again.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage += 'Google sign-in is not enabled. Contact the app administrator.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage += 'Sign-in popup was closed. Please try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage += 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('missing initial state')) {
        errorMessage = 'Authentication error occurred. This may be due to browser restrictions or storage issues. Please try: 1) Refreshing the page 2) Clearing browser storage for this site 3) Using a different browser or incognito mode.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      alert(errorMessage);
      setLoading(false);
    }
  };
  const [hasProfiles, setHasProfiles] = useState(false);
  const [showProfilesMenu, setShowProfilesMenu] = useState(false);
  const [location] = useLocation();



  useEffect(() => {
    checkForExistingProfiles();
  }, []);

  const checkForExistingProfiles = async () => {
    try {
      // Check if user has saved family profiles in browser localStorage
      const saved = window.localStorage.getItem('senali_family_profiles');
      setHasProfiles(saved ? JSON.parse(saved).length > 0 : false);
    } catch (error) {
      console.error('Error checking profiles:', error);
      setHasProfiles(false);
    }
  };

  const onSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading Senali...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering app with user state:', user ? `Signed in as ${user.email}` : 'Not signed in');



  // Simple landing page
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-2xl">∞</span>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome to Senali</h1>
                <p className="text-gray-300 text-lg">
                  Sign in to connect with your AI therapist and friend
                </p>
              </div>
            </div>

            <div className="max-w-sm mx-auto">
              <Button
                onClick={signInWithGoogle}
                className="w-full bg-white text-black hover:bg-gray-100 font-medium py-3 px-6 rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show admin panel for specific email only
  if (user?.email === 'joecmartineau@gmail.com') {
    return <AdminPanel />;
  }

  // Skip the simple profile setup and go directly to family profiles
  // This eliminates the duplicate profile entry experience
  if (!hasProfiles) {
    return <FamilySetup onComplete={() => { setHasProfiles(true); setShowProfilesMenu(true); }} />;
  }

  // Show family profiles management
  if (showProfilesMenu) {
    return (
      <FamilyProfiles 
        onStartChat={() => setShowProfilesMenu(false)}
        onBack={() => { setHasProfiles(false); setShowProfilesMenu(false); }}
      />
    );
  }

  // User has profiles and is ready to chat
  return (
    <ChatInterface 
      user={user} 
      onSignOut={onSignOut}
      onManageProfiles={() => setShowProfilesMenu(true)}
    />
  );
}

function App() {
  console.log('App component rendering...');
  return <SenaliApp />;
}

export default App;
