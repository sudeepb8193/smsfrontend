import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import Badge from '../Badge/Badge';

export const CustomSelector = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search options...',
  isMulti = false,
  isSearchable = true,
  disabled = false,
  required = false,
  error,
  helperText,
  name,
  id,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  const selectorId = id || name || `selector-${Math.random().toString(36).substr(2, 9)}`;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter((opt) => {
      const lbl = typeof opt === 'object' ? opt.label : String(opt);
      return lbl.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [options, searchQuery]);

  // Selected option lookup
  const isSelected = (val) => {
    if (isMulti) {
      return Array.isArray(value) && value.includes(val);
    }
    return value === val;
  };

  const handleSelectOption = (optVal) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? [...value] : [];
      if (currentValues.includes(optVal)) {
        onChange(currentValues.filter((v) => v !== optVal));
      } else {
        onChange([...currentValues, optVal]);
      }
    } else {
      onChange(optVal);
      setIsOpen(false);
    }
  };

  const handleRemoveBadge = (e, valToRemove) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(value)) {
      onChange(value.filter((v) => v !== valToRemove));
    }
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange(isMulti ? [] : '');
  };

  // Label lookup for single select display
  const singleSelectedLabel = useMemo(() => {
    if (isMulti || value === null || value === undefined || value === '') return '';
    const match = options.find((opt) => (typeof opt === 'object' ? opt.value === value : opt === value));
    return match ? (typeof match === 'object' ? match.label : match) : value;
  }, [options, value, isMulti]);

  return (
    <div className={`relative flex flex-col gap-1.5 w-full ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={selectorId} className="text-xs font-semibold text-[#F9FAFB] flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Control Trigger Input Box */}
      <div
        id={selectorId}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`min-h-[40px] px-3.5 py-1.5 text-sm font-sans bg-[#1D1217] border ${
          error ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-white/10 hover:border-white/20'
        } rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {isMulti && Array.isArray(value) && value.length > 0 ? (
            value.map((val) => {
              const item = options.find((opt) => (typeof opt === 'object' ? opt.value === val : opt === val));
              const itemLabel = item ? (typeof item === 'object' ? item.label : item) : val;
              return (
                <Badge key={val} variant="primary" size="small" className="flex items-center gap-1">
                  <span>{itemLabel}</span>
                  <X
                    size={12}
                    className="hover:text-white cursor-pointer"
                    onClick={(e) => handleRemoveBadge(e, val)}
                  />
                </Badge>
              );
            })
          ) : !isMulti && singleSelectedLabel ? (
            <span className="text-[#F9FAFB] font-medium truncate">{singleSelectedLabel}</span>
          ) : (
            <span className="text-[#8E7A86] truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[#8E7A86]">
          {((isMulti && Array.isArray(value) && value.length > 0) || (!isMulti && value)) && (
            <button
              type="button"
              onClick={handleClearAll}
              className="hover:text-white p-0.5 rounded transition-all"
              aria-label="Clear all selections"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {error && <span className="text-xs text-red-500 font-medium" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-[#8E7A86]">{helperText}</span>}

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full max-h-64 overflow-hidden bg-[#271820] border border-white/15 rounded-2xl shadow-2xl animate-fadeIn flex flex-col text-sm text-[#F9FAFB]">
          {/* Search Box */}
          {isSearchable && (
            <div className="p-2.5 border-b border-white/10 flex items-center gap-2 bg-black/20">
              <Search size={16} className="text-[#8E7A86]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#8E7A86]"
                autoFocus
              />
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#8E7A86]">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const optVal = typeof opt === 'object' ? opt.value : opt;
                const optLbl = typeof opt === 'object' ? opt.label : opt;
                const optBadge = typeof opt === 'object' ? opt.badge : null;
                const selected = isSelected(optVal);

                return (
                  <button
                    key={optVal}
                    type="button"
                    onClick={() => handleSelectOption(optVal)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all ${
                      selected
                        ? 'bg-[#8A4A52]/20 text-[#8A4A52] font-bold'
                        : 'text-[#C4B5BE] hover:bg-white/10 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isMulti && (
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            selected ? 'bg-[#8A4A52] border-[#8A4A52] text-white' : 'border-white/20 bg-transparent'
                          }`}
                        >
                          {selected && <Check size={12} />}
                        </div>
                      )}
                      <span className="truncate">{optLbl}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {optBadge && <Badge variant="neutral" size="small">{optBadge}</Badge>}
                      {!isMulti && selected && <Check size={16} className="text-[#8A4A52]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelector;
