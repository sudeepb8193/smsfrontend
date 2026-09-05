import React from 'react';

export const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  name,
  id,
  required = false,
  disabled = false,
  error,
  helperText,
  icon: Icon = null,
  readOnly = false,
  className = '',
  ...props
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {Icon && (
          <span className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
            {React.isValidElement(Icon) ? Icon : <Icon size={18} />}
          </span>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full h-10 px-3.5 text-sm font-sans text-[var(--text-primary)] bg-[var(--bg-input)] border ${
            error ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-[var(--border-color)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
          } rounded-xl outline-none transition-all placeholder:text-[var(--text-muted)] disabled:opacity-60 disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : ''
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
      </div>

      {error && (
        <span id={`${inputId}-error`} className="text-xs text-rose-500 font-medium" role="alert">
          {error}
        </span>
      )}

      {!error && helperText && (
        <span id={`${inputId}-helper`} className="text-xs text-[var(--text-muted)]">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
