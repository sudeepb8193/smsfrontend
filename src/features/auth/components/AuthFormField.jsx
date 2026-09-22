import React from 'react';

export const AuthFormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled,
  required,
}) => {
  return (
    <div className="space-y-1.5 text-left mb-4">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl bg-slate-800/80 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-rose-500 focus:ring-rose-500/30'
            : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
      {error && (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
};

export default AuthFormField;
