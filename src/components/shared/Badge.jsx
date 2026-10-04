import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'medium',
  className = '',
  ...props
}) => {
  const variantClasses = {
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    info: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    neutral: 'bg-white/10 text-[#C4B5BE] border border-white/10',
    primary: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
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
