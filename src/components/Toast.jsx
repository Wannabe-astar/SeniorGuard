import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ type = 'info', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="text-green-600" size={20} />,
      text: 'text-green-800'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: <AlertCircle className="text-red-600" size={20} />,
      text: 'text-red-800'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: <Info className="text-blue-600" size={20} />,
      text: 'text-blue-800'
    }
  };

  const config = types[type] || types.info;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md animate-slide-in`}>
      <div className={`${config.bg} border rounded-lg shadow-lg p-4 flex items-start gap-3`}>
        {config.icon}
        <p className={`flex-1 ${config.text} text-sm font-medium`}>{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
