import React from 'react';

export const FormActions = ({ children, align = 'right', className = '' }) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={`flex items-center gap-3 pt-4 border-t border-white/10 ${alignClasses[align] || alignClasses.right} ${className}`}>
      {children}
    </div>
  );
};

export default FormActions;
