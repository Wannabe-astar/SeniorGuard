import React from 'react';

const Card = ({
  variant = 'default',
  children,
  className = '',
  title
}) => {
  const variants = {
    default: "bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200",
    senior: "bg-white rounded-2xl shadow-md border-2 border-gray-200 p-8 hover:shadow-lg transition-shadow duration-200",
    stats: "bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200"
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {title && (
        <h3 className={`font-semibold mb-4 ${variant === 'senior' ? 'text-2xl' : 'text-xl'}`}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
