import { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

const toIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Choose a date',
  required = false,
  disabled = false,
  minDate,
  error,
}) {
  const id = useId();
  const rootRef = useRef(null);
  const selected = value ? new Date(`${value.slice(0, 10)}T00:00:00`) : null;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(
    () => selected || new Date(),
  );

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leadingDays = monthStart.getDay();
  const dayCells = [...Array(leadingDays).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (dayCells.length % 7) dayCells.push(null);
  const display = selected
    ? selected.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div ref={rootRef} className="relative flex w-full flex-col gap-1.5">
      {label && (
        <label id={`${id}-label`} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}{required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          aria-labelledby={label ? `${id}-label` : undefined}
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className={`flex h-10 w-full items-center gap-2 rounded-xl border bg-white px-3.5 pr-10 text-left text-sm dark:bg-slate-800 ${
            error ? 'border-rose-500' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <span className={display ? 'flex-1 text-slate-900 dark:text-white' : 'flex-1 text-slate-400'}>
            {display || placeholder}
          </span>
        </button>
        {value && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && <span role="alert" className="text-xs font-medium text-rose-500">{error}</span>}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <strong className="text-sm text-slate-800 dark:text-white">
              {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </strong>
            <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-semibold uppercase text-slate-400">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {dayCells.map((day, index) => {
              if (!day) return <span key={`blank-${index}`} />;
              const date = new Date(month.getFullYear(), month.getMonth(), day);
              const iso = toIsoDate(date);
              const isSelected = value?.slice(0, 10) === iso;
              const isBeforeMin = minDate && iso < minDate;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={isBeforeMin}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`mx-auto h-8 w-8 rounded-lg text-xs transition ${
                    isSelected ? 'bg-primary-600 font-semibold text-white'
                      : 'text-slate-700 hover:bg-primary-50 dark:text-slate-200 dark:hover:bg-slate-800'
                  } ${isBeforeMin ? 'cursor-not-allowed opacity-30' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => { onChange(toIsoDate(new Date())); setOpen(false); }} className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50 dark:border-slate-700 dark:text-primary-300 dark:hover:bg-slate-800">
            Today
          </button>
        </div>
      )}
    </div>
  );
}
