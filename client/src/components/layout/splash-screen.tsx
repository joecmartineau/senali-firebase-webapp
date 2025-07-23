import { useEffect, useState } from 'react';
import { Brain, Heart } from 'lucide-react';

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
      <div className="fixed inset-0 bg-neuro-background z-50 flex items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none">
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neuro-background z-50 flex items-center justify-center transition-opacity duration-300">
      <div className="text-center animate-in fade-in duration-1000">
        {/* App Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-neuro-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Brain className="h-12 w-12 text-black" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
            <Heart className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold text-neuro-text-primary mb-2 animate-in slide-in-from-bottom-4 duration-700 delay-300">
          NeuroParent
        </h1>
        
        {/* Tagline */}
        <p className="text-neuro-text-secondary text-sm animate-in slide-in-from-bottom-4 duration-700 delay-500">
          AI Support for Neurodivergent Parenting
        </p>

        {/* Loading indicator */}
        <div className="mt-8 animate-in fade-in duration-700 delay-700">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-neuro-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-neuro-primary rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-neuro-primary rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}