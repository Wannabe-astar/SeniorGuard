import React from 'react';

const Button = ({
  variant = 'primary',
  size = 'default',
  disabled = false,
  onClick,
  className = '',
  children
}) => {
  const baseStyles = "font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 text-white shadow-sm focus:ring-blue-500",
    secondary: "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-50 text-gray-900 border border-gray-300 focus:ring-gray-400",
    senior: "bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-gray-300 text-white font-bold shadow-md focus:ring-purple-500",
    emergency: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold shadow-lg animate-pulse focus:ring-red-500"
  };

  const sizes = {
    default: "px-6 py-3 rounded-lg text-base",
    senior: "px-8 py-4 rounded-xl text-lg"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
