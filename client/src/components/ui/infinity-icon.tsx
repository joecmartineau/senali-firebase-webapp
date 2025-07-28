import infinityIconImage from "../../assets/infinity-icon.png";

interface InfinityIconProps {
  size?: number;
  className?: string;
  glowing?: boolean;
}

export function InfinityIcon({ size = 24, className = "", glowing = false }: InfinityIconProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={infinityIconImage}
        alt="Senali Logo"
        width={size}
        height={size * 0.5}
        style={{
          filter: glowing ? 
            'drop-shadow(0 0 20px rgba(34, 197, 94, 0.8)) drop-shadow(0 0 40px rgba(34, 197, 94, 0.4))' : 
            'none',
          objectFit: 'contain',
          maxWidth: '100%',
          height: 'auto'
        }}
        className="select-none"
        onLoad={() => {
          console.log('✅ Logo loaded successfully');
        }}
        onError={(e) => {
          console.error('❌ Logo image failed to load, using fallback');
          // Fallback to styled infinity symbol if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.innerHTML = '∞';
          fallback.style.cssText = `
            width: ${size}px; 
            height: ${size * 0.5}px; 
            background: linear-gradient(90deg, #22c55e, #16a34a); 
            border-radius: ${size * 0.25}px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-weight: bold; 
            font-size: ${size * 0.4}px;
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
            ${glowing ? 'filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.8));' : ''}
          `;
          target.parentElement?.appendChild(fallback);
        }}
      />
    </div>
  );
}