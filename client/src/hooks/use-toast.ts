import { useState } from 'react';

interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = 'default' }: Toast) => {
    // For now, just use browser alert - can be enhanced later with proper toast UI
    const message = description ? `${title}: ${description}` : title;
    if (variant === 'destructive') {
      console.error('Error:', message);
      alert(`Error: ${message}`);
    } else {
      console.log('Success:', message);
      alert(message);
    }
  };

  return { toast };
}