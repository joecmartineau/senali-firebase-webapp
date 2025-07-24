import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, LogOut, Download, Trash2, Crown, Users, Shield } from "lucide-react";
import { Link } from "wouter";
import { CreditDisplay } from "@/components/subscription/credit-display";
import { InfinityIcon } from "@/components/ui/infinity-icon";
import { localChatService } from "@/services/local-chat-service";
import { subscriptionService, SUBSCRIPTION_LIMITS } from "@/services/subscription-service";
import { SubscriptionBanner } from "@/components/subscription/subscription-banner";
import { SubscriptionModal } from "@/components/subscription/subscription-modal";
import { FamilySidebar } from "@/components/family-sidebar";
import type { Message } from "@/lib/local-storage";

// Message interface now imported from local-storage

interface ChatInterfaceProps {
  user: any;
  onSignOut: () => void;
}

export function ChatInterface({ user, onSignOut }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showFamilySidebar, setShowFamilySidebar] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation history and subscription status
  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize subscription service
        await subscriptionService.initialize();
        setSubscriptionStatus(subscriptionService.getStatus());

        // Initialize chat service with authenticated user ID
        console.log('🔧 Initializing chat service with user:', user?.uid);
        await localChatService.init(user?.uid || 'anonymous');
        const historyMessages = await localChatService.loadConversationHistory();
        setMessages(historyMessages);
        
        // Get persistent trial message count (can't be reset by clearing chat)
        const trialCount = subscriptionService.getTrialMessageCount();
        setMessageCount(trialCount);

      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to welcome message
        setMessages([{
          id: 'welcome',
          content: "Hi there! I'm Senali, and I'm here to listen and support you. What's been on your mind lately?",
          role: 'assistant',
          timestamp: new Date(),
          userId: 'user-1'
        }]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadData();
  }, []);

  const scrollToBottom = () => {
    // Try multiple methods to ensure scrolling works
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Fallback method
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      } else {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Add a small delay to ensure DOM has updated
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check subscription limits (credit-based system)
    if (!subscriptionService.canSendMessage()) {
      if (subscriptionService.hasPremiumAccess()) {
        // Premium user with no credits
        const creditPromptMessage: Message = {
          id: `credit-prompt-${Date.now()}`,
          content: `I'd love to keep chatting, but you've used all your monthly credits! You can purchase more credits to continue our conversation, or your credits will renew next month with your subscription. Would you like to buy more credits now?`,
          role: 'assistant',
          timestamp: new Date(),
          userId: 'user-1'
        };
        setMessages(prev => [...prev, creditPromptMessage]);
      } else {
        // Free user reached trial limit
        const subscriptionPromptMessage: Message = {
          id: `subscription-prompt-${Date.now()}`,
          content: `I'd love to keep chatting with you, but you've used all 25 of your trial messages! I hope I've been helpful so far. To continue our conversation, would you like to upgrade to premium for $7.99/month? You'll get 1,000 credits per month, unlimited child profiles, and priority support. What do you think?`,
          role: 'assistant',
          timestamp: new Date(),
          userId: 'user-1'
        };
        setMessages(prev => [...prev, subscriptionPromptMessage]);
      }
      setShowSubscriptionModal(true);
      return;
    }

    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Use local chat service for everything
      const { userMessage, aiResponse } = await localChatService.sendMessage(messageContent);
      
      // Update UI with both messages
      setMessages(prev => [...prev, userMessage, aiResponse]);
      
      // Handle message counting/credits
      if (!subscriptionService.hasPremiumAccess()) {
        // For free users, increment trial message count
        subscriptionService.incrementTrialMessageCount();
        setMessageCount(subscriptionService.getTrialMessageCount());
      } else {
        // For premium users, credit was already spent in the service
        // Just update subscription status to reflect new credit balance
        setSubscriptionStatus(subscriptionService.getStatus());
      }
    } catch (error) {
      console.error('Chat error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm sorry, I'm having trouble responding right now. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        role: 'assistant',
        timestamp: new Date(),
        userId: 'user-1'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const data = await localChatService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `senali-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const clearConversation = async () => {
    if (confirm('Clear conversation history? Your child profiles and data will be kept safe.')) {
      try {
        await localChatService.clearChatHistory();
        setMessages([{
          id: 'welcome',
          content: "Hi there! I'm Senali, and I'm here to listen and support you. What's been on your mind lately?",
          role: 'assistant',
          timestamp: new Date(),
          userId: 'user-1'
        }]);
        // Don't reset message count - prevents unlimited free messages exploit
      } catch (error) {
        console.error('Clear conversation error:', error);
      }
    }
  };

  const clearAllData = async () => {
    if (confirm('⚠️ Clear ALL data including child profiles? This will permanently delete everything and cannot be undone.')) {
      try {
        await localChatService.clearAllData();
        setMessages([{
          id: 'welcome',
          content: "Hi there! I'm Senali, and I'm here to listen and support you. What's been on your mind lately?",
          role: 'assistant',
          timestamp: new Date(),
          userId: 'user-1'
        }]);
        setMessageCount(0);
      } catch (error) {
        console.error('Clear all data error:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <InfinityIcon size={32} glowing />
            <div>
              <h1 className="text-white font-semibold">Senali</h1>
              {subscriptionStatus && (
                <div className="flex items-center gap-2 mt-1">
                  {subscriptionStatus.isActive ? (
                    <div className="flex items-center gap-1">
                      <Crown className="w-3 h-3 text-yellow-400" />
                      <span className="text-yellow-400 text-xs">Premium</span>
                    </div>
                  ) : subscriptionStatus.isTrialActive ? (
                    <div className="flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400 text-xs">Trial ({subscriptionService.getDaysRemaining()}d)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400 text-xs">Trial ({messageCount}/{SUBSCRIPTION_LIMITS.free.trialMessages})</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-white text-sm font-medium">{user.displayName || user.email}</p>
              <p className="text-gray-400 text-xs">Data stored locally</p>
            </div>
            {!subscriptionService.hasPremiumAccess() && (
              <Button
                onClick={() => setShowSubscriptionModal(true)}
                variant="outline"
                size="sm"
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-900"
                title="Upgrade to Premium"
              >
                <Crown className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={exportData}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              title="Export your data"
              disabled={!subscriptionService.hasPremiumAccess()}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              onClick={clearConversation}
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-300 hover:bg-blue-800"
              title="Clear conversation (keeps profiles)"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Link href="/family-profiles">
              <Button
                variant="outline"
                size="sm"
                className="border-green-600 text-green-300 hover:bg-green-800"
                title="Manage family profiles"
              >
                <Users className="h-4 w-4" />
              </Button>
            </Link>
            
            {/* Admin Panel - Only visible for admin */}
            {user?.email === 'joecmartineau@gmail.com' && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-400 hover:bg-red-900"
                  title="Admin Panel"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Button
              onClick={onSignOut}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Banner */}
      <SubscriptionBanner onUpgrade={() => setShowSubscriptionModal(true)} />

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4">
        <Card className="h-[calc(100vh-200px)] bg-gray-900 border-gray-700 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading your conversation...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-transparent'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <InfinityIcon size={32} glowing />
                    )}
                  </div>
                  <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}>
                    <div className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent">
                    <InfinityIcon size={32} glowing />
                  </div>
                  <div className="bg-gray-800 text-gray-100 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  !subscriptionService.hasPremiumAccess() && messageCount >= SUBSCRIPTION_LIMITS.free.trialMessages
                    ? "Trial messages used up. Upgrade to Premium for unlimited messages!"
                    : isLoading 
                      ? "Thinking..." 
                      : "Share your family details to get started..."
                }
                className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                disabled={isLoading || (!subscriptionService.hasPremiumAccess() && messageCount >= SUBSCRIPTION_LIMITS.free.trialMessages)}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading || (!subscriptionService.hasPremiumAccess() && messageCount >= SUBSCRIPTION_LIMITS.free.trialMessages)}
                className="bg-green-500 hover:bg-green-600 text-black"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={() => {
          // Refresh subscription status after successful subscription
          subscriptionService.initialize().then(() => {
            setSubscriptionStatus(subscriptionService.getStatus());
          });
        }}
      />

      {/* Family Sidebar */}
      <FamilySidebar
        isOpen={showFamilySidebar}
        onClose={() => setShowFamilySidebar(false)}
        userId={user?.uid || user?.id || 'user-1'}
      />
    </div>
  );
}