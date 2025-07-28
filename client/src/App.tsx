import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Lightbulb, Heart } from "lucide-react";
import { ParentingQuote } from "@/components/ParentingQuote";
import { InfinityIcon } from "@/components/ui/infinity-icon";
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
// import FamilySetup from "@/pages/family-setup"; // Removed - causes React hook errors
// import FamilyProfilesNew from "@/pages/family-profiles-new"; // Removed for MVP
import AdminPanel from "@/components/admin/admin-panel";
import ChatInterface from "@/pages/chat";
import SubscriptionPage from "@/pages/subscription";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { createDemoUser, enableDemoMode, getDemoUser, signOutDemo } from "@/lib/demo-auth";
import AdMobBanner from "@/components/ads/AdMobBanner";



function SenaliApp() {
  // Firebase authentication state - explicit React import to fix hooks
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  // Remove unused userProfile state since we eliminated the simple profile setup
  
  // Initialize auth listener (Firebase with demo fallback)
  React.useEffect(() => {
    console.log('Setting up auth listener...');
    
    // Check for demo user first
    const demoUser = getDemoUser();
    if (demoUser) {
      console.log('Using demo user:', demoUser.email);
      setUser(demoUser as any);
      setLoading(false);
      return;
    }
    
    // Try Firebase auth
    try {
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
    } catch (error) {
      console.error('Firebase auth setup failed:', error);
      
      // If Firebase fails, check if we have cached family profiles and create a demo user
      const savedProfiles = window.localStorage.getItem('senali_family_profiles');
      if (savedProfiles) {
        console.log('Found cached family profiles, creating demo user for session');
        const demoUser = createDemoUser();
        setUser(demoUser as any);
      }
      
      setLoading(false);
    }
  }, []);
  
  // Authentication with Firebase and demo fallback
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in...');
      
      // Try Firebase first
      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Firebase sign-in successful!', result.user.email);
        
        // Sync with server
        await fetch('/api/auth/firebase-signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL
          })
        });
        
      } catch (firebaseError: any) {
        console.log('Firebase sign-in failed, using demo mode:', firebaseError.code);
        
        // Fallback to demo mode for testing
        enableDemoMode();
        const demoUser = createDemoUser();
        
        // Sync demo user with server
        await fetch('/api/auth/firebase-signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: demoUser.uid,
            email: demoUser.email,
            displayName: demoUser.displayName,
            photoURL: demoUser.photoURL
          })
        });
        
        setUser(demoUser as any);
        localStorage.setItem('senali_demo_user', JSON.stringify(demoUser));
      }
      
    } catch (error: any) {
      console.error('All sign-in methods failed:', error);
      alert('Unable to sign in. Please try refreshing the page.');
    }
  };
  const [showProfilesMenu, setShowProfilesMenu] = React.useState(false); // Restored for new profiles system
  const [showSubscription, setShowSubscription] = React.useState(false);
  const [showAdminChat, setShowAdminChat] = React.useState(false);
  const [location] = useLocation();



  // Family profile code removed - deleting family profile system

  const onSignOut = async () => {
    try {
      console.log('🔴 SIGNOUT: Starting sign out process');
      console.log('🔴 Current user:', user);
      
      // Clear all local data first
      setUser(null);
      // setShowProfilesMenu(false); // Removed - deleting family profile system
      setShowSubscription(false);
      setShowAdminChat(false);
      
      // Clear localStorage (but keep family profiles - users want those to persist)
      window.localStorage.removeItem('senali_demo_user');
      // DON'T remove family profiles - users want these to persist across sessions
      // window.localStorage.removeItem('senali_family_profiles'); 
      window.localStorage.removeItem('senali_messages');
      window.localStorage.removeItem('senali_conversation_summary');
      
      console.log('Sign out complete - family profiles preserved in localStorage');
      
      // Check if in demo mode
      const demoUser = getDemoUser();
      if (demoUser) {
        console.log('🔴 SIGNOUT: Demo user, clearing demo data');
        signOutDemo();
      } else {
        console.log('🔴 SIGNOUT: Firebase user, signing out');
        await signOut(auth);
      }
      
      console.log('🔴 SIGNOUT: User signed out successfully');
      
      // Force page reload to ensure clean state
      window.location.reload();
      
    } catch (error) {
      console.error('🔴 SIGNOUT: Error signing out:', error);
      // Force page reload even on error to clear state
      window.location.reload();
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg">Loading Senali...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering app with user state:', user ? `Signed in as ${user.email}` : 'Not signed in');



  // Simple landing page or session recovery
  if (!user) {
    // Check if user has existing family profiles (session recovery) - check for any user-specific storage
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('senali_family_members_'));
    if (allKeys.length > 0) {
      console.log('🔄 Session recovery: Found family profiles for previous users');
      // For session recovery, use the first found profile set
      const firstKey = allKeys[0];
      const userId = firstKey.replace('senali_family_members_', '');
      const demoUser = {
        uid: userId,
        email: userId.includes('@') ? userId : 'user@demo.local',
        displayName: 'Demo User',
        photoURL: null
      };
      setUser(demoUser as any);
      return null; // Will re-render with user set
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-6 bg-white rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">∞</span>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Senali</h1>
                <p className="text-gray-600 text-lg">
                  Sign in to connect with your AI parenting coach and friend
                </p>
              </div>
            </div>

            <div className="max-w-sm mx-auto">
              <Button
                onClick={signInWithGoogle}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-medium py-3 px-6 rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-emerald-200 border-t-white rounded-full animate-spin"></div>
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
  if (user?.email === 'joecmartineau@gmail.com' && !showAdminChat) {
    return <AdminPanel onGoToChat={() => setShowAdminChat(true)} />;
  }
  
  // Admin chat access - bypass profile requirement
  if (user?.email === 'joecmartineau@gmail.com' && showAdminChat) {
    return (
      <ChatInterface 
        user={user} 
        onSignOut={onSignOut}
        onManageProfiles={() => setShowAdminChat(false)} // Go back to admin panel
        onManageSubscription={() => setShowSubscription(true)}
      />
    );
  }

  // Family profiles removed for MVP
  if (showProfilesMenu) {
    alert('Family profiles feature coming soon!');
    setShowProfilesMenu(false);
    return null;
  }

  // Show subscription page
  if (showSubscription) {
    return (
      <SubscriptionPage 
        user={user}
        onBack={() => setShowSubscription(false)}
      />
    );
  }

  // Go directly to chat - family profiles removed
  return (
    <ChatInterface 
      user={user} 
      onSignOut={onSignOut}
      onManageProfiles={() => setShowProfilesMenu(true)} // Family profiles coming soon
      onManageSubscription={() => setShowSubscription(true)}
    />
  );
}

function App() {
  console.log('App component rendering...');
  return <SenaliApp />;
}

export default App;
