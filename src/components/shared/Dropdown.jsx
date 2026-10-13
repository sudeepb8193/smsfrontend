import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export default function Dropdown({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  error,
  helperText,
  required = false,
  disabled = false,
  searchable = true,
  className = '',
}) {
  const id = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [options, query],
  );

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <div ref={rootRef} className={`relative flex w-full flex-col gap-1.5 ${className}`}>
      {label && (
        <label id={`${id}-label`} className="text-xs font-semibold text-[var(--text-secondary)]">
          {label}{required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}
      <button
        type="button"
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border bg-[var(--bg-input)] px-3.5 py-2 text-left text-sm transition focus:outline-none focus:border-primary-500 ${error
            ? 'border-rose-500'
            : 'border-[var(--border-color)] hover:border-[var(--border-hover)]'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <span className={selected ? 'truncate text-[var(--text-primary)] font-medium' : 'truncate text-[var(--text-muted)]'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {error && <span role="alert" className="text-xs font-medium text-rose-500">{error}</span>}
      {!error && helperText && <span className="text-xs text-[var(--text-muted)]">{helperText}</span>}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl">
          {searchable && (
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2">
              <Search className="h-4 w-4 text-[var(--text-muted)]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              />
            </div>
          )}
          <div role="listbox" className="max-h-56 overflow-y-auto p-1.5">
            {filteredOptions.length ? filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setQuery('');
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${option.value === value
                    ? 'bg-primary-500/15 font-semibold text-primary-500'
                    : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                  }`}
              >
                {option.label}
                {option.value === value && <Check className="h-3.5 w-3.5 text-primary-500" />}
              </button>
            )) : (
              <p className="px-3 py-4 text-center text-xs text-[var(--text-muted)]">No options found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
