import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  name,
  id,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center w-full">
        <select
          id={selectId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full h-10 pl-3.5 pr-10 text-sm font-sans text-[var(--text-primary)] bg-[var(--bg-input)] border ${
            error ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-[var(--border-color)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
          } rounded-xl appearance-none outline-none cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden className="bg-[var(--bg-card)] text-[var(--text-muted)]">
              {placeholder}
            </option>
          )}

          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} className="bg-[var(--bg-card)] text-[var(--text-primary)] py-2">
                {lbl}
              </option>
            );
          })}
        </select>

        <span className="absolute right-3.5 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
          <ChevronDown size={18} />
        </span>
      </div>

      {error && <span className="text-xs text-rose-500 font-medium" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-[var(--text-muted)]">{helperText}</span>}
    </div>
  );
};

export default Select;
