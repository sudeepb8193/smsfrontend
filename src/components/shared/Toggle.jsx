import React from 'react';

/**
 * Modern Accessible Toggle Switch Component
 * Built with Tailwind design tokens (primary, slate) and smooth micro-animations.
 */
export const Toggle = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  label,
  description,
  isImplied = false,
  id,
  name,
  className = '',
  color = 'primary', // 'primary' | 'success' | 'brand' | 'warning'
  'aria-label': ariaLabel,
  ...props
}) => {
  const toggleId = id || name || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  // Size configurations
  const sizes = {
    sm: {
      track: 'w-8 h-4.5',
      thumb: 'w-3.5 h-3.5',
      translate: 'translate-x-3.5',
      translateOff: 'translate-x-0.5',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
      translateOff: 'translate-x-0.5',
    },
    lg: {
      track: 'w-14 h-7.5',
      thumb: 'w-6 h-6',
      translate: 'translate-x-6.5',
      translateOff: 'translate-x-0.75',
    },
  };

  const currentSize = sizes[size] || sizes.md;

  // Active track color based on design tokens
  const activeColorClasses = {
    primary: isImplied
      ? 'bg-primary-500/35 border-primary-400/50 dark:bg-primary-600/40'
      : 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500 shadow-xs shadow-primary-500/20',
    success: 'bg-success-600 dark:bg-success-500 border-success-600 dark:border-success-500 shadow-xs shadow-success-500/20',
    brand: 'bg-brand-600 dark:bg-brand-500 border-brand-600 dark:border-brand-500 shadow-xs shadow-brand-500/20',
    warning: 'bg-warning-600 dark:bg-warning-500 border-warning-600 dark:border-warning-500 shadow-xs shadow-warning-500/20',
  }[color] || 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500';

  const inactiveColorClass = 'bg-slate-200 dark:bg-slate-700/80 border-slate-300 dark:border-slate-600/80 hover:bg-slate-300 dark:hover:bg-slate-600';

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange?.(!checked);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        aria-label={ariaLabel || label}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${currentSize.track
          } ${disabled
            ? 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-700'
            : checked
              ? activeColorClasses
              : inactiveColorClass
          }`}
        {...props}
      >
        <span
          className={`pointer-events-none inline-block rounded-full bg-white shadow-xs transform transition-transform duration-200 ease-in-out ${currentSize.thumb
            } ${checked ? currentSize.translate : currentSize.translateOff} ${isImplied ? ' ring-primary-400' : ''
            }`}
        />
      </button>

      {(label || description) && (
        <label
          htmlFor={toggleId}
          className={`select-none ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          {label && (
            <span className="block text-xs font-semibold text-slate-900 dark:text-white">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              {description}
            </span>
          )}
        </label>
      )}
    </div>
  );
};

export default Toggle;
