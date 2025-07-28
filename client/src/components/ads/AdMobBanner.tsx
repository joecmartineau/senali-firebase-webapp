import React, { useEffect, useState } from 'react';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

interface AdMobBannerProps {
  position: 'top' | 'bottom';
  adId?: string;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ 
  position, 
  adId 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  // Test ad unit IDs (replace with your real ad unit IDs in production)
  const defaultAdIds = {
    android: 'ca-app-pub-3940256099942544/6300978111', // Test banner ad unit ID
    ios: 'ca-app-pub-3940256099942544/2934735716', // Test banner ad unit ID
    web: 'ca-app-pub-3940256099942544/6300978111' // Fallback for web testing
  };

  const getAdId = () => {
    if (adId) return adId;
    
    const platform = Capacitor.getPlatform();
    return defaultAdIds[platform as keyof typeof defaultAdIds] || defaultAdIds.web;
  };

  useEffect(() => {
    const initializeAd = async () => {
      try {
        // Only show ads on mobile platforms
        if (!Capacitor.isNativePlatform()) {
          console.log('AdMob: Not on native platform, showing placeholder');
          setIsVisible(true);
          return;
        }

        // Initialize AdMob
        await AdMob.initialize({
          testingDevices: ['YOUR_DEVICE_ID'], // Add your test device ID here
          initializeForTesting: true, // Remove in production
        });

        console.log('AdMob initialized successfully');

        // Show banner ad
        const options: BannerAdOptions = {
          adId: getAdId(),
          adSize: BannerAdSize.BANNER,
          position: position === 'top' ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: true, // Remove in production
        };

        await AdMob.showBanner(options);
        setAdLoaded(true);
        setIsVisible(true);
        console.log(`AdMob banner ad shown at ${position}`);

        // Add event listeners (simplified without specific event types)
        console.log('AdMob banner event listeners would be added here in production');

      } catch (error) {
        console.error('Error initializing AdMob:', error);
        // Show placeholder on error
        setIsVisible(true);
      }
    };

    initializeAd();

    // Cleanup function
    return () => {
      if (Capacitor.isNativePlatform()) {
        AdMob.hideBanner().catch(console.error);
      }
    };
  }, [position, adId]);

  // For web/PWA, show a placeholder banner
  if (!Capacitor.isNativePlatform()) {
    return (
      <div className={`w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${
        position === 'top' ? 'border-b' : 'border-t'
      }`}>
        <div className="h-12 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Advertisement</span>
          </div>
        </div>
      </div>
    );
  }

  // For native platforms, return empty div as AdMob handles the display
  return isVisible ? (
    <div className={`w-full ${position === 'top' ? 'h-12' : 'h-12'}`}>
      {/* AdMob banner will be displayed here by the native plugin */}
    </div>
  ) : null;
};

export default AdMobBanner;