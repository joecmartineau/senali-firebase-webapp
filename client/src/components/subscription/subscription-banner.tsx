import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Clock, X } from 'lucide-react';
import { subscriptionService, SubscriptionStatus } from '@/services/subscription-service';

interface SubscriptionBannerProps {
  onUpgrade?: () => void;
}

export function SubscriptionBanner({ onUpgrade }: SubscriptionBannerProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      await subscriptionService.initialize();
      setSubscriptionStatus(subscriptionService.getStatus());
      setLoading(false);
    };
    loadStatus();
  }, []);

  if (loading || dismissed) return null;

  // Don't show banner if user has active subscription
  if (subscriptionStatus?.isActive) return null;

  const daysRemaining = subscriptionService.getDaysRemaining();
  
  // Show trial banner if trial is active
  if (subscriptionStatus?.isTrialActive) {
    return (
      <Card className="mx-4 mb-4 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Free Trial
                </Badge>
                <span className="text-sm font-medium">
                  {daysRemaining} days left
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enjoy unlimited access to all premium features
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onUpgrade}>
              Subscribe Now
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setDismissed(true)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show upgrade banner if user is running low on trial messages
  const trialCount = subscriptionService.getTrialMessageCount();
  const remaining = subscriptionService.getRemainingTrialMessages();
  
  // Only show banner if user has used some messages and has 5 or fewer remaining
  if (remaining > 5 || trialCount === 0) return null;

  return (
    <Card className="mx-4 mb-4 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Trial Ending Soon
              </Badge>
              <span className="text-sm font-medium">
                {remaining} messages left
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Unlock unlimited conversations and family profiles
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onUpgrade}>
            Try Free
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setDismissed(true)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}