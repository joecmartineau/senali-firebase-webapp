import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Lightbulb, Heart, Share, RefreshCw } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import type { DailyTip } from "@shared/schema";

interface DailyTipCardProps {
  tip: DailyTip;
  isToday?: boolean;
  onGenerateNew?: () => void;
  isGenerating?: boolean;
}

export default function DailyTipCard({ tip, isToday: showAsToday, onGenerateNew, isGenerating }: DailyTipCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasInteracted, setHasInteracted] = useState(false);

  const tipDate = tip.date ? new Date(tip.date) : new Date();
  
  const formatDate = () => {
    if (showAsToday) return "Today";
    if (isToday(tipDate)) return "Today";
    if (isYesterday(tipDate)) return "Yesterday";
    return format(tipDate, "MMM d");
  };

  // Mark tip as helpful mutation
  const markHelpfulMutation = useMutation({
    mutationFn: async (isHelpful: boolean) => {
      const response = await apiRequest("POST", `/api/tips/${tip.id}/interact`, { isHelpful });
      return response.json();
    },
    onSuccess: () => {
      setHasInteracted(true);
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve our tips.",
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
      
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("Already interacted")) {
        setHasInteracted(true);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to save feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMarkHelpful = (isHelpful: boolean) => {
    markHelpfulMutation.mutate(isHelpful);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tip.title,
          text: tip.content,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${tip.title}\n\n${tip.content}`);
        toast({
          title: "Copied!",
          description: "Tip copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy tip.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="tip-card border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-neuro-accent" />
            <h2 className="font-semibold text-neuro-text-primary">
              {showAsToday ? "Daily Tip" : "Tip"}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-neuro-text-secondary bg-gray-100 px-2 py-1 rounded-full">
              {formatDate()}
            </span>
            {showAsToday && onGenerateNew && (
              <Button
                onClick={onGenerateNew}
                disabled={isGenerating}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-neuro-text-secondary hover:text-neuro-primary"
              >
                <RefreshCw className={`h-3 w-3 ${isGenerating ? "animate-spin" : ""}`} />
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-medium text-neuro-text-primary">{tip.title}</h3>
          <p className="text-neuro-text-secondary leading-relaxed text-sm">
            {tip.content}
          </p>
          
          {tip.category && (
            <div className="inline-block">
              <span className="text-xs bg-neuro-primary bg-opacity-10 text-neuro-primary px-2 py-1 rounded-full">
                {tip.category}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4">
              {!hasInteracted ? (
                <>
                  <Button
                    onClick={() => handleMarkHelpful(true)}
                    disabled={markHelpfulMutation.isPending}
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1 text-neuro-text-secondary hover:text-neuro-primary p-0 h-auto"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">Helpful</span>
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1 text-neuro-text-secondary hover:text-neuro-primary p-0 h-auto"
                  >
                    <Share className="h-4 w-4" />
                    <span className="text-sm">Share</span>
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-neuro-primary text-sm">
                    <Heart className="h-4 w-4 fill-current" />
                    <span>Thank you!</span>
                  </div>
                  <Button
                    onClick={handleShare}
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1 text-neuro-text-secondary hover:text-neuro-primary p-0 h-auto"
                  >
                    <Share className="h-4 w-4" />
                    <span className="text-sm">Share</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
