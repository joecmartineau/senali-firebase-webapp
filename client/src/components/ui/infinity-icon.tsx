interface InfinityIconProps {
  size?: number;
  className?: string;
  glowing?: boolean;
}

export function InfinityIcon({ size = 24, className = "", glowing = false }: InfinityIconProps) {
  const iconId = `infinity-icon-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size * 0.5}
        viewBox="0 0 200 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: glowing ? 
            'drop-shadow(0 0 20px rgba(34, 197, 94, 0.8)) drop-shadow(0 0 40px rgba(34, 197, 94, 0.4))' : 
            'none'
        }}
      >
        <defs>
          {/* Main gradient for the infinity symbol */}
          <linearGradient id={`${iconId}-infinityGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="30%" stopColor="#22c55e" />
            <stop offset="70%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          
          {/* Inner highlight gradient for 3D effect */}
          <linearGradient id={`${iconId}-innerHighlight`} x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#86efac" opacity="0.9" />
            <stop offset="50%" stopColor="#4ade80" opacity="0.7" />
            <stop offset="100%" stopColor="#22c55e" opacity="0.5" />
          </linearGradient>
          
          {/* Shadow gradient */}
          <linearGradient id={`${iconId}-shadowGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#166534" opacity="0.8" />
            <stop offset="100%" stopColor="#15803d" opacity="0.6" />
          </linearGradient>
          
          {/* Glow filter */}
          {glowing && (
            <filter id={`${iconId}-glowEffect`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Background shadow for depth */}
        <path
          d="M100 50 C100 22.5, 72.5 5, 50 22.5 C27.5 5, 0 22.5, 0 50 
             C0 77.5, 27.5 95, 50 77.5 C72.5 95, 100 77.5, 100 50 
             C100 77.5, 127.5 95, 150 77.5 C172.5 95, 200 77.5, 200 50 
             C200 22.5, 172.5 5, 150 22.5 C127.5 5, 100 22.5, 100 50 Z"
          fill={`url(#${iconId}-shadowGradient)`}
          transform="translate(2, 4)"
          opacity="0.3"
        />
        
        {/* Main infinity shape with proper mathematical curves */}
        <path
          d="M100 50 C100 22.5, 72.5 5, 50 22.5 C27.5 5, 0 22.5, 0 50 
             C0 77.5, 27.5 95, 50 77.5 C72.5 95, 100 77.5, 100 50 
             C100 77.5, 127.5 95, 150 77.5 C172.5 95, 200 77.5, 200 50 
             C200 22.5, 172.5 5, 150 22.5 C127.5 5, 100 22.5, 100 50 Z"
          fill={`url(#${iconId}-infinityGradient)`}
          stroke={`url(#${iconId}-innerHighlight)`}
          strokeWidth="1"
          filter={glowing ? `url(#${iconId}-glowEffect)` : undefined}
        />
        
        {/* Inner loops for 3D depth */}
        <ellipse
          cx="50"
          cy="50"
          rx="25"
          ry="18"
          fill="none"
          stroke={`url(#${iconId}-innerHighlight)`}
          strokeWidth="2"
          opacity="0.6"
        />
        <ellipse
          cx="150"
          cy="50"
          rx="25"
          ry="18"
          fill="none"
          stroke={`url(#${iconId}-innerHighlight)`}
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Center crossing highlight */}
        <ellipse
          cx="100"
          cy="50"
          rx="4"
          ry="8"
          fill={`url(#${iconId}-innerHighlight)`}
          opacity="0.9"
        />
        
        {/* Top highlights for glass effect */}
        <ellipse
          cx="50"
          cy="35"
          rx="15"
          ry="8"
          fill={`url(#${iconId}-innerHighlight)`}
          opacity="0.4"
        />
        <ellipse
          cx="150"
          cy="35"
          rx="15"
          ry="8"
          fill={`url(#${iconId}-innerHighlight)`}
          opacity="0.4"
        />
      </svg>
    </div>
  );
}