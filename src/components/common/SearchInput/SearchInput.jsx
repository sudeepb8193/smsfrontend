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
      <span className="absolute left-3.5 text-[#8E7A86] pointer-events-none flex items-center justify-center">
        <Search size={18} />
      </span>

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-9 text-sm font-sans text-[#F9FAFB] bg-[#1D1217] border border-white/10 rounded-xl outline-none focus:border-[#8A4A52] focus:ring-2 focus:ring-[#8A4A52]/20 transition-all placeholder:text-[#8E7A86]"
        {...props}
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-[#8E7A86] hover:text-white p-0.5 rounded transition-all"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
