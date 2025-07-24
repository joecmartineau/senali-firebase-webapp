interface InfinityIconProps {
  size?: number;
  className?: string;
  glowing?: boolean;
}

export function InfinityIcon({ size = 24, className = "", glowing = false }: InfinityIconProps) {
  const iconId = `infinity-icon-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div 
      className={`inline-flex items-center justify-center rounded-2xl ${className}`}
      style={{ 
        width: size, 
        height: size,
        background: 'linear-gradient(135deg, #1a4d5c 0%, #2d6a7a 30%, #3a7f8f 70%, #4a9aa8 100%)',
        boxShadow: glowing ? 
          '0 0 20px rgba(0, 255, 136, 0.4), 0 0 40px rgba(0, 255, 136, 0.2), 0 4px 15px rgba(0, 0, 0, 0.3)' : 
          '0 4px 15px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <svg 
        width={size * 0.65} 
        height={size * 0.65} 
        viewBox="0 0 100 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${iconId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="50%" stopColor="#00e676" />
            <stop offset="100%" stopColor="#00c853" />
          </linearGradient>
          <filter id={`${iconId}-glow`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path 
          d="M15 30 C15 18, 25 10, 35 18 C40 15, 45 15, 50 18 C55 15, 60 15, 65 18 C75 10, 85 18, 85 30 C85 42, 75 50, 65 42 C60 45, 55 45, 50 42 C45 45, 40 45, 35 42 C25 50, 15 42, 15 30 Z" 
          fill={`url(#${iconId}-gradient)`}
          strokeWidth="2"
          filter={glowing ? `url(#${iconId}-glow)` : undefined}
        />
        <path 
          d="M35 30 C35 25, 40 22, 45 25 C47 24, 53 24, 55 25 C60 22, 65 25, 65 30 C65 35, 60 38, 55 35 C53 36, 47 36, 45 35 C40 38, 35 35, 35 30 Z" 
          fill="#1a4d5c"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}