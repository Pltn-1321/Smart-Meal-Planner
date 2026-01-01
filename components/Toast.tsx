import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-700',
          icon: <XCircle className="w-5 h-5 text-red-600" />,
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: <Info className="w-5 h-5 text-blue-600" />,
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`${styles.container} border rounded-lg p-4 mb-3 shadow-lg flex items-start gap-3 min-w-[300px] max-w-md animate-in slide-in-from-right-full duration-300`}
    >
      {styles.icon}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-stone-400 hover:text-stone-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col items-end">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
