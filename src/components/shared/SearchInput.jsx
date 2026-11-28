import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onClear,
  debounceMs = 350,
  className = '',
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef(null);

  // Sync external value changes (e.g. on reset or clear)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const nextVal = e.target.value;
    setLocalValue(nextVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (debounceMs <= 0) {
      if (typeof onChange === 'function') {
        onChange(nextVal);
      }
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      if (typeof onChange === 'function') {
        onChange(nextVal);
      }
    }, debounceMs);
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setLocalValue('');
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <span className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
        <Search size={18} />
      </span>

      <input
        type="text"
        data-sms-search="true"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-9 text-sm font-sans text-[var(--text-primary)] bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl outline-none focus:border-primary-500 focus:ring-primary-500/20 transition-all placeholder:text-[var(--text-muted)]"
        {...props}
      />

      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded transition-all cursor-pointer"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
