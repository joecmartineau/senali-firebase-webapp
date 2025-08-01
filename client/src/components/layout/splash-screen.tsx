import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { InfinityIcon } from "@/components/ui/infinity-icon";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Allow fade out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none">
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-300">
      <div className="text-center">
        {/* App Icon */}
        <div className="relative mb-8">
          <div className="flex justify-center">
            <InfinityIcon size={96} className="rounded-2xl" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <Heart className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold text-white mb-2">
          Senali
        </h1>
        
        {/* Tagline */}
        <p className="text-gray-300 text-sm">
          AI Support for Neurodivergent Parenting
        </p>

        {/* Loading indicator */}
        <div className="mt-8">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>  
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}