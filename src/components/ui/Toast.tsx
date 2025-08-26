import React from 'react';
import { toast, Toast as ToastType } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
  t: ToastType;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({ t, message, type = 'info', title, action }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const backgrounds = {
    success: 'bg-green-900/90 border-green-500/20',
    error: 'bg-red-900/90 border-red-500/20',
    warning: 'bg-yellow-900/90 border-yellow-500/20',
    info: 'bg-blue-900/90 border-blue-500/20',
  };

  return (
    <div
      className={cn(
        'glass-effect border rounded-lg p-4 shadow-lg max-w-sm w-full',
        backgrounds[type],
        t.visible ? 'animate-enter' : 'animate-leave',
      )}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold text-white-pure mb-1">{title}</p>
          )}
          <p className="text-sm text-gray-light">{message}</p>
          {action && (
            <button
              onClick={() => {
                action.onClick();
                toast.dismiss(t.id);
              }}
              className="mt-2 text-xs text-gold-luxury hover:text-yellow-400 underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-gray-medium hover:text-white-pure transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Toast utility functions
export const showToast = {
  success: (message: string, title?: string, action?: { label: string; onClick: () => void }) =>
    toast.custom((t) => <Toast t={t} message={message} type="success" title={title} action={action} />),
  
  error: (message: string, title?: string, action?: { label: string; onClick: () => void }) =>
    toast.custom((t) => <Toast t={t} message={message} type="error" title={title} action={action} />),
  
  warning: (message: string, title?: string, action?: { label: string; onClick: () => void }) =>
    toast.custom((t) => <Toast t={t} message={message} type="warning" title={title} action={action} />),
  
  info: (message: string, title?: string, action?: { label: string; onClick: () => void }) =>
    toast.custom((t) => <Toast t={t} message={message} type="info" title={title} action={action} />),
};

export { Toast };