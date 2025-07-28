import { Capacitor } from '@capacitor/core';

// In-App Purchase Configuration
export const IAP_PRODUCTS = {
  CREDITS_1000: {
    id: 'com.senali.credits_1000',
    price: '$7.99',
    credits: 1000,
    title: '1000 Credits',
    description: '1000 message credits for Senali AI chat'
  },
  CREDITS_500: {
    id: 'com.senali.credits_500', 
    price: '$4.99',
    credits: 500,
    title: '500 Credits',
    description: '500 message credits for Senali AI chat'
  },
  CREDITS_100: {
    id: 'com.senali.credits_100',
    price: '$0.99', 
    credits: 100,
    title: '100 Credits',
    description: '100 message credits for Senali AI chat'
  }
};

export interface PurchaseResult {
  success: boolean;
  credits?: number;
  error?: string;
}

// Mock in-app purchase for web/testing
export const purchaseCredits = async (productId: string): Promise<PurchaseResult> => {
  try {
    const product = Object.values(IAP_PRODUCTS).find(p => p.id === productId);
    
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // For web/PWA, simulate purchase with confirmation dialog
    if (!Capacitor.isNativePlatform()) {
      const confirmed = confirm(
        `Purchase ${product.title} for ${product.price}?\n\n` +
        `You will receive ${product.credits} credits for AI chat messages.\n\n` +
        `This is a test purchase - no real payment will be processed.`
      );
      
      if (confirmed) {
        // Simulate API call to grant credits
        const response = await fetch('/api/purchase/credits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId,
            credits: product.credits,
            price: product.price,
            platform: 'web_test'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return { 
            success: true, 
            credits: data.newCreditsTotal 
          };
        } else {
          return { success: false, error: 'Purchase failed on server' };
        }
      } else {
        return { success: false, error: 'Purchase cancelled by user' };
      }
    }

    // For native platforms using Google Play Billing
    try {
      // This would use Google Play Billing API
      console.log('Processing native Play Store purchase for:', productId);
      
      // Simulate successful native purchase for testing
      const response = await fetch('/api/purchase/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          credits: product.credits,
          price: product.price,
          platform: 'android_playstore',
          purchaseToken: 'mock_purchase_token_' + Date.now()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          credits: data.newCreditsTotal 
        };
      } else {
        return { success: false, error: 'Purchase failed on server' };
      }
    } catch (error) {
      console.error('Native purchase error:', error);
      return { success: false, error: 'Native IAP failed' };
    }
    
  } catch (error) {
    console.error('Purchase error:', error);
    return { success: false, error: 'Purchase failed' };
  }
};

// Get user credits from server
export const getUserCredits = async (): Promise<number> => {
  try {
    const response = await fetch('/api/user/credits');
    if (response.ok) {
      const data = await response.json();
      return data.credits || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching credits:', error);
    return 0;
  }
};

// Check if user has sufficient credits for a message
export const hasCreditsForMessage = (credits: number): boolean => {
  return credits > 0;
};