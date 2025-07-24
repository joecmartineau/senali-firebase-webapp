import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Zap, Star, Users, Download, Shield, MessageCircle, Clock } from 'lucide-react';
import { subscriptionService, SubscriptionStatus } from '@/services/subscription-service';
import { useLocation } from 'wouter';

export default function SubscriptionPage() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const loadStatus = async () => {
      await subscriptionService.initialize();
      setSubscriptionStatus(subscriptionService.getStatus());
      setLoading(false);
    };
    loadStatus();
  }, []);

  const handleStartTrial = () => {
    subscriptionService.startFreeTrial();
    setSubscriptionStatus(subscriptionService.getStatus());
    setLocation('/chat');
  };

  const handleSubscribe = (planType: 'monthly' | 'yearly') => {
    // In mobile app, this would trigger App Store/Play Store purchase
    // For web demo, we'll simulate the purchase
    alert(`In the mobile app, this would open ${planType === 'monthly' ? 'monthly' : 'yearly'} subscription purchase through App Store/Play Store`);
    
    // Simulate successful purchase for demo
    subscriptionService.activateSubscription(planType);
    setSubscriptionStatus(subscriptionService.getStatus());
    setLocation('/chat');
  };

  const daysRemaining = subscriptionStatus ? subscriptionService.getDaysRemaining() : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Senali Premium
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock unlimited conversations, family profiles, and advanced parenting insights with your AI companion
          </p>
        </div>

        {/* Current Status */}
        {subscriptionStatus && (
          <Card className="mb-8">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  subscriptionStatus.isActive ? 'bg-green-100' : 
                  subscriptionStatus.isTrialActive ? 'bg-amber-100' : 'bg-gray-100'
                }`}>
                  {subscriptionStatus.isActive ? (
                    <Crown className="w-6 h-6 text-green-600" />
                  ) : subscriptionStatus.isTrialActive ? (
                    <Clock className="w-6 h-6 text-amber-600" />
                  ) : (
                    <Star className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {subscriptionStatus.isActive ? 'Premium Active' : 
                       subscriptionStatus.isTrialActive ? 'Free Trial Active' : 'Free Plan'}
                    </span>
                    <Badge variant={subscriptionStatus.isActive || subscriptionStatus.isTrialActive ? 'default' : 'secondary'}>
                      {subscriptionStatus.planType === 'yearly' ? 'Yearly' :
                       subscriptionStatus.planType === 'monthly' ? 'Monthly' : 'Free'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionStatus.isActive || subscriptionStatus.isTrialActive ? 
                      `${daysRemaining} days remaining` : 
                      'Limited to 10 messages per day'
                    }
                  </p>
                </div>
              </div>
              {!subscriptionStatus.isActive && (
                <Button onClick={() => setLocation('/chat')}>
                  Continue to Chat
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Free Plan
              </CardTitle>
              <CardDescription>Perfect for trying Senali</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">10 messages per day</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">1 child profile</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Basic daily tips</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Local data storage</span>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-2xl font-bold">Free</div>
            </CardFooter>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-green-600" />
                Premium Plan
                <Badge className="bg-green-100 text-green-800">Most Popular</Badge>
              </CardTitle>
              <CardDescription>For families who want the full experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-green-600">$79.99</span>
                <span className="text-sm text-muted-foreground">/year (33% off)</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          {!subscriptionStatus?.isActive && !subscriptionStatus?.isTrialActive && (
            <>
              <Button 
                size="lg" 
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8"
              >
                Start 7-Day Free Trial
              </Button>
              <p className="text-sm text-muted-foreground">
                No payment required • Cancel anytime
              </p>
            </>
          )}

          {!subscriptionStatus?.isActive && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => handleSubscribe('monthly')}
                className="px-8"
              >
                Subscribe Monthly - $9.99
              </Button>
              <Button 
                size="lg"
                onClick={() => handleSubscribe('yearly')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8"
              >
                Subscribe Yearly - $79.99
              </Button>
            </div>
          )}

          <div className="pt-6">
            <Button 
              variant="ghost"
              onClick={() => setLocation('/chat')}
            >
              Continue with Current Plan
            </Button>
          </div>
        </div>

        {/* Fine Print */}
        <div className="text-center mt-8 space-y-2 text-xs text-muted-foreground">
          <p>Subscriptions are managed through the App Store or Google Play Store</p>
          <p>You can cancel or change your subscription at any time in your device settings</p>
          <p>Payment will be charged to your App Store or Google Play account</p>
        </div>
      </div>
    </div>
  );
}