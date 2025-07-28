import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';
import { subscriptionService, SubscriptionStatus } from '@/services/subscription-service';

interface CreditDisplayProps {
  className?: string;
}

export function CreditDisplay({ className = "" }: CreditDisplayProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      await subscriptionService.initialize();
      setSubscriptionStatus(subscriptionService.getStatus());
    };
    loadStatus();
  }, []);

  if (!subscriptionStatus) return null;

  // Show trial messages for free users
  if (!subscriptionStatus.isActive) {
    const remaining = subscriptionService.getRemainingTrialMessages();
    return (
      <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
        <Coins className="w-3 h-3" />
        {remaining} trial messages left
      </Badge>
    );
  }

  // Show credits for premium users
  return (
    <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
      <Coins className="w-3 h-3" />
      {subscriptionStatus.credits} credits
    </Badge>
  );
}