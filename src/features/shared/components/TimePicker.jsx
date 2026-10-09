import { useMemo } from 'react';
import Dropdown from './Dropdown';

const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const hour = String(Math.floor(index / 4)).padStart(2, '0');
  const minute = String((index % 4) * 15).padStart(2, '0');
  return { value: `${hour}:${minute}`, label: `${hour}:${minute}` };
});

export default function TimePicker({ label, value, onChange, disabled = false, className = '' }) {
  const options = useMemo(() => {
    if (value && !timeOptions.some((option) => option.value === value)) {
      return [...timeOptions, { value, label: value }].sort((a, b) => a.value.localeCompare(b.value));
    }
    return timeOptions;
  }, [value]);

  return (
    <Dropdown
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select time"
      searchPlaceholder="Type a time..."
      searchable={false}
      disabled={disabled}
      className={className}
    />
  );
}
