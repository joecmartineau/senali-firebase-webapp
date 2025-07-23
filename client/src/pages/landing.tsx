import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, MessageCircle, Lightbulb, Heart } from "lucide-react";

export default function Landing() {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="h-10 w-10 text-black" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            NeuroParent
          </h1>
          
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            AI-powered support for parents of neurodivergent children. Get personalized guidance, daily tips, and a supportive community.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">AI Chat Support</h3>
                    <p className="text-sm text-gray-300">
                      Get instant guidance for ADHD, autism, and other neurodivergent needs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">Daily Tips</h3>
                    <p className="text-sm text-gray-300">
                      Evidence-based strategies delivered fresh every day
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">Compassionate Care</h3>
                    <p className="text-sm text-gray-300">
                      Understanding support for the unique parenting journey
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sign In Button */}
          <Button 
            onClick={handleSignIn}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold h-12 rounded-xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium">Continue with Google</span>
            </div>
          </Button>

          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy. 
            Your data is secure and never shared.
          </p>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <h3 className="font-semibold text-white mb-4 text-center">
              Trusted by Parents Worldwide
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">24/7</div>
                <div className="text-sm text-gray-300">AI Support</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">Evidence</div>
                <div className="text-sm text-gray-300">Based Tips</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
