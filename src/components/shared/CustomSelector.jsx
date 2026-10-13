import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import Badge from './Badge';

export const CustomSelector = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search options...',
  isMulti = false,
  isSearchable = true,
  isClearable = true,
  direction = 'auto', // 'auto' | 'down' | 'up'
  disabled = false,
  required = false,
  error,
  helperText,
  name,
  id,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (direction === 'up' || (direction === 'auto' && spaceBelow < 220)) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
    setIsOpen(!isOpen);
  };

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
        <label htmlFor={selectorId} className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Control Trigger Input Box */}
      <div
        id={selectorId}
        onClick={toggleDropdown}
        className={`min-h-[40px] px-3.5 py-2 text-sm font-sans bg-[var(--bg-input)] border ${
          error
            ? 'border-rose-500'
            : isOpen
            ? 'border-primary-500 shadow-sm shadow-primary-500/20'
            : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
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
            <span className="text-[var(--text-primary)] font-medium truncate">{singleSelectedLabel}</span>
          ) : (
            <span className="text-[var(--text-muted)] truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[var(--text-muted)]">
          {isClearable && ((isMulti && Array.isArray(value) && value.length > 0) || (!isMulti && value && value !== 'all')) && (
            <button
              type="button"
              onClick={handleClearAll}
              className="hover:text-[var(--text-primary)] p-0.5 rounded transition-all"
              aria-label="Clear all selections"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {error && <span className="text-xs text-rose-500 font-medium" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-[var(--text-muted)]">{helperText}</span>}

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 z-50 w-full max-h-64 overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl flex flex-col text-sm text-[var(--text-primary)] ${
            openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {/* Search Box */}
          {isSearchable && (
            <div className="p-2 border-b border-[var(--border-color)] flex items-center gap-2 bg-[var(--bg-input)]">
              <Search size={14} className="text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                autoFocus
              />
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-[var(--text-muted)]">No options found</div>
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
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      selected
                        ? 'bg-primary-500/15 text-primary-500 font-bold'
                        : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isMulti && (
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            selected ? 'bg-primary-500 border-primary-500 text-white' : 'border-[var(--border-color)] bg-transparent'
                          }`}
                        >
                          {selected && <Check size={12} />}
                        </div>
                      )}
                      <span className="truncate">{optLbl}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {optBadge && <Badge variant="neutral" size="small">{optBadge}</Badge>}
                      {!isMulti && selected && <Check size={16} className="text-primary-500" />}
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
