import { useToast } from '../../hooks/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg shadow-lg max-w-sm ${
            toast.variant === 'destructive'
              ? 'bg-red-900 border-red-800 text-red-100'
              : 'bg-green-900 border-green-800 text-green-100'
          }`}
        >
          <div className="font-semibold">{toast.title}</div>
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}