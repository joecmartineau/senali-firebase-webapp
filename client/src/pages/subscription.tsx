import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User } from 'firebase/auth';
import { Crown, Zap, Star, CreditCard, ArrowLeft } from 'lucide-react';

interface SubscriptionPageProps {
  user: User;
  onBack: () => void;
}

interface SubscriptionStatus {
  credits: number;
  subscription: string;
  subscriptionStatus: string;
  subscriptionPlatform?: string;
  lastCreditRefill?: string;
}

export default function SubscriptionPage({ user, onBack }: SubscriptionPageProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [user]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(`/api/subscriptions/status/${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setPurchasing(true);
    try {
      // In a real app, this would integrate with App Store/Play Store
      // For now, simulate subscription activation
      const response = await fetch('/api/subscriptions/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          subscriptionId: `sub_${Date.now()}`,
          platform: 'web' // Would be 'app_store' or 'play_store' in mobile
        })
      });

      if (response.ok) {
        await fetchSubscriptionStatus();
        alert('Subscription activated successfully! You now have 1000 credits.');
      } else {
        throw new Error('Failed to activate subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to activate subscription. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchaseCredits = async (credits: number, price: string) => {
    setPurchasing(true);
    try {
      // In a real app, this would integrate with App Store/Play Store
      const response = await fetch('/api/subscriptions/purchase-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          credits: credits,
          purchaseToken: `token_${Date.now()}`,
          platform: 'web'
        })
      });

      if (response.ok) {
        const data = await response.json();
        await fetchSubscriptionStatus();
        alert(`Successfully added ${credits} credits to your account!`);
      } else {
        throw new Error('Failed to purchase credits');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to purchase credits. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading subscription info...</p>
        </div>
      </div>
    );
  }

  const isPremium = subscriptionStatus?.subscription === 'premium' && subscriptionStatus?.subscriptionStatus === 'active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-green-500/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/70"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-black font-bold text-xl">∞</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent">
                Subscription & Credits
              </h1>
              <p className="text-sm text-gray-300">Manage your Senali subscription</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Current Status */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Credits Remaining:</span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                {subscriptionStatus?.credits || 0} credits
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Subscription:</span>
              <Badge variant={isPremium ? "default" : "secondary"} 
                     className={isPremium ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : "bg-gray-500/20 text-gray-300"}>
                {isPremium ? "Premium Active" : "Free Plan"}
                {isPremium && <Crown className="w-4 h-4 ml-1" />}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Premium Subscription */}
        {!isPremium && (
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Premium Subscription
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Recommended</Badge>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Get unlimited conversations and priority support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-300">
                  <Star className="w-4 h-4" />
                  <span>1,000 credits every month</span>
                </div>
                <div className="flex items-center gap-2 text-green-300">
                  <Star className="w-4 h-4" />
                  <span>Premium AI model (GPT-4o)</span>
                </div>
                <div className="flex items-center gap-2 text-green-300">
                  <Star className="w-4 h-4" />
                  <span>Priority customer support</span>
                </div>
                <div className="flex items-center gap-2 text-green-300">
                  <Star className="w-4 h-4" />
                  <span>Data export capabilities</span>
                </div>
              </div>
              
              <Separator className="border-gray-600" />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">$7.99</p>
                  <p className="text-sm text-gray-400">per month</p>
                </div>
                <Button 
                  onClick={handleSubscribe}
                  disabled={purchasing}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium px-6 py-2"
                >
                  {purchasing ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Buy Credits */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Buy Additional Credits
            </CardTitle>
            <CardDescription className="text-gray-300">
              Purchase credits without a subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Credit packages */}
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <h3 className="font-medium text-white mb-2">Starter Pack</h3>
                <p className="text-2xl font-bold text-white mb-1">100 credits</p>
                <p className="text-sm text-gray-400 mb-3">$2.99</p>
                <Button 
                  onClick={() => handlePurchaseCredits(100, '$2.99')}
                  disabled={purchasing}
                  variant="outline"
                  className="w-full bg-gray-700/50 border-gray-600 hover:bg-gray-600"
                >
                  {purchasing ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <h3 className="font-medium text-white mb-2">Value Pack</h3>
                <p className="text-2xl font-bold text-white mb-1">500 credits</p>
                <p className="text-sm text-gray-400 mb-3">$9.99</p>
                <Button 
                  onClick={() => handlePurchaseCredits(500, '$9.99')}
                  disabled={purchasing}
                  variant="outline"
                  className="w-full bg-gray-700/50 border-gray-600 hover:bg-gray-600"
                >
                  {purchasing ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <h3 className="font-medium text-white mb-2">Power Pack</h3>
                <p className="text-2xl font-bold text-white mb-1">1,200 credits</p>
                <p className="text-sm text-gray-400 mb-3">$19.99</p>
                <Button 
                  onClick={() => handlePurchaseCredits(1200, '$19.99')}
                  disabled={purchasing}
                  variant="outline"
                  className="w-full bg-gray-700/50 border-gray-600 hover:bg-gray-600"
                >
                  {purchasing ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Store Info */}
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <p className="text-sm text-blue-300">
              💡 <strong>Mobile App Users:</strong> Subscriptions and credit purchases are processed through the App Store or Google Play Store. 
              Your subscription can be managed through your device settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}