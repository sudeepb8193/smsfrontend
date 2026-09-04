import React from 'react';

export const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  name,
  id,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const textareaId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="text-xs font-semibold text-[#F9FAFB] flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={`w-full p-3 text-sm font-sans text-[#F9FAFB] bg-[#1D1217] border ${
          error ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-white/10 focus:border-[#8A4A52] focus:ring-2 focus:ring-[#8A4A52]/20'
        } rounded-xl outline-none resize-y transition-all placeholder:text-[#8E7A86] disabled:opacity-60 disabled:cursor-not-allowed`}
        aria-invalid={!!error}
        {...props}
      />

      {error && <span className="text-xs text-red-500 font-medium" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-[#8E7A86]">{helperText}</span>}
    </div>
  );
};

export default Textarea;
