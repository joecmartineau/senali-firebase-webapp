import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Signal, SignalHigh, SignalLow, SignalMedium } from 'lucide-react';

export default function MobileHeader() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get connection info if available (modern browsers)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getSignalIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4 text-red-500" />;
    
    switch (connectionType) {
      case 'slow-2g':
      case '2g':
        return <SignalLow className="h-4 w-4 text-yellow-500" />;
      case '3g':
        return <SignalMedium className="h-4 w-4 text-yellow-400" />;
      case '4g':
        return <SignalHigh className="h-4 w-4 text-neuro-primary" />;
      default:
        return <Wifi className="h-4 w-4 text-neuro-primary" />;
    }
  };

  return (
    <div className="safe-area-inset-top bg-neuro-background">
      {/* Status bar simulation for standalone mode */}
      <div className="flex justify-between items-center px-4 py-1 text-xs text-neuro-text-secondary bg-black">
        <div className="flex items-center gap-1">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-2">
          {getSignalIcon()}
          <div className="flex items-center gap-1">
            {/* Battery indicator */}
            <div className="w-6 h-3 border border-neuro-text-secondary rounded-sm relative">
              <div className="w-1 h-1 bg-neuro-text-secondary rounded-sm absolute -right-1.5 top-1"></div>
              <div className="w-4 h-1.5 bg-neuro-primary rounded-sm absolute left-0.5 top-0.5"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Connection status banner */}
      {!isOnline && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 text-center">
          <p className="text-xs text-red-400">You're offline. Some features may be limited.</p>
        </div>
      )}
    </div>
  );
}