import React, { useEffect, useState } from 'react';
import { AdMob, InterstitialAdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

interface AdMobInterstitialProps {
  onAdClosed?: () => void;
  onAdFailed?: () => void;
  adId?: string;
}

export const AdMobInterstitial: React.FC<AdMobInterstitialProps> = ({ 
  onAdClosed, 
  onAdFailed,
  adId 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Test interstitial ad unit IDs (replace with your real ad unit IDs in production)
  const defaultAdIds = {
    android: 'ca-app-pub-3940256099942544/1033173712', // Test interstitial ad unit ID
    ios: 'ca-app-pub-3940256099942544/4411468910', // Test interstitial ad unit ID
    web: 'ca-app-pub-3940256099942544/1033173712' // Fallback for web testing
  };

  const getAdId = () => {
    if (adId) return adId;
    
    const platform = Capacitor.getPlatform();
    return defaultAdIds[platform as keyof typeof defaultAdIds] || defaultAdIds.web;
  };

  const showInterstitialAd = async () => {
    try {
      setIsLoading(true);

      // Only show ads on mobile platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('AdMob Interstitial: Not on native platform, skipping');
        onAdClosed?.();
        setIsLoading(false);
        return;
      }

      // Prepare interstitial ad
      const options: InterstitialAdOptions = {
        adId: getAdId(),
        isTesting: true, // Remove in production
      };

      await AdMob.prepareInterstitial(options);
      console.log('Interstitial ad prepared');

      // Show interstitial ad
      await AdMob.showInterstitial();
      console.log('Interstitial ad shown');

    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      onAdFailed?.();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add event listeners for interstitial ads
    const setupListeners = () => {
      if (!Capacitor.isNativePlatform()) return;

      // Listen for ad events (simplified without specific event types)
      console.log('Interstitial ad event listeners would be added here in production');
    };

    setupListeners();

    // Cleanup function
    return () => {
      console.log('Interstitial ad cleanup');
    };
  }, []);

  // Expose the showInterstitialAd function to parent components
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    showAd: showInterstitialAd
  }));

  return null; // This component doesn't render anything visible
};

// Hook for using interstitial ads
export const useInterstitialAd = () => {
  const [isLoading, setIsLoading] = useState(false);

  const showInterstitialAd = async (onAdClosed?: () => void, onAdFailed?: () => void) => {
    try {
      setIsLoading(true);

      // For web/PWA, show a modal overlay instead
      if (!Capacitor.isNativePlatform()) {
        return new Promise<void>((resolve) => {
          // Create a full-screen overlay modal
          const overlay = document.createElement('div');
          overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
          `;

          overlay.innerHTML = `
            <div style="text-align: center; max-width: 400px; padding: 20px;">
              <div style="width: 60px; height: 60px; border: 4px solid #10b981; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
              <h2 style="margin: 0 0 10px; font-size: 24px;">Advertisement</h2>
              <p style="margin: 0 0 20px; color: #ccc;">Please watch this short video to continue using Senali for free.</p>
              <div style="background: #1f2937; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <div style="width: 200px; height: 112px; background: #374151; border-radius: 4px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: #9ca3af;">
                  🎥 Video Ad
                </div>
                <div style="background: #10b981; height: 4px; border-radius: 2px; margin: 10px 0;"></div>
                <p style="margin: 10px 0 0; font-size: 14px; color: #9ca3af;">Ad will close in <span id="countdown">5</span> seconds</p>
              </div>
            </div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          `;

          document.body.appendChild(overlay);
          document.body.style.overflow = 'hidden';

          // Countdown timer
          let countdown = 5;
          const countdownElement = overlay.querySelector('#countdown');
          const interval = setInterval(() => {
            countdown--;
            if (countdownElement) {
              countdownElement.textContent = countdown.toString();
            }
            if (countdown <= 0) {
              clearInterval(interval);
              document.body.removeChild(overlay);
              document.body.style.overflow = '';
              onAdClosed?.();
              resolve();
            }
          }, 1000);
        });
      }

      // For mobile platforms, use real AdMob interstitial
      const platform = Capacitor.getPlatform();
      const adIds = {
        android: 'ca-app-pub-3940256099942544/1033173712',
        ios: 'ca-app-pub-3940256099942544/4411468910'
      };
      
      const adId = adIds[platform as keyof typeof adIds] || adIds.android;

      const options: InterstitialAdOptions = {
        adId,
        isTesting: true, // Remove in production
      };

      await AdMob.prepareInterstitial(options);
      await AdMob.showInterstitial();
      
      onAdClosed?.();

    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      onAdFailed?.();
    } finally {
      setIsLoading(false);
    }
  };

  return { showInterstitialAd, isLoading };
};

export default AdMobInterstitial;