import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'firebase/auth';
import { MessageCircle, Send, LogOut, Users, Crown, Settings } from 'lucide-react';
import { InfinityIcon } from '@/components/ui/infinity-icon';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  user: User;
  onSignOut: () => void;
  onManageProfiles: () => void;
  onManageSubscription: () => void;
}

export default function ChatInterface({ user, onSignOut, onManageProfiles, onManageSubscription }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [familyProfiles, setFamilyProfiles] = useState<any[]>([]);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [conversationSummary, setConversationSummary] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local storage keys
  const MESSAGES_KEY = `senali_messages_${user.uid}`;
  const SUMMARY_KEY = `senali_summary_${user.uid}`;
  const MAX_MESSAGES = 1000;

  // Load messages from local storage
  const loadMessages = () => {
    try {
      const savedMessages = window.localStorage.getItem(MESSAGES_KEY);
      const savedSummary = window.localStorage.getItem(SUMMARY_KEY);
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } else {
        // First time - add welcome message
        const welcomeMessage: Message = {
          id: '1',
          content: "Hi there! I'm Senali, your AI parenting coach and friend. What's been on your mind lately?",
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        saveMessagesToStorage([welcomeMessage]);
      }
      
      if (savedSummary) {
        setConversationSummary(savedSummary);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Save messages to local storage (keep only last 1000)
  const saveMessagesToStorage = (messagesArray: Message[]) => {
    try {
      const messagesToSave = messagesArray.slice(-MAX_MESSAGES);
      window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  // Save conversation summary
  const saveSummaryToStorage = (summary: string) => {
    try {
      window.localStorage.setItem(SUMMARY_KEY, summary);
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Load family profiles from localStorage
    try {
      const saved = window.localStorage.getItem('senali_family_profiles');
      if (saved) {
        setFamilyProfiles(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading family profiles:', error);
    }

    // Load initial credit count using new subscription endpoint
    const loadCredits = async () => {
      try {
        // First ensure user exists in database
        await fetch('/api/auth/firebase-signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          })
        });
        
        // Get subscription status and credits
        const response = await fetch(`/api/subscriptions/status/${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          setCreditsRemaining(data.credits);
        }
      } catch (error) {
        console.error('Error loading credits:', error);
      }
    };

    loadCredits();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    console.log('🔴 CHAT DEBUG: Starting sendMessage');
    console.log('🔴 User object:', user);
    console.log('🔴 User email:', user?.email);
    console.log('🔴 User UID:', user?.uid);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get recent messages for context (last 10 messages)
      const recentMessages = updatedMessages.slice(-10);
      
      const requestPayload = {
        message: inputMessage,
        familyContext: familyProfiles,
        userUid: user.email === 'joecmartineau@gmail.com' ? 'admin-user' : user.uid,
        conversationSummary: conversationSummary,
        recentMessages: recentMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };

      console.log('🔴 API Request payload:', requestPayload);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      console.log('🔴 API Response status:', response.status);
      console.log('🔴 API Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🔴 API Response data:', data);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date()
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        
        // Save messages to local storage
        saveMessagesToStorage(finalMessages);
        
        // Update conversation summary if provided
        if (data.updatedSummary) {
          setConversationSummary(data.updatedSummary);
          saveSummaryToStorage(data.updatedSummary);
        }
        
        // Update credits if provided
        if (typeof data.creditsRemaining === 'number') {
          setCreditsRemaining(data.creditsRemaining);
        }
      } else if (response.status === 403) {
        // Handle no credits error
        const errorData = await response.json();
        console.log('🔴 403 Error data:', errorData);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "You've used all your credits! To continue our conversation, you can subscribe for $7.99/month to get 1,000 credits, or purchase additional credits. Click the 'Subscription' button above to see your options.",
          role: 'assistant',
          timestamp: new Date()
        };
        const finalMessages = [...updatedMessages, errorMessage];
        setMessages(finalMessages);
        saveMessagesToStorage(finalMessages);
        setCreditsRemaining(0);
      } else {
        const errorText = await response.text();
        console.log('🔴 HTTP Error Response:', errorText);
        throw new Error(`Failed to get AI response: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('🔴 DETAILED ERROR sending message:', error);
      console.error('🔴 Error type:', typeof error);
      console.error('🔴 Error message:', error instanceof Error ? error.message : String(error));
      console.error('🔴 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm sorry, I'm having trouble responding right now. Error: ${error instanceof Error ? error.message : String(error)}. Please try again.`,
        role: 'assistant',
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveMessagesToStorage(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearProfiles = () => {
    if (confirm('Are you sure you want to clear all family profiles? This will restart the setup process.')) {
      window.localStorage.removeItem('senali_family_profiles');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-green-500/20 p-3 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* Top row - Logo and credits */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <InfinityIcon size={32} glowing />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent">
                  Senali
                </h1>
                <p className="text-xs text-gray-300 leading-none">
                  Your AI parenting coach and friend
                </p>
              </div>
            </div>
            {creditsRemaining !== null && (
              <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="text-green-300 text-xs font-medium">
                  {creditsRemaining} credits
                </span>
              </div>
            )}
          </div>
          
          {/* Bottom row - Action buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Button
              onClick={onManageProfiles}
              variant="outline"
              size="sm"
              className={`${user.email === 'joecmartineau@gmail.com' 
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30' 
                : 'bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/70'
              } text-xs whitespace-nowrap flex-shrink-0 px-2 py-1 h-7`}
            >
              {user.email === 'joecmartineau@gmail.com' ? (
                <>
                  <Settings className="w-3 h-3 mr-1" />
                  Admin Panel
                </>
              ) : (
                <>
                  <Users className="w-3 h-3 mr-1" />
                  Profiles
                </>
              )}
            </Button>
            <Button
              onClick={onManageSubscription}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-300 hover:from-yellow-500/30 hover:to-yellow-600/30 text-xs whitespace-nowrap flex-shrink-0 px-2 py-1 h-7"
            >
              <Crown className="w-3 h-3 mr-1" />
              Subscription
            </Button>
            <Button
              onClick={onSignOut}
              variant="outline"
              size="sm"
              className="bg-gray-800/50 border-gray-600/50 text-white hover:bg-red-500/20 text-xs whitespace-nowrap flex-shrink-0 px-2 py-1 h-7"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Family Profiles Summary */}
      {familyProfiles.length > 0 && (
        <div className="bg-black/30 backdrop-blur-sm border-b border-green-500/10 p-2">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-green-300 font-medium mb-2">Family Members:</p>
            <div className="flex flex-wrap gap-1.5">
              {familyProfiles.map((profile, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 text-green-200 px-2 py-1 rounded-full text-xs font-medium shadow-sm"
                >
                  {profile.name} ({profile.relationship})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <InfinityIcon size={64} glowing />
              </div>
              <p className="text-gray-300 text-lg mb-2">Welcome to your conversation with Senali</p>
              <p className="text-gray-400 text-sm">Share what's on your mind, and I'll listen with care</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex mb-6 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-2xl ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 mt-1">
                    <InfinityIcon size={32} glowing />
                  </div>
                )}
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">You</span>
                  </div>
                )}
                
                <div
                  className={`px-4 py-3 rounded-2xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : 'bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="flex items-start gap-3 max-w-2xl">
                <div className="flex-shrink-0 mt-1">
                  <InfinityIcon size={32} glowing />
                </div>
                <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-100 px-4 py-3 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-300">Senali is typing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-black/40 backdrop-blur-sm border-t border-green-500/20 p-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="bg-gray-800/70 backdrop-blur-sm border-gray-600/50 text-white placeholder-gray-400 rounded-xl px-3 py-2 focus:border-green-500/50 focus:ring-green-500/20 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-medium px-4 py-2 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {creditsRemaining !== null && creditsRemaining <= 10 && (
            <div className="mt-3 text-center">
              <p className="text-yellow-400 text-sm">
                ⚠️ {creditsRemaining} credits remaining
              </p>
              {creditsRemaining === 0 && (
                <div className="mt-2">
                  <Button
                    onClick={onManageSubscription}
                    size="sm"
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Get More Credits
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}