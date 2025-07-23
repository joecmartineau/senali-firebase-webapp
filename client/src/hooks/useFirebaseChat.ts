import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, ChatMessage } from '@/services/chatService';
import { useFirebaseAuth } from './useFirebaseAuth';

export function useFirebaseChat() {
  const { user } = useFirebaseAuth();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);

  // Get chat history
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    error: messagesError
  } = useQuery({
    queryKey: ['chat-messages', user?.uid],
    queryFn: () => user ? chatService.getChatHistory(user.uid) : [],
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user) throw new Error('User not authenticated');
      setIsTyping(true);
      return chatService.sendMessage(user.uid, message);
    },
    onSuccess: (newMessage) => {
      // Update messages cache
      queryClient.setQueryData(['chat-messages', user?.uid], (old: ChatMessage[] = []) => [
        ...old,
        // Add user message first
        {
          id: `temp-${Date.now()}`,
          userId: user!.uid,
          content: newMessage.content,
          role: 'user' as const,
          timestamp: new Date()
        },
        // Then AI response
        newMessage
      ]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    }
  });

  // Clear chat history
  const clearHistory = () => {
    queryClient.setQueryData(['chat-messages', user?.uid], []);
  };

  // Refresh messages
  const refreshMessages = () => {
    queryClient.invalidateQueries({ queryKey: ['chat-messages', user?.uid] });
  };

  return {
    messages,
    isLoadingMessages,
    messagesError,
    isTyping,
    isSendingMessage: sendMessageMutation.isPending,
    sendMessage: sendMessageMutation.mutate,
    sendMessageError: sendMessageMutation.error,
    clearHistory,
    refreshMessages
  };
}