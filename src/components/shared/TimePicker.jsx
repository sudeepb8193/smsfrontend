import { useEffect, useId, useRef, useState } from 'react';
import { Clock, X } from 'lucide-react';

export const TimePicker = ({
  label,
  value,
  onChange,
  placeholder = 'Select time',
  step = 30, // interval in minutes
  timeFormat = '12h',
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
  const generatedId = useId();

  const timeId = id || name || generatedId;

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

  // Generate 24-hour time slots based on step interval
  const generateTimeSlots = () => {
    const slots = [];
    const totalMinutes = 24 * 60;

    for (let minutes = 0; minutes < totalMinutes; minutes += step) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      const formattedMins = String(mins).padStart(2, '0');

      const label = `${String(displayHours).padStart(2, '0')}:${formattedMins} ${period}`;
      const val24 = `${String(hours).padStart(2, '0')}:${formattedMins}`;

      slots.push({ label, value: label, val24 });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSelectTime = (slot) => {
    if (onChange) {
      onChange(timeFormat === '24h' ? slot.val24 : slot.label);
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className={`relative flex flex-col gap-1.5 w-full ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={timeId} className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input Field Trigger */}
      <div className="relative flex items-center w-full cursor-pointer" onClick={() => !disabled && setIsOpen(!isOpen)}>
        <span className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
          <Clock size={18} />
        </span>

        <input
          id={timeId}
          type="text"
          readOnly
          value={value || ''}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-10 pl-10 pr-9 text-sm font-sans text-[var(--text-primary)] bg-[var(--bg-input)] border cursor-pointer ${error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-[var(--border-color)] focus:border-primary-500'
            } rounded-xl outline-none transition-all placeholder:text-[var(--text-muted)] disabled:opacity-60 disabled:cursor-not-allowed`}
          aria-invalid={!!error}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded transition-all"
            aria-label="Clear time"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && <span className="text-xs text-rose-500 font-medium" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-[var(--text-muted)]">{helperText}</span>}

      {/* Time Slots Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-64 max-h-60 overflow-y-auto bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl animate-fadeIn p-2 space-y-1 text-xs text-[var(--text-primary)]">
          {timeSlots.map((slot) => {
            const isSelected = value === slot.label || value === slot.val24;
            return (
              <button
                key={slot.label}
                type="button"
                onClick={() => handleSelectTime(slot)}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all ${isSelected
                    ? 'bg-primary-500 text-white font-bold'
                    : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                  }`}
              >
                {timeFormat === '24h' ? slot.val24 : slot.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimePicker;
