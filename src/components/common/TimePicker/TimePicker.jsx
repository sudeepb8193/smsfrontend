import React, { useState, useRef, useEffect } from 'react';
import { Clock, X } from 'lucide-react';

export const TimePicker = ({
  label,
  value,
  onChange,
  placeholder = 'Select time',
  step = 30, // interval in minutes
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

  const timeId = id || name || `timepicker-${Math.random().toString(36).substr(2, 9)}`;

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

  const handleSelectTime = (slotValue) => {
    if (onChange) {
      onChange(slotValue);
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
        <label htmlFor={timeId} className="text-xs font-semibold text-[#F9FAFB] flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input Field Trigger */}
      <div className="relative flex items-center w-full cursor-pointer" onClick={() => !disabled && setIsOpen(!isOpen)}>
        <span className="absolute left-3.5 text-[#8E7A86] pointer-events-none flex items-center justify-center">
          <Clock size={18} />
        </span>

        <input
          id={timeId}
          type="text"
          readOnly
          value={value || ''}
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
            aria-label="Clear time"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && <span className="text-xs text-red-500 font-medium" role="alert">{error}</span>}
      {!error && helperText && <span className="text-xs text-[#8E7A86]">{helperText}</span>}

      {/* Time Slots Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-64 max-h-60 overflow-y-auto bg-[#271820] border border-white/15 rounded-2xl shadow-2xl animate-fadeIn p-2 space-y-1 text-xs text-[#F9FAFB]">
          {timeSlots.map((slot) => {
            const isSelected = value === slot.label || value === slot.val24;
            return (
              <button
                key={slot.label}
                type="button"
                onClick={() => handleSelectTime(slot.label)}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-[#8A4A52] text-white font-bold'
                    : 'text-[#C4B5BE] hover:bg-white/10 hover:text-white'
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimePicker;
