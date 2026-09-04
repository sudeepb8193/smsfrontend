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
        <label htmlFor={selectId} className="text-xs font-semibold text-[#F9FAFB] flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
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
          className={`w-full h-10 pl-3.5 pr-10 text-sm font-sans text-[#F9FAFB] bg-[#1D1217] border ${
            error ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-white/10 focus:border-[#8A4A52] focus:ring-2 focus:ring-[#8A4A52]/20'
          } rounded-xl appearance-none outline-none cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden className="bg-[#271820] text-[#8E7A86]">
              {placeholder}
            </option>
          )}

          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} className="bg-[#271820] text-[#F9FAFB] py-2">
                {lbl}
              </option>
            );
          })}
        </select>

        <span className="absolute right-3.5 text-[#8E7A86] pointer-events-none flex items-center justify-center">
          <ChevronDown size={18} />
        </span>
      </div>

      {error && <span className="text-xs text-red-500 font-medium" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-[#8E7A86]">{helperText}</span>}
    </div>
  );
};

export default Select;
