import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, MessageCircle, Lightbulb, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";

// Initialize Firebase directly to avoid import issues
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA306aIofubqZ6sHP2ID0X7Zs49El6JrKU",
  authDomain: "senali-235fb.firebaseapp.com",
  projectId: "senali-235fb",
  storageBucket: "senali-235fb.firebasestorage.app",
  messagingSenderId: "67286745357",
  appId: "1:67286745357:web:ec18d40025c29e2583b044",
  measurementId: "G-GE6PL1J1Q7"
};

// Override redirect URL to use HTTP instead of HTTPS for Replit
const currentDomain = window.location.origin;
console.log('🔧 Current domain for redirect:', currentDomain);

console.log('🔧 Starting Firebase initialization...');
console.log('🔧 Current domain:', window.location.origin);
console.log('🔧 Current hostname:', window.location.hostname);
console.log('🔧 Current protocol:', window.location.protocol);
console.log('🔧 Firebase config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKeyPrefix: firebaseConfig.apiKey.substring(0, 10) + '...'
});

// Test domain accessibility
fetch(window.location.origin + '/test', { method: 'HEAD' })
  .then(() => console.log('✅ Domain is accessible'))
  .catch(() => console.log('❌ Domain accessibility test failed'));

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('🔧 Firebase app initialized successfully');

const auth = getAuth(app);
console.log('🔧 Firebase Auth initialized');

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
// Configure for mobile-friendly authentication
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: '', // Allow any domain
});
console.log('🔧 Google Auth Provider configured for mobile');

function SenaliApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);



  useEffect(() => {
    console.log('🔥 Setting up Firebase auth listener...');
    console.log('🔥 Firebase config loaded:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });
    
    // Check for redirect result first
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('🔥 Redirect sign-in successful!', {
            email: result.user.email,
            displayName: result.user.displayName
          });
        }
      })
      .catch((error) => {
        console.error('🚨 Redirect error:', error);
        alert(`Sign-in failed: ${error.message}`);
      });
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('🔥 Auth state changed:', !!firebaseUser);
      if (firebaseUser) {
        console.log('🔥 User details:', {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          uid: firebaseUser.uid
        });
      }
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    console.log('🚀 Starting Google sign-in with redirect (mobile optimized)...');
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Use redirect directly for mobile environments
      console.log('🚀 Initiating redirect to Google...');
      await signInWithRedirect(auth, googleProvider);
      
    } catch (error: any) {
      console.error('🚨 Sign-in error:', error);
      console.error('🚨 Error code:', error.code);
      console.error('🚨 Error message:', error.message);
      
      // Show user-friendly error messages with domain info
      let friendlyMessage = 'Sign-in failed. ';
      if (error.code === 'auth/unauthorized-domain') {
        friendlyMessage += `\n\nCurrent domain: ${window.location.hostname}\n\nPlease add this domain to Firebase Console:\nAuthentication → Settings → Authorized domains`;
      } else if (error.code === 'auth/operation-not-allowed') {
        friendlyMessage += 'Google sign-in not enabled in Firebase.';
      } else {
        friendlyMessage += error.message || 'Please try again.';
      }
      
      alert(friendlyMessage);
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading Senali...</p>
        </div>
      </div>
    );
  }

  // Show chat interface if user is signed in
  if (user) {
    return <ChatInterface user={user} onSignOut={handleSignOut} />;
  }

  // Show landing page if not signed in

  // Landing page content

  return (
    <div className="min-h-screen bg-black">
      <div className="px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="h-10 w-10 text-black" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Senali
          </h1>
          
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            AI-powered support for parents of neurodivergent children. Get personalized guidance, daily tips, and a supportive community.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">AI Chat Support</h3>
                    <p className="text-sm text-gray-300">
                      Get instant guidance for ADHD, autism, and other neurodivergent needs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">Daily Tips</h3>
                    <p className="text-sm text-gray-300">
                      Personalized parenting strategies delivered every day
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">Community Support</h3>
                    <p className="text-sm text-gray-300">
                      Connect with other parents on similar journeys
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sign In Button */}
          <Button 
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold h-12 rounded-xl disabled:opacity-50"
          >
            <div className="flex items-center justify-center space-x-3">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="font-medium">
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </div>
          </Button>



          <p className="text-gray-500 text-xs mt-4">
            Sign in to access personalized AI support and daily parenting tips
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  console.log('App component rendering...');
  return <SenaliApp />;
}

export default App;
