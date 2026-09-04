import React from 'react';

export const FormGroup = ({ children, className = '' }) => {
  return <div className={`flex flex-col gap-1.5 w-full mb-4 ${className}`}>{children}</div>;
};

export default FormGroup;
