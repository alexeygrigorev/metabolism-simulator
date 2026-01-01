// ============================================================================
// METABOLIC SIMULATOR - TOAST NOTIFICATION COMPONENT
// ============================================================================

import { useEffect, useState } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem = function ToastItem({ toast, onRemove }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const bgColor = {
    success: 'bg-green-500/90 border-green-400',
    info: 'bg-blue-500/90 border-blue-400',
    warning: 'bg-yellow-500/90 border-yellow-400',
  }[toast.type];

  return (
    <div
      className={`px-4 py-3 rounded-lg border backdrop-blur-sm text-white font-medium shadow-lg transform transition-all duration-300 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      } ${bgColor}`}
    >
      <div className="flex items-center gap-2">
        <span>
          {toast.type === 'success' && '✓'}
          {toast.type === 'info' && 'ℹ'}
          {toast.type === 'warning' && '⚠'}
        </span>
        <span className="text-sm">{toast.message}</span>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
