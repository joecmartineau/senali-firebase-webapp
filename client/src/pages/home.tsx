import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/navigation/bottom-navigation";
import ChatInterface from "@/components/chat/chat-interface";
import TipsView from "@/components/tips/tips-view";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("chat");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
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
    <div className="min-h-screen bg-black flex flex-col">
      <AppHeader />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "chat" && <ChatInterface />}
        {activeTab === "tips" && <TipsView />}
        {activeTab === "history" && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-neuro-text-secondary">Chat History - Coming Soon</p>
          </div>
        )}
        {activeTab === "profile" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-neuro-text-secondary mb-4">Profile Settings - Coming Soon</p>
              <button 
                onClick={() => window.location.href = "/api/logout"}
                className="text-destructive hover:underline"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
