import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppHeader from "@/components/layout/app-header";
import MobileHeader from "@/components/layout/mobile-header";
import InstallPrompt from "@/components/pwa/install-prompt";
import OfflineIndicator from "@/components/ui/offline-indicator";
import BottomNavigation from "@/components/navigation/bottom-navigation";
import ChatInterface from "@/components/chat/chat-interface";
import TipsView from "@/components/tips/tips-view";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, signOut } = useFirebaseAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>("chat");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      // Will be handled by Firebase auth state change
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-neuro-background flex flex-col no-pull-refresh touch-manipulation">
      {/* Mobile status bar simulation when in standalone mode */}
      {isMobile && <MobileHeader />}
      
      <AppHeader />
      
      <main className="flex-1 flex flex-col overflow-hidden mobile-scroll safe-area-inset-bottom">
        {activeTab === "chat" && <ChatInterface />}
        {activeTab === "tips" && <TipsView />}
        {activeTab === "history" && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-neuro-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-neuro-text-primary mb-2">Chat History</h3>
              <p className="text-neuro-text-secondary text-sm">
                Your conversation history will appear here soon. We're working on this feature!
              </p>
            </div>
          </div>
        )}
        {activeTab === "profile" && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-neuro-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-lg font-semibold text-neuro-text-primary mb-2">Profile Settings</h3>
              <p className="text-neuro-text-secondary text-sm mb-6">
                Customize your experience and manage your account settings.
              </p>
              <button 
                onClick={signOut}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors min-h-[44px] touch-manipulation"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* PWA Features */}
      <InstallPrompt />
      <OfflineIndicator />
    </div>
  );
}
