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
    primary: 'bg-gradient-to-r from-[#8A4A52] to-[#6E363E] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all border-none',
    secondary: 'bg-[#271820] text-[#F9FAFB] border border-white/10 hover:bg-[#36222C] hover:border-white/20 transition-all',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:translate-y-0 transition-all border-none',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm active:translate-y-0 transition-all border-none',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm active:translate-y-0 transition-all border-none',
    outline: 'bg-transparent text-[#8A4A52] border border-[#8A4A52] hover:bg-[#8A4A52]/10 transition-all',
    ghost: 'bg-transparent text-[#C4B5BE] hover:bg-white/5 hover:text-white border-none transition-all',
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
