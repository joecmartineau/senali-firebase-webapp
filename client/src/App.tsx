import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Lightbulb, Heart } from "lucide-react";
import { ParentingQuote } from "@/components/ParentingQuote";
import { InfinityIcon } from "@/components/ui/infinity-icon";
import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Router, Route, Switch, useLocation } from "wouter";
import FamilySetup from "@/pages/family-setup";
import Questionnaires from "@/pages/questionnaires";
import { FamilyProfiles } from "@/pages/family-profiles";
import { AdminPanel } from "@/components/admin/admin-panel";
import { localStorage } from "@/lib/local-storage";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';



function SenaliApp() {
  // Firebase authentication state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize Firebase auth listener
  useEffect(() => {
    console.log('Setting up Firebase auth listener...');
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email || 'No user');
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  // Real Firebase Google sign in
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Starting Firebase Google sign-in...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Sign-in successful:', result.user.email);
    } catch (error: any) {
      console.error('Firebase sign-in error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Sign-in failed. ';
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage += 'This domain is not authorized. Please add your domain to Firebase Console.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage += 'Popup was blocked. Please allow popups for this site.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage += 'Google sign-in is not enabled in Firebase Console.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
      setLoading(false);
    }
  };
  const [hasProfiles, setHasProfiles] = useState(false);
  const [location] = useLocation();



  useEffect(() => {
    checkForExistingProfiles();
  }, []);

  const checkForExistingProfiles = async () => {
    try {
      // For now, assume no profiles
      setHasProfiles(false);
    } catch (error) {
      console.error('Error checking profiles:', error);
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



  // Landing page component
  const LandingPage = () => (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <InfinityIcon className="w-16 h-16 text-green-400" />
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

  // Return main app
  return user ? (
    <Switch>
      <Route path="/family-setup">
        <FamilySetup />
      </Route>
      <Route path="/family-profiles">
        <FamilyProfiles user={user} />
      </Route>
      <Route path="/questionnaires">
        <Questionnaires />
      </Route>
      <Route path="/assessment/:profileId">
        {(params) => <Questionnaires profileId={params.profileId} />}
      </Route>
      <Route path="/admin">
        <AdminPanel />
      </Route>
      <Route path="/chat">
        <ChatInterface user={user} onSignOut={onSignOut} />
      </Route>
      <Route path="/">
        {hasProfiles ? (
          <ChatInterface user={user} onSignOut={onSignOut} />
        ) : (
          <FamilySetup />
        )}
      </Route>
    </Switch>
  ) : (
    <LandingPage />
  );
}

function App() {
  console.log('App component rendering...');
  return <SenaliApp />;
}

export default App;
