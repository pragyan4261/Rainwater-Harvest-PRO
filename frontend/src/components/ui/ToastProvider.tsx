import React, { createContext, useState, ReactNode } from 'react';
import Toast from './Toast';

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const id = Date.now().toString();
    const newToast: ToastData = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => removeToast(toast.id)}
            duration={4000}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};