import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Star, Zap, Crown } from 'lucide-react';
import { IAP_PRODUCTS, purchaseCredits } from '@/lib/in-app-purchase';
import { InfinityIcon } from '@/components/ui/infinity-icon';

interface PurchaseCreditsProps {
  onClose: () => void;
  currentCredits: number;
  onPurchaseComplete: (newCredits: number) => void;
}

export default function PurchaseCredits({ onClose, currentCredits, onPurchaseComplete }: PurchaseCreditsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const handlePurchase = async (productId: string) => {
    setIsLoading(true);
    setSelectedProduct(productId);
    
    try {
      const result = await purchaseCredits(productId);
      
      if (result.success && result.credits) {
        onPurchaseComplete(result.credits);
        onClose();
      } else {
        alert(`Purchase failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedProduct(null);
    }
  };

  const products = [
    {
      ...IAP_PRODUCTS.CREDITS_100,
      icon: <Star className="w-8 h-8 text-yellow-400" />,
      popular: false,
      color: 'from-gray-500 to-gray-600'
    },
    {
      ...IAP_PRODUCTS.CREDITS_500,
      icon: <Zap className="w-8 h-8 text-blue-400" />,
      popular: true,
      color: 'from-blue-500 to-blue-600'
    },
    {
      ...IAP_PRODUCTS.CREDITS_1000,
      icon: <Crown className="w-8 h-8 text-yellow-400" />,
      popular: false,
      color: 'from-yellow-500 to-yellow-600',
      savings: 'Best Value!'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-black/40 p-6 border-b border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <InfinityIcon size={32} glowing />
              <div>
                <h2 className="text-2xl font-bold text-white">Buy Credits</h2>
                <p className="text-gray-300">Choose a credit package for AI chat messages</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
          
          {/* Current Credits */}
          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              Current Balance: <span className="font-bold">{currentCredits} credits</span>
            </p>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="p-6 space-y-4">
          <div className="text-center mb-6">
            <p className="text-gray-300 text-sm">
              Each credit = 1 AI message • No subscription • Credits never expire
            </p>
          </div>

          <div className="grid gap-4">
            {products.map((product) => (
              <Card 
                key={product.id}
                className={`relative overflow-hidden bg-gradient-to-r ${product.color} border-2 ${
                  product.popular ? 'border-blue-400' : 'border-gray-600'
                } hover:border-white/50 transition-all duration-200`}
              >
                {product.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                
                {product.savings && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
                    {product.savings}
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {product.icon}
                      <div>
                        <h3 className="text-xl font-bold text-white">{product.title}</h3>
                        <p className="text-gray-200 text-sm">{product.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl font-bold text-white">{product.price}</span>
                          <span className="text-gray-300 text-sm">
                            (${(parseFloat(product.price.replace('$', '')) / product.credits * 100).toFixed(1)}¢ per message)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white mb-2">
                        {product.credits.toLocaleString()}
                      </div>
                      <Button
                        onClick={() => handlePurchase(product.id)}
                        disabled={isLoading}
                        className={`bg-white/20 hover:bg-white/30 text-white font-medium px-6 py-2 ${
                          selectedProduct === product.id ? 'opacity-50' : ''
                        }`}
                      >
                        {isLoading && selectedProduct === product.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Purchase
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h4 className="text-white font-semibold mb-2">💳 Payment Information</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Secure payment through your app store (Google Play / App Store)</li>
              <li>• Credits are added instantly after purchase</li>
              <li>• No subscription fees or recurring charges</li>
              <li>• Credits never expire - use them whenever you want</li>
              <li>• Full access to GPT-4o AI with all premium features</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}