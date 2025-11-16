import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  variant = 'default'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const contentVariants = {
    default: "bg-white rounded-xl shadow-xl max-w-md w-full p-6",
    senior: "bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`${contentVariants[variant]} transform transition-all duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`font-bold ${variant === 'senior' ? 'text-2xl' : 'text-xl'}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={variant === 'senior' ? 28 : 24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
