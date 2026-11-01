import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import CustomSelector from './CustomSelector';

export const DatePicker = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  minYear,
  maxYear,
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
  const containerRef = useRef(null);
  const generatedId = useId();

  // Parse input value to Date object or null
  const parseDate = (val) => {
    if (!val) return null;
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
    const d = dateOnlyMatch
      ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
      : new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const selectedDate = parseDate(value);
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());

  // Keep viewDate synchronized whenever external value prop changes
  useEffect(() => {
    const parsed = parseDate(value);
    if (parsed && !isNaN(parsed.getTime())) {
      setViewDate(parsed);
    }
  }, [value]);

  const dateId = id || name || generatedId;

  // Determine popover position defensively to prevent clipping and overlay issues
  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const popoverHeight = 350;

      if (direction === 'up') {
        setOpenUpwards(true);
      } else if (direction === 'down') {
        setOpenUpwards(false);
      } else {
        // 'auto' mode:
        // Only flip upwards if there is insufficient room below AND plenty of room above
        // AND space above is greater than space below
        if (spaceBelow < popoverHeight && spaceAbove >= popoverHeight && spaceAbove > spaceBelow) {
          setOpenUpwards(true);
        } else {
          setOpenUpwards(false);
        }
      }
    }
    setIsOpen(!isOpen);
  };

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date for display
  const formatDisplay = (d) => {
    if (!d) return '';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format date to ISO YYYY-MM-DD string for onChange callback
  const formatISO = (d) => {
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Dispatch change supporting BOTH string consumers: onChange(val)
  // and event-object consumers: onChange(e => e.target.value)
  const triggerChange = (valStr) => {
    if (!onChange) return;
    const hybrid = new String(valStr);
    hybrid.target = { value: valStr, name: name || id || '' };
    hybrid.currentTarget = { value: valStr, name: name || id || '' };
    hybrid.value = valStr;
    hybrid.toJSON = () => valStr;
    onChange(hybrid, valStr);
  };

  const handleSelectDay = (dayNum) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
    const newDateISO = formatISO(newDate);
    if ((minDate && newDateISO < minDate.slice(0, 10)) || (maxDate && newDateISO > maxDate.slice(0, 10))) {
      return;
    }
    triggerChange(newDateISO);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    triggerChange('');
  };

  const handleToday = () => {
    const today = new Date();
    const todayISO = formatISO(today);
    if ((minDate && todayISO < minDate.slice(0, 10)) || (maxDate && todayISO > maxDate.slice(0, 10))) {
      return;
    }
    setViewDate(today);
    triggerChange(todayISO);
    setIsOpen(false);
  };

  const prevMonth = () => {
    const prevDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    if (prevDate.getFullYear() < effectiveMinYear) {
      return;
    }
    setViewDate(prevDate);
  };

  const nextMonth = () => {
    const nextDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    if (nextDate.getFullYear() > effectiveMaxYear) {
      return;
    }
    setViewDate(nextDate);
  };

  const handleMonthChange = (newMonth) => {
    const m = Number(newMonth);
    const curYear = viewDate.getFullYear();
    const maxDays = new Date(curYear, m + 1, 0).getDate();
    const curDay = Math.min(viewDate.getDate(), maxDays);
    setViewDate(new Date(curYear, m, curDay));
  };

  const handleYearChange = (newYear) => {
    const y = Number(newYear);
    const curMonth = viewDate.getMonth();
    const maxDays = new Date(y, curMonth + 1, 0).getDate();
    const curDay = Math.min(viewDate.getDate(), maxDays);
    setViewDate(new Date(y, curMonth, curDay));
  };

  // Calendar math
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  // Month options for CustomSelector
  const monthOptions = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ];

  // Year range computation — show up to current year by default
  const currentYear = new Date().getFullYear();
  const effectiveMinYear = minYear ?? (minDate ? parseDate(minDate)?.getFullYear() ?? 1940 : 1940);
  const effectiveMaxYear = maxYear ?? (maxDate ? parseDate(maxDate)?.getFullYear() ?? currentYear : currentYear);

  // Generate years list descending from effectiveMaxYear (current year) down to effectiveMinYear
  const years = useMemo(() => {
    const list = [];
    for (let y = effectiveMaxYear; y >= effectiveMinYear; y--) {
      list.push(y);
    }
    const viewYear = viewDate.getFullYear();
    if (viewYear > effectiveMaxYear) {
      list.unshift(viewYear);
    } else if (viewYear < effectiveMinYear) {
      list.push(viewYear);
    }
    return list;
  }, [effectiveMinYear, effectiveMaxYear, viewDate]);

  const yearOptions = useMemo(() => {
    return years.map((y) => ({ value: y, label: String(y) }));
  }, [years]);

  return (
    <div className={`relative flex flex-col gap-1.5 w-full ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={dateId} className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input Field Trigger */}
      <div className="relative flex items-center w-full cursor-pointer" onClick={toggleDropdown}>
        <span className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
          <CalendarIcon size={18} />
        </span>

        <input
          id={dateId}
          type="text"
          readOnly
          value={formatDisplay(selectedDate)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-10 pl-10 pr-9 text-sm font-sans text-[var(--text-primary)] bg-[var(--bg-input)] border cursor-pointer ${
            error ? 'border-rose-500' : 'border-[var(--border-color)] focus:border-primary-500'
          } rounded-xl outline-none focus:outline-none shadow-none transition-all placeholder:text-[var(--text-muted)] disabled:opacity-60 disabled:cursor-not-allowed`}
          aria-invalid={!!error}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded transition-all"
            aria-label="Clear date"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && <span className="text-xs text-rose-500 font-medium" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-[var(--text-muted)]">{helperText}</span>}

      {/* Calendar Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 z-[100] w-[332px] p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl animate-fadeIn text-[var(--text-primary)] select-none ${
            openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {/* Header Month / Year Controls with CustomSelector */}
          <div className="flex items-center justify-between gap-1.5 mb-3.5">
            <button
              type="button"
              onClick={prevMonth}
              disabled={viewDate.getFullYear() <= effectiveMinYear && viewDate.getMonth() === 0}
              className={`p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                viewDate.getFullYear() <= effectiveMinYear && viewDate.getMonth() === 0 ? 'opacity-25 cursor-not-allowed pointer-events-none' : ''
              }`}
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-center">
              {/* Month CustomSelector */}
              <div className="w-[126px]">
                <CustomSelector
                  value={viewDate.getMonth()}
                  onChange={handleMonthChange}
                  options={monthOptions}
                  isClearable={false}
                  isSearchable={false}
                  direction="down"
                  size="sm"
                  placeholder="Month"
                />
              </div>

              {/* Year CustomSelector */}
              <div className="w-[96px]">
                <CustomSelector
                  value={viewDate.getFullYear()}
                  onChange={handleYearChange}
                  options={yearOptions}
                  isClearable={false}
                  isSearchable={true}
                  searchPlaceholder="Year..."
                  direction="down"
                  size="sm"
                  placeholder="Year"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              disabled={viewDate.getFullYear() >= effectiveMaxYear && viewDate.getMonth() === 11}
              className={`p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                viewDate.getFullYear() >= effectiveMaxYear && viewDate.getMonth() === 11 ? 'opacity-25 cursor-not-allowed pointer-events-none' : ''
              }`}
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekdays Header */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-[var(--text-muted)] mb-2">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Blank leading slots */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                selectedDate &&
                selectedDate.getDate() === dayNum &&
                selectedDate.getMonth() === viewDate.getMonth() &&
                selectedDate.getFullYear() === viewDate.getFullYear();

              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === viewDate.getMonth() &&
                new Date().getFullYear() === viewDate.getFullYear();
              const dayISO = formatISO(new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum));
              const isOutsideRange =
                (minDate && dayISO < minDate.slice(0, 10)) ||
                (maxDate && dayISO > maxDate.slice(0, 10));

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={isOutsideRange}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-8 w-8 mx-auto rounded-lg font-medium flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary-500 text-white font-bold shadow-md'
                      : isToday
                      ? 'border border-primary-500 text-primary-400 font-bold'
                      : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                  } ${isOutsideRange ? 'cursor-not-allowed opacity-30' : ''}`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-color)] text-xs">
            <button
              type="button"
              onClick={handleToday}
              className="text-primary-500 font-bold hover:underline cursor-pointer"
            >
              Select Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
