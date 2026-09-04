import React from 'react';

export const FormError = ({ error, className = '' }) => {
  if (!error) return null;
  return (
    <span className={`text-xs text-red-500 font-medium ${className}`} role="alert">
      {error}
    </span>
  );
};

export default FormError;
