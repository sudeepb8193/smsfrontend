import React from 'react';

export const FormLabel = ({ children, htmlFor, required = false, className = '' }) => {
  return (
    <label htmlFor={htmlFor} className={`text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1 ${className}`}>
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
};

export default FormLabel;
