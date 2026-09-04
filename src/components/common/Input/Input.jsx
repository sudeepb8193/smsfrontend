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
        <label htmlFor={inputId} className="text-xs font-semibold text-[#F9FAFB] flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {Icon && (
          <span className="absolute left-3.5 text-[#8E7A86] pointer-events-none flex items-center justify-center">
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
          className={`w-full h-10 px-3.5 text-sm font-sans text-[#F9FAFB] bg-[#1D1217] border ${
            error ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-white/10 focus:border-[#8A4A52] focus:ring-2 focus:ring-[#8A4A52]/20'
          } rounded-xl outline-none transition-all placeholder:text-[#8E7A86] disabled:opacity-60 disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : ''
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
      </div>

      {error && (
        <span id={`${inputId}-error`} className="text-xs text-red-500 font-medium" role="alert">
          {error}
        </span>
      )}

      {!error && helperText && (
        <span id={`${inputId}-helper`} className="text-xs text-[#8E7A86]">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
