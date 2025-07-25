import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'firebase/auth';
import { MessageCircle, Send, LogOut, Users } from 'lucide-react';

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
}

export default function ChatInterface({ user, onSignOut, onManageProfiles }: ChatInterfaceProps) {
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
          content: "Hi there! I'm Senali, your AI therapist and friend. What's been on your mind lately?",
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

    // Load initial credit count
    const loadCredits = async () => {
      try {
        const response = await fetch('/api/auth/firebase-signin', {
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
        
        if (response.ok) {
          // Fetch user credits from admin endpoint to display current count
          const userResponse = await fetch(`/api/test-admin-users`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const currentUser = userData.find((u: any) => u.uid === user.uid);
            if (currentUser) {
              setCreditsRemaining(currentUser.credits);
            }
          }
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
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          familyContext: familyProfiles,
          userUid: user.uid,
          conversationSummary: conversationSummary,
          recentMessages: recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
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
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: errorData.message || "You have no credits left. Please upgrade to continue chatting.",
          role: 'assistant',
          timestamp: new Date()
        };
        const finalMessages = [...updatedMessages, errorMessage];
        setMessages(finalMessages);
        saveMessagesToStorage(finalMessages);
        setCreditsRemaining(0);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">∞</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Senali</h1>
              <p className="text-sm text-gray-400">
                Your AI therapist and friend
                {creditsRemaining !== null && (
                  <span className="ml-2 px-2 py-1 bg-green-500 text-black rounded text-xs font-medium">
                    {creditsRemaining} credits
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onManageProfiles}
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Profiles
            </Button>
            <Button
              onClick={onSignOut}
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Family Profiles Summary */}
      {familyProfiles.length > 0 && (
        <div className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-400 mb-2">Family Members:</p>
            <div className="flex flex-wrap gap-2">
              {familyProfiles.map((profile, index) => (
                <span
                  key={index}
                  className="bg-green-500 text-black px-2 py-1 rounded text-xs font-medium"
                >
                  {profile.name} ({profile.relationship})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-800 text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-white max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-900 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 border-gray-600 text-white"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-green-500 hover:bg-green-600 text-black"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}