import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce values (e.g. search keywords or filter terms).
 * Prevents rapid API requests while the user is actively typing.
 *
 * @param {any} value - The input value to debounce
 * @param {number} delay - Debounce duration in milliseconds (default: 350ms)
 * @returns {any} debouncedValue - The settled value after the delay
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
