import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Polished AuthInput matching SMS SaaS styling
 * Lavender focus ring: #6257D9
 */
export const AuthInput = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  rightElement,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-slate-700 tracking-wide select-none"
        >
          {label} {required && <span className="text-primary-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
            <Icon size={18} strokeWidth={2} />
          </div>
        )}

        <input
          id={id}
          name={name || id}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full rounded-xl bg-white border text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 outline-none focus:outline-none ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${isPassword || rightElement ? 'pr-11' : 'pr-3.5'} py-2.5 sm:py-3 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
              : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
          } ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        )}

        {!isPassword && rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 pt-0.5 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
