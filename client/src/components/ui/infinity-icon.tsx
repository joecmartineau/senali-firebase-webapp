interface InfinityIconProps {
  size?: number;
  className?: string;
}

export function InfinityIcon({ size = 24, className = "" }: InfinityIconProps) {
  return (
    <div 
      className={`inline-flex items-center justify-center rounded-lg bg-green-800 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.7}
        height={size * 0.7}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.178 8C19.218 8 20.178 8.596 20.178 10C20.178 11.404 19.218 12 18.178 12C16.755 12 15.207 11.404 13.659 10.404C12.111 9.404 10.564 8.596 9.141 8.596C8.101 8.596 7.141 9.192 7.141 10.596C7.141 12 8.101 12.596 9.141 12.596C10.564 12.596 12.111 13.404 13.659 14.404C15.207 15.404 16.755 16 18.178 16C20.259 16 22.178 14.807 22.178 12C22.178 9.193 20.259 8 18.178 8Z"
          fill="#22c55e"
          className="fill-green-400"
        />
        <path
          d="M5.822 8C4.782 8 3.822 8.596 3.822 10C3.822 11.404 4.782 12 5.822 12C7.245 12 8.793 11.404 10.341 10.404C11.889 9.404 13.436 8.596 14.859 8.596C15.899 8.596 16.859 9.192 16.859 10.596C16.859 12 15.899 12.596 14.859 12.596C13.436 12.596 11.889 13.404 10.341 14.404C8.793 15.404 7.245 16 5.822 16C3.741 16 1.822 14.807 1.822 12C1.822 9.193 3.741 8 5.822 8Z"
          fill="#22c55e"
          className="fill-green-400"
        />
      </svg>
    </div>
  );
}