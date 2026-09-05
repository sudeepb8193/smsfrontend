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
        <label htmlFor={textareaId} className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
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
        className={`w-full p-3 text-sm font-sans text-[var(--text-primary)] bg-[var(--bg-input)] border ${
          error ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-[var(--border-color)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
        } rounded-xl outline-none resize-y transition-all placeholder:text-[var(--text-muted)] disabled:opacity-60 disabled:cursor-not-allowed`}
        aria-invalid={!!error}
        {...props}
      />

      {error && <span className="text-xs text-rose-500 font-medium" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-[var(--text-muted)]">{helperText}</span>}
    </div>
  );
};

export default Textarea;
