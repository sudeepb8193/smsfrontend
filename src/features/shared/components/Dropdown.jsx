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
        <label id={`${id}-label`} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
        className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3.5 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-800 ${
          error
            ? 'border-rose-500'
            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <span className={selected ? 'truncate text-slate-900 dark:text-white' : 'truncate text-slate-400'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {error && <span role="alert" className="text-xs font-medium text-rose-500">{error}</span>}
      {!error && helperText && <span className="text-xs text-slate-500">{helperText}</span>}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {searchable && (
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-slate-800 outline-none dark:text-white"
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
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                  option.value === value
                    ? 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {option.label}
                {option.value === value && <Check className="h-3.5 w-3.5" />}
              </button>
            )) : (
              <p className="px-3 py-4 text-center text-xs text-slate-400">No options found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
