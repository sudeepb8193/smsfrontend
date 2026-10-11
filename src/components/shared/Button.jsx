import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon = null,
  onClick,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const sizeClasses = {
    small: 'h-8 px-3 text-xs font-medium gap-1.5 rounded-lg',
    medium: 'h-10 px-4 text-sm font-semibold gap-2 rounded-xl',
    large: 'h-12 px-6 text-base font-semibold gap-2.5 rounded-xl',
  };

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all border-none font-bold',
    secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all font-semibold',
    success: 'bg-success-600 text-white hover:bg-success-500 shadow-sm transition-all border-none font-bold',
    danger: 'bg-danger-600 text-white hover:bg-danger-500 shadow-sm transition-all border-none font-bold',
    warning: 'bg-warning-600 text-white hover:bg-warning-500 shadow-sm transition-all border-none font-bold',
    outline: 'bg-transparent text-primary-600 dark:text-primary-400 border border-primary-500 hover:bg-primary-500/10 transition-all font-semibold',
    ghost: 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border-none transition-all font-medium',
  };

  const baseClasses = 'inline-flex items-center justify-center font-sans select-none whitespace-nowrap outline-none transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none disabled:transform-none';

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.medium} ${variantClasses[variant] || variantClasses.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={isDisabled}
      onClick={(e) => !isDisabled && onClick && onClick(e)}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Spinner size={size === 'large' ? 'medium' : 'small'} />
          {children && <span>{children}</span>}
        </span>
      ) : (
        <>
          {Icon && <span className="inline-flex items-center justify-center">{React.isValidElement(Icon) ? Icon : <Icon size={size === 'small' ? 14 : size === 'large' ? 20 : 18} />}</span>}
          {children && <span>{children}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
