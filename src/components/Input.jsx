import React from 'react';

const Input = ({
  label,
  variant = 'default',
  error,
  placeholder,
  value,
  onChange,
  type = 'text',
  className = ''
}) => {
  const baseStyles = "bg-white transition-all duration-200 w-full";

  const variants = {
    default: "border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 rounded-lg text-base placeholder-gray-400",
    senior: "border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 px-6 py-4 rounded-xl text-lg placeholder-gray-500"
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block font-medium ${variant === 'senior' ? 'text-lg text-gray-900' : 'text-sm text-gray-700'}`}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${baseStyles} ${variants[variant]} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
