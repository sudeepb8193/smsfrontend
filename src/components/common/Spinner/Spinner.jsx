import React from 'react';

export const Spinner = ({ size = 'medium', color = 'border-brand-500', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-6 h-6 border-[2.5px]',
    large: 'w-9 h-9 border-3',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-slate-300/30 border-t-current ${sizeClasses[size] || sizeClasses.medium} ${className}`}
      style={color ? { borderTopColor: color.startsWith('#') ? color : undefined } : undefined}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
