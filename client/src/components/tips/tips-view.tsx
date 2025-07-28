import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import DailyTipCard from "./daily-tip-card";
import type { DailyTip } from "@shared/schema";

export default function TipsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch today's tip
  const { data: todaysTip, isLoading: loadingToday } = useQuery<DailyTip>({
    queryKey: ["/api/tips/today"],
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
    },
  });

  // Fetch recent tips
  const { data: recentTips = [], isLoading: loadingRecent } = useQuery<DailyTip[]>({
    queryKey: ["/api/tips/recent"],
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
    },
  });

  // Generate new tip mutation
  const generateTipMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/tips/generate", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tips/recent"] });
      toast({
        title: "New tip generated!",
        description: "Fresh parenting guidance is ready for you.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to generate new tip. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateNewTip = () => {
    generateTipMutation.mutate();
  };

  if (loadingToday && loadingRecent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-neuro-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neuro-text-secondary">Loading tips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Today's Tip */}
        {todaysTip && (
          <DailyTipCard 
            tip={todaysTip} 
            isToday={true}
            onGenerateNew={handleGenerateNewTip}
            isGenerating={generateTipMutation.isPending}
          />
        )}

        {/* Recent Tips */}
        {recentTips.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-neuro-text-primary">Recent Tips</h3>
            {recentTips
              .filter(tip => tip.id !== todaysTip?.id) // Don't show today's tip again
              .slice(0, 5) // Show up to 5 recent tips
              .map((tip) => (
                <DailyTipCard key={tip.id} tip={tip} isToday={false} />
              ))}
          </div>
        )}

        {recentTips.length === 0 && !todaysTip && (
          <div className="text-center py-8">
            <p className="text-neuro-text-secondary">No tips available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
