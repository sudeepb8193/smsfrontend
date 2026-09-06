import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onClear,
  className = '',
  ...props
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <span className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
        <Search size={18} />
      </span>

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-9 text-sm font-sans text-[var(--text-primary)] bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-[var(--text-muted)]"
        {...props}
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded transition-all"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
