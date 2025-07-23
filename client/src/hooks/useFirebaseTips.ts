import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tipsService, DailyTip } from '@/services/tipsService';
import { useFirebaseAuth } from './useFirebaseAuth';

export function useFirebaseTips() {
  const { user } = useFirebaseAuth();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Get today's tip
  const {
    data: todaysTip,
    isLoading: isLoadingTip,
    error: tipError
  } = useQuery({
    queryKey: ['todays-tip', user?.uid],
    queryFn: () => user ? tipsService.getTodaysTip(user.uid) : null,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get tip history
  const {
    data: tipHistory = [],
    isLoading: isLoadingHistory,
    error: historyError
  } = useQuery({
    queryKey: ['tip-history', user?.uid],
    queryFn: () => user ? tipsService.getTipHistory(user.uid) : [],
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Get bookmarked tips
  const {
    data: bookmarkedTips = [],
    isLoading: isLoadingBookmarks,
    error: bookmarksError
  } = useQuery({
    queryKey: ['bookmarked-tips', user?.uid],
    queryFn: () => user ? tipsService.getBookmarkedTips(user.uid) : [],
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });

  // Generate new tip mutation
  const generateTipMutation = useMutation({
    mutationFn: async (preferences?: any) => {
      if (!user) throw new Error('User not authenticated');
      setIsGenerating(true);
      return tipsService.generateDailyTip(user.uid, preferences);
    },
    onSuccess: (newTip) => {
      // Update today's tip cache
      queryClient.setQueryData(['todays-tip', user?.uid], newTip);
      // Update tip history cache
      queryClient.setQueryData(['tip-history', user?.uid], (old: DailyTip[] = []) => [
        newTip,
        ...old
      ]);
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Failed to generate tip:', error);
      setIsGenerating(false);
    }
  });

  // Update tip interaction mutation (like, dislike, bookmark)
  const updateInteractionMutation = useMutation({
    mutationFn: async ({ tipId, interaction }: {
      tipId: string;
      interaction: { liked?: boolean; disliked?: boolean; bookmarked?: boolean; }
    }) => {
      return tipsService.updateTipInteraction(tipId, interaction);
    },
    onSuccess: (_, { tipId, interaction }) => {
      // Update today's tip cache if it matches
      queryClient.setQueryData(['todays-tip', user?.uid], (old: DailyTip | null) => 
        old && old.id === tipId ? { ...old, ...interaction } : old
      );
      
      // Update tip history cache
      queryClient.setQueryData(['tip-history', user?.uid], (old: DailyTip[] = []) =>
        old.map(tip => tip.id === tipId ? { ...tip, ...interaction } : tip)
      );

      // Update bookmarked tips cache
      if (interaction.bookmarked !== undefined) {
        queryClient.invalidateQueries({ queryKey: ['bookmarked-tips', user?.uid] });
      }
    }
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ tipId, feedback }: {
      tipId: string;
      feedback: {
        rating: number;
        helpful: boolean;
        tried: boolean;
        comments?: string;
      }
    }) => {
      if (!user) throw new Error('User not authenticated');
      return tipsService.submitTipFeedback(tipId, user.uid, feedback);
    },
    onSuccess: () => {
      // Refresh tip data to get updated effectiveness ratings
      queryClient.invalidateQueries({ queryKey: ['todays-tip', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['tip-history', user?.uid] });
    }
  });

  // Helper functions
  const likeTip = (tipId: string) => {
    updateInteractionMutation.mutate({
      tipId,
      interaction: { liked: true, disliked: false }
    });
  };

  const dislikeTip = (tipId: string) => {
    updateInteractionMutation.mutate({
      tipId,
      interaction: { liked: false, disliked: true }
    });
  };

  const bookmarkTip = (tipId: string, bookmarked: boolean) => {
    updateInteractionMutation.mutate({
      tipId,
      interaction: { bookmarked }
    });
  };

  const generateNewTip = (preferences?: any) => {
    generateTipMutation.mutate(preferences);
  };

  const submitFeedback = (tipId: string, feedback: {
    rating: number;
    helpful: boolean;
    tried: boolean;
    comments?: string;
  }) => {
    submitFeedbackMutation.mutate({ tipId, feedback });
  };

  return {
    // Data
    todaysTip,
    tipHistory,
    bookmarkedTips,
    
    // Loading states
    isLoadingTip,
    isLoadingHistory,
    isLoadingBookmarks,
    isGenerating: isGenerating || generateTipMutation.isPending,
    isUpdatingInteraction: updateInteractionMutation.isPending,
    isSubmittingFeedback: submitFeedbackMutation.isPending,
    
    // Errors
    tipError,
    historyError,
    bookmarksError,
    generateError: generateTipMutation.error,
    interactionError: updateInteractionMutation.error,
    feedbackError: submitFeedbackMutation.error,
    
    // Actions
    generateNewTip,
    likeTip,
    dislikeTip,
    bookmarkTip,
    submitFeedback
  };
}