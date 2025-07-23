import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FirebaseAuthProvider } from "@/components/auth/firebase-auth-provider";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Landing from "@/pages/landing";

function Router() {
  try {
    const { user, isLoading, error } = useFirebaseAuth();
    
    console.log('Router render:', { user: !!user, isLoading, error });

    if (error) {
      console.error('Firebase auth error in router:', error);
      // Show landing page even with auth errors
      return <Landing />;
    }

    if (isLoading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      );
    }

    return (
      <Switch>
        {!user ? (
          <Route path="/" component={Landing} />
        ) : (
          <Route path="/" component={Home} />
        )}
        <Route component={NotFound} />
      </Switch>
    );
  } catch (error) {
    console.error('Router error:', error);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading Senali...</div>
      </div>
    );
  }
}

function App() {
  console.log('App component rendering...');
  
  // Temporary: Show landing page directly to debug white screen
  return (
    <div className="min-h-screen bg-black">
      <Landing />
    </div>
  );
}

export default App;
