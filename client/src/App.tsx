import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, MessageCircle, Lightbulb, Heart } from "lucide-react";
import { useState, useEffect } from "react";

// Simple landing page component with dynamic Firebase loading
function SimpleLanding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // Load Firebase dynamically with detailed error tracking
    const loadFirebase = async () => {
      try {
        console.log('=== FIREBASE LOADING START ===');
        console.log('Attempting to import Firebase...');
        
        // Try importing Firebase modules step by step
        const firebaseApp = await import('firebase/app');
        console.log('Firebase app imported:', !!firebaseApp);
        
        const firebaseAuth = await import('firebase/auth');
        console.log('Firebase auth imported:', !!firebaseAuth);
        
        const firebaseModule = await import('@/lib/firebase');
        console.log('Firebase config module imported:', !!firebaseModule);
        console.log('Available exports:', Object.keys(firebaseModule));
        
        const { auth, googleProvider } = firebaseModule;
        console.log('Auth object:', !!auth);
        console.log('Google provider:', !!googleProvider);
        
        if (!auth || !googleProvider) {
          throw new Error('Firebase auth or provider not properly initialized');
        }
        
        console.log('Firebase loaded successfully');
        setFirebaseReady(true);
        
        // Set up auth state listener
        firebaseAuth.onAuthStateChanged(auth, (user) => {
          console.log('Auth state changed:', !!user);
          if (user) {
            console.log('User signed in:', user.email);
            setUser(user);
          } else {
            console.log('User signed out');
            setUser(null);
          }
          setIsLoading(false);
        });
        
        console.log('=== FIREBASE LOADING COMPLETE ===');
      } catch (error: any) {
        console.error('=== FIREBASE LOADING ERROR ===');
        console.error('Error details:', error);
        console.error('Error stack:', error?.stack);
        setError(`Failed to initialize authentication: ${error.message}`);
        setFirebaseReady(false);
        setIsLoading(false);
      }
    };

    loadFirebase();
  }, []);

  const handleSignIn = async () => {
    if (!firebaseReady) {
      alert('Authentication is still loading. Please wait a moment and try again.');
      return;
    }

    console.log('Attempting Firebase sign in...');
    try {
      setIsLoading(true);
      setError(null);
      
      const { auth, googleProvider } = await import('@/lib/firebase');
      const { signInWithPopup } = await import('firebase/auth');
      
      console.log('Starting Google sign in...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Sign in successful:', result.user);
      // User will be set by onAuthStateChanged listener
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please add it to Firebase Console.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // If user is logged in, show success
  if (user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to Senali!</h1>
          <p className="text-gray-300 mb-4">Hi {user.displayName || user.email}!</p>
          <p className="text-gray-400 text-sm">Firebase authentication is working correctly.</p>
        </div>
      </div>
    );
  }

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

          {error && (
            <div className="mt-4 p-3 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm font-medium">Authentication Error</p>
              <p className="text-red-200 text-xs mt-1">{error}</p>
              {error.includes('invalid-api-key') && (
                <div className="mt-2 text-xs text-red-200">
                  <p>To fix this:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Go to Firebase Console → Authentication → Settings</li>
                    <li>Add your domain to Authorized domains list</li>
                    <li>Verify Google sign-in is enabled</li>
                  </ol>
                </div>
              )}
            </div>
          )}

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
  
  return (
    <div className="min-h-screen bg-black">
      <SimpleLanding />
    </div>
  );
}

export default App;
