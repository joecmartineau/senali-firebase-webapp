import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Zap, Shield, Download, Users } from 'lucide-react';
import { subscriptionService, SubscriptionStatus } from '@/services/subscription-service';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature: string;
  onUpgrade?: () => void;
}

export function SubscriptionGate({ children, feature, onUpgrade }: SubscriptionGateProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      await subscriptionService.initialize();
      setSubscriptionStatus(subscriptionService.getStatus());
      setLoading(false);
    };
    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show content if user has premium access
  if (subscriptionService.hasPremiumAccess()) {
    return <>{children}</>;
  }

  // Show upgrade prompt for free users
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">Unlock Premium</CardTitle>
          <CardDescription>
            {feature} is available with Senali Premium
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Unlimited daily conversations</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-sm">Unlimited child profiles</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-green-500" />
              <span className="text-sm">Export your family data</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-sm">Advanced parenting insights</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm">Priority support</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            Start Free Trial
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            7-day free trial, then $9.99/month or $79.99/year
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}