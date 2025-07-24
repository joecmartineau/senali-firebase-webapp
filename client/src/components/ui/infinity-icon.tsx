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
        alt="Infinity Symbol"
        width={size}
        height={size * 0.5}
        style={{
          filter: glowing ? 
            'drop-shadow(0 0 20px rgba(34, 197, 94, 0.8)) drop-shadow(0 0 40px rgba(34, 197, 94, 0.4))' : 
            'none',
          objectFit: 'contain'
        }}
        className="select-none"
      />
    </div>
  );
}