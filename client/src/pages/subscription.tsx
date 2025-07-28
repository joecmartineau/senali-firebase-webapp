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
                <p className="text-xs text-gray-300">Free unlimited chat</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Free Access Message */}
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/30">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <MessageCircle className="w-16 h-16 text-green-400 mx-auto" />
            </div>
            <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
              Free Unlimited Access
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Enjoy unlimited conversations with Senali at no cost
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-300">
                <MessageCircle className="w-5 h-5" />
                <span className="text-lg">Unlimited chat messages</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-300">
                <MessageCircle className="w-5 h-5" />
                <span className="text-lg">AI-powered parenting support</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-300">
                <MessageCircle className="w-5 h-5" />
                <span className="text-lg">Always available when you need guidance</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={onBack}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-8 py-3 text-lg"
              >
                Start Chatting Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Simple Info */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              No payments, no subscriptions, no limits
            </h3>
            <p className="text-gray-300">
              Senali is completely free to use. Chat as much as you need with your AI parenting coach.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}