import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from 'firebase/auth';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { InfinityIcon } from '@/components/ui/infinity-icon';

interface SubscriptionPageProps {
  user: User;
  onBack: () => void;
}

export default function SubscriptionPage({ user, onBack }: SubscriptionPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-green-500/20 p-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/70 px-2 py-1 h-7 text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <InfinityIcon size={32} glowing />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent">
                  Senali
                </h1>
                <p className="text-xs text-gray-300">Credit-based messaging</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Credit Purchase System */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <MessageCircle className="w-16 h-16 text-blue-400 mx-auto" />
            </div>
            <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
              Credit-Based Messaging
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Purchase credits to chat with your AI parenting coach
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-blue-300">
                <MessageCircle className="w-5 h-5" />
                <span className="text-lg">1 credit = 1 AI message</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-blue-300">
                <MessageCircle className="w-5 h-5" />
                <span className="text-lg">Credits never expire</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-blue-300">
                <MessageCircle className="w-5 h-5" />
                <span className="text-lg">No subscription required</span>
              </div>
            </div>

            {/* Credit Packages */}
            <div className="grid gap-3 mt-6">
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 text-left">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold">100 Credits</h3>
                    <p className="text-gray-400 text-sm">Perfect for trying Senali</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">$0.99</p>
                    <p className="text-xs text-gray-400">0.99¢ per message</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-4 text-left relative">
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded-bl-lg">
                  POPULAR
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold">500 Credits</h3>
                    <p className="text-gray-400 text-sm">Great for regular conversations</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">$4.99</p>
                    <p className="text-xs text-gray-400">0.99¢ per message</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-4 text-left relative">
                <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 text-xs font-bold rounded-br-lg">
                  BEST VALUE
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold">1000 Credits</h3>
                    <p className="text-gray-400 text-sm">Best value for frequent users</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">$7.99</p>
                    <p className="text-xs text-gray-400">0.79¢ per message</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={onBack}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-8 py-3 text-lg"
              >
                Get Started - 25 Free Credits
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Info */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Pay-per-use, secure Play Store billing
            </h3>
            <p className="text-gray-300">
              Purchase credits through Google Play Store. No subscription fees or recurring charges. Credits are yours forever.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}