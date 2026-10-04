import React, { useState, useRef, useEffect } from 'react';

/**
 * Custom Tooltip component to replace default browser `title` attributes.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.content - Tooltip text or node content.
 * @param {React.ReactNode} props.children - Element that triggers the tooltip on hover/focus.
 * @param {'top' | 'bottom' | 'left' | 'right'} [props.position='top'] - Position relative to children.
 * @param {number} [props.delay=150] - Delay in ms before showing tooltip.
 * @param {string} [props.className=''] - Additional CSS classes for tooltip popup.
 */
export const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 150,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);

  if (!content) return <>{children}</>;

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8; // distance from trigger element

    let top = 0;
    let left = 0;

    switch (position) {
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
        break;
      case 'top':
      default:
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
        break;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Compute transform translation according to position
  const getTransformStyle = () => {
    switch (position) {
      case 'bottom':
        return 'translate(-50%, 0)';
      case 'left':
        return 'translate(-100%, -50%)';
      case 'right':
        return 'translate(0, -50%)';
      case 'top':
      default:
        return 'translate(-50%, -100%)';
    }
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className="inline-flex max-w-max"
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: getTransformStyle(),
            zIndex: 9999,
          }}
          role="tooltip"
          className={`pointer-events-none px-2.5 py-1.5 text-xs font-semibold text-white bg-black rounded-lg shadow-2xl border border-white/15 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${className}`}
        >
          {content}

          {/* Arrow */}
          <span
            className={`absolute w-2 h-2 bg-black border-white/15 rotate-45 ${
              position === 'bottom'
                ? '-top-1 left-1/2 -translate-x-1/2 border-t border-l'
                : position === 'left'
                ? '-right-1 top-1/2 -translate-y-1/2 border-t border-r'
                : position === 'right'
                ? '-left-1 top-1/2 -translate-y-1/2 border-b border-l'
                : '-bottom-1 left-1/2 -translate-x-1/2 border-b border-r'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
