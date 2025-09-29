import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 4000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, handleClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgGradient: 'bg-gradient-to-r from-green-500 to-emerald-600',
          bgLight: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          icon: <CheckCircle className="h-6 w-6 text-green-600" />
        };
      case 'error':
        return {
          bgGradient: 'bg-gradient-to-r from-red-500 to-rose-600',
          bgLight: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          icon: <XCircle className="h-6 w-6 text-red-600" />
        };
      case 'warning':
        return {
          bgGradient: 'bg-gradient-to-r from-amber-500 to-orange-600',
          bgLight: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          icon: <AlertCircle className="h-6 w-6 text-amber-600" />
        };
      default:
        return {
          bgGradient: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          bgLight: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          icon: <CheckCircle className="h-6 w-6 text-blue-600" />
        };
    }
  };

  const styles = getToastStyles();

  if (!isVisible) return null;

  return (
    <div 
      className={`
        transform transition-all duration-300 ease-in-out mb-3
        ${isAnimating ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
    >
      <div className={`
        ${styles.bgLight} ${styles.borderColor} 
        border-2 rounded-2xl shadow-2xl backdrop-blur-sm 
        max-w-md w-full p-4 relative overflow-hidden
      `}>
        {/* Gradient accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${styles.bgGradient}`}></div>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {styles.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${styles.textColor} leading-relaxed`}>
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 rounded-full p-1.5 
              hover:bg-white/50 transition-colors duration-200
              ${styles.textColor} hover:${styles.textColor}
            `}
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 bg-white/30 rounded-full h-1 overflow-hidden">
          <div 
            className={`h-full ${styles.bgGradient} rounded-full animate-pulse`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Toast;