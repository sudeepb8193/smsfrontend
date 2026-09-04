import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Button from '../Button/Button';

export const DatePicker = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  required = false,
  error,
  helperText,
  name,
  id,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse input value to Date object or current date
  const parseDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const selectedDate = parseDate(value);
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());

  const dateId = id || name || `datepicker-${Math.random().toString(36).substr(2, 9)}`;

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

  const handleSelectDay = (dayNum) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
    if (onChange) {
      onChange(formatISO(newDate));
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange('');
    }
  };

  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
    if (onChange) {
      onChange(formatISO(today));
    }
    setIsOpen(false);
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Calendar math
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={`relative flex flex-col gap-1.5 w-full ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={dateId} className="text-xs font-semibold text-[#F9FAFB] flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input Field Trigger */}
      <div className="relative flex items-center w-full cursor-pointer" onClick={() => !disabled && setIsOpen(!isOpen)}>
        <span className="absolute left-3.5 text-[#8E7A86] pointer-events-none flex items-center justify-center">
          <CalendarIcon size={18} />
        </span>

        <input
          id={dateId}
          type="text"
          readOnly
          value={formatDisplay(selectedDate)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-10 pl-10 pr-9 text-sm font-sans text-[#F9FAFB] bg-[#1D1217] border cursor-pointer ${
            error ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-white/10 focus:border-[#8A4A52] focus:ring-2 focus:ring-[#8A4A52]/20'
          } rounded-xl outline-none transition-all placeholder:text-[#8E7A86] disabled:opacity-60 disabled:cursor-not-allowed`}
          aria-invalid={!!error}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-[#8E7A86] hover:text-white p-0.5 rounded transition-all"
            aria-label="Clear date"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && <span className="text-xs text-red-500 font-medium" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-[#8E7A86]">{helperText}</span>}

      {/* Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 p-4 bg-[#271820] border border-white/15 rounded-2xl shadow-2xl animate-fadeIn text-[#F9FAFB] select-none">
          {/* Header Month / Year Controls */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 text-[#C4B5BE] hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm font-bold text-white">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 text-[#C4B5BE] hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekdays Header */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#8E7A86] mb-2">
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

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-8 w-8 mx-auto rounded-lg font-medium flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#8A4A52] text-white font-bold shadow-md'
                      : isToday
                      ? 'border border-[#8A4A52] text-[#8A4A52] font-bold'
                      : 'text-[#C4B5BE] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-xs">
            <button
              type="button"
              onClick={handleToday}
              className="text-[#8A4A52] font-bold hover:underline"
            >
              Select Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#8E7A86] hover:text-white"
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
