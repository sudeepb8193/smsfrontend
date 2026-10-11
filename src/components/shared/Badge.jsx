import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'medium',
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-500/20',
    secondary: 'bg-secondary-500/10 text-secondary-700 dark:text-secondary-300 border border-secondary-500/20',
    success: 'bg-success-500/10 text-success-600 dark:text-success-400 border border-success-500/20',
    danger: 'bg-danger-500/10 text-danger-600 dark:text-danger-400 border border-danger-500/20',
    warning: 'bg-warning-500/10 text-warning-700 dark:text-warning-400 border border-warning-500/20',
    brand: 'bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    // Compatibility aliases
    purple: 'bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-500/20',
    blue: 'bg-secondary-500/10 text-secondary-700 dark:text-secondary-300 border border-secondary-500/20',
    info: 'bg-secondary-500/10 text-secondary-700 dark:text-secondary-300 border border-secondary-500/20',
    emerald: 'bg-success-500/10 text-success-600 dark:text-success-400 border border-success-500/20',
    rose: 'bg-danger-500/10 text-danger-600 dark:text-danger-400 border border-danger-500/20',
    amber: 'bg-warning-500/10 text-warning-700 dark:text-warning-400 border border-warning-500/20',
  };

  const sizeClasses = {
    small: 'text-[10px] px-2 py-0.5 font-bold rounded',
    medium: 'text-xs px-2.5 py-1 font-semibold rounded-md',
    large: 'text-sm px-3 py-1.5 font-semibold rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 select-none ${variantClasses[variant] || variantClasses.neutral} ${
        sizeClasses[size] || sizeClasses.medium
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
