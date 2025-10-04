import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-center' | 'bottom-center';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  position = 'top-center' 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string, 
    type: ToastType = 'info', 
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const getToastStyles = (type: ToastType) => {
    const baseStyles = "px-6 py-4 rounded-lg shadow-lg text-white font-medium";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500`;
      case 'error':
        return `${baseStyles} bg-red-500`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-500`;
    }
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const positionStyles = {
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className={`fixed ${positionStyles[position]} z-50 space-y-2`}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: position === 'top-center' ? -50 : 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: position === 'top-center' ? -50 : 50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={getToastStyles(toast.type)}
              onClick={() => removeToast(toast.id)}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center gap-3 cursor-pointer">
                <span className="text-lg">{getToastIcon(toast.type)}</span>
                <span>{toast.message}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="ml-2 text-white/80 hover:text-white transition-colors"
                  aria-label="Close notification"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Simple Toast component for direct use
interface ToastComponentProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onRemove }) => {
  const getToastStyles = (type: ToastType) => {
    const baseStyles = "px-6 py-4 rounded-lg shadow-lg text-white font-medium";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500`;
      case 'error':
        return `${baseStyles} bg-red-500`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-500`;
    }
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={getToastStyles(toast.type)}
      onClick={() => onRemove(toast.id)}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 cursor-pointer">
        <span className="text-lg">{getToastIcon(toast.type)}</span>
        <span>{toast.message}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(toast.id);
          }}
          className="ml-2 text-white/80 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};
