import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Zap, Star, Users, Download, Shield, MessageCircle, Clock, X } from 'lucide-react';
import { subscriptionService } from '@/services/subscription-service';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe?: (planType: 'trial' | 'monthly' | 'yearly') => void;
}

export function SubscriptionModal({ isOpen, onClose, onSubscribe }: SubscriptionModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async (planType: 'trial' | 'monthly' | 'yearly') => {
    setLoading(true);
    
    try {
      if (planType === 'trial') {
        subscriptionService.startFreeTrial();
        alert('🎉 Your 7-day free trial has started! Enjoy unlimited access to all premium features.');
      } else {
        // In mobile app, this would trigger App Store/Play Store purchase
        alert(`📱 In the mobile app, this would open ${planType === 'monthly' ? 'monthly ($7.99)' : 'yearly ($79.99)'} subscription purchase through your device's app store.`);
        
        // For demo purposes, simulate successful purchase
        subscriptionService.activateSubscription(planType);
      }
      
      onSubscribe?.(planType);
      onClose();
      
      // Refresh the page to update UI
      window.location.reload();
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Senali Premium</h2>
                <p className="text-gray-600 dark:text-gray-400">Unlock unlimited conversations and advanced features</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Features Comparison */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  Trial
                </CardTitle>
                <CardDescription>Try Senali with 25 messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">25 total messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Basic family profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Basic features</span>
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-xl font-bold">Free</div>
              </CardFooter>
            </Card>

            <Card className="border-green-400 bg-gray-900 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Crown className="w-5 h-5 text-green-400" />
                  Premium Plan
                  <Badge className="bg-green-600 text-white">
                    Most Popular
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-300">For families who want the full experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">1,000 credits per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Unlimited child profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Export your family data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Advanced parenting insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Priority support</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">$7.99</span>
                  <span className="text-gray-300">/month</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold text-green-400">$79.99</span>
                  <span className="text-sm text-gray-300">/year (2 months free)</span>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              size="lg" 
              onClick={() => handleSubscribe('trial')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {loading ? 'Starting Trial...' : 'Start 7-Day Free Trial'}
            </Button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => handleSubscribe('monthly')}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Subscribe Monthly - $7.99'}
              </Button>
              <Button 
                size="lg"
                onClick={() => handleSubscribe('yearly')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {loading ? 'Processing...' : 'Subscribe Yearly - $79.99'}
              </Button>
            </div>

            <Button 
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Continue with Free Plan
            </Button>
          </div>

          {/* Fine Print */}
          <div className="text-center mt-6 space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <p>🍎 Subscriptions managed through App Store or Google Play Store</p>
            <p>⚙️ Cancel or change your subscription anytime in device settings</p>
            <p>💳 Payment charged to your App Store or Google Play account</p>
          </div>
        </div>
      </div>
    </div>
  );
}