import React from 'react';
import Spinner from '../Spinner/Spinner';

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
    small: 'h-8 px-3 text.xs font-medium gap-1.5 rounded-lg',
    medium: 'h-10 px-4 text-sm font-semibold gap-2 rounded-xl',
    large: 'h-12 px-6 text-base font-semibold gap-2.5 rounded-xl',
  };

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all border-none font-bold',
    secondary: 'bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-surface)] transition-all font-semibold',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all border-none font-bold',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-all border-none font-bold',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm transition-all border-none font-bold',
    outline: 'bg-transparent text-primary-500 border border-primary-500 hover:bg-primary-500/10 transition-all font-semibold',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] border-none transition-all font-medium',
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
