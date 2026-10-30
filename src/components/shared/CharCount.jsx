import React from 'react';

/**
 * Shared CharCount component.
 * Displays character counter (e.g. "12/100") against a maximum allowed limit.
 * Shows warning color when approaching limit and danger color when max reached.
 *
 * @param {Object} props
 * @param {number|string} props.current - Current string value or number of characters
 * @param {number} props.max - Maximum allowed characters
 * @param {string} [props.className] - Extra Tailwind classes
 */
export const CharCount = ({ current = 0, max, className = '' }) => {
  if (!max) return null;

  const count = typeof current === 'string' ? current.length : Number(current) || 0;
  const isNearLimit = count >= Math.floor(max * 0.85) && count < max;
  const isAtLimit = count >= max;

  return (
    <span
      className={`text-[11px] font-mono tracking-tight transition-colors select-none ${
        isAtLimit
          ? 'text-rose-500 font-bold'
          : isNearLimit
          ? 'text-amber-500 font-semibold'
          : 'text-[var(--text-muted)]'
      } ${className}`}
      aria-live="polite"
    >
      {count}/{max}
    </span>
  );
};

export default CharCount;

