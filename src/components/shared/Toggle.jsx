import React, { useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';

// Safe layout effect for SSR and React 19 environments
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Size configurations & exact pixel metrics (defined outside component to prevent re-renders)
 */
const SIZES = {
  sm: {
    trackWidth: 44,
    trackHeight: 22,
    thumbSize: 18,
    inset: 2,
    travel: 22, // 44 - 2 - 18 = 24; 24 - 2 = 22
    dotSize: 5,
    fontSize: 'text-[8px]',
    onLeft: 5,
    offRight: 5,
  },
  md: {
    trackWidth: 60,
    trackHeight: 30,
    thumbSize: 24,
    inset: 3,
    travel: 30, // 60 - 3 - 24 = 33; 33 - 3 = 30
    dotSize: 7,
    fontSize: 'text-[10px]',
    onLeft: 7,
    offRight: 7,
  },
  lg: {
    trackWidth: 76,
    trackHeight: 38,
    thumbSize: 30,
    inset: 4,
    travel: 38, // 76 - 4 - 30 = 42; 42 - 4 = 38
    dotSize: 9,
    fontSize: 'text-xs',
    onLeft: 9,
    offRight: 9,
  },
};

/**
 * Helper to parse hex to rgba with alpha for dynamic glow shadows
 */
const hexToRgba = (hex, alpha = 0.4) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return `rgba(249, 115, 22, ${alpha})`;
  }
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (cleanHex.length >= 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(249, 115, 22, ${alpha})`;
};

/**
 * Get dynamic theme colors: strictly uses primary color for active state
 */
const getThemeColors = () => {
  if (typeof window === 'undefined') {
    return {
      active: '#F97316',
      activeGlow: '0 4px 14px -2px rgba(249, 115, 22, 0.4)',
      inactive: '#E2E8F0',
      inactiveDot: '#94A3B8',
      inactiveGlow: '0 2px 5px rgba(0, 0, 0, 0.06)',
      offTextColor: '#64748B',
    };
  }

  const rootStyles = getComputedStyle(document.documentElement);
  const primaryHex =
    rootStyles.getPropertyValue('--color-primary-600').trim() ||
    rootStyles.getPropertyValue('--color-primary-500').trim() ||
    '#F97316';

  const isDark =
    document.documentElement.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark';

  const inactiveBg = isDark ? '#26262C' : '#E2E8F0';
  const inactiveDot = isDark ? '#666670' : '#94A3B8';
  const offTextColor = isDark ? '#9E9EA7' : '#64748B';

  return {
    active: primaryHex,
    activeGlow: `0 4px 14px -2px ${hexToRgba(primaryHex, 0.4)}`,
    inactive: inactiveBg,
    inactiveDot: inactiveDot,
    inactiveGlow: '0 2px 5px rgba(0, 0, 0, 0.06)',
    offTextColor: offTextColor,
  };
};

/**
 * Animated Pill Toggle Switch Component powered by GSAP
 * - Strictly isolates animation to the specific button whose state changed
 * - Fluid squash & stretch physics with spring overshoot
 * - App PRIMARY theme color active track & soft matching glow
 * - Synchronized centered dot inside the knob
 * - Animated sliding ON / OFF typography
 */
export const Toggle = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  label,
  description,
  isImplied = false,
  id,
  name,
  className = '',
  onLabel = 'ON',
  offLabel = 'OFF',
  showText = true,
  'aria-label': ariaLabel,
  ...props
}) => {
  const toggleId = id || name || `toggle-${Math.random().toString(36).substr(2, 9)}`;
  const currentSize = SIZES[size] || SIZES.md;

  // DOM refs for GSAP animation
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const dotRef = useRef(null);
  const onTextRef = useRef(null);
  const offTextRef = useRef(null);

  // Track previous checked state to ONLY animate when THIS specific toggle's state changes
  const isFirstRender = useRef(true);
  const prevChecked = useRef(checked);

  useIsomorphicLayoutEffect(() => {
    if (!trackRef.current || !thumbRef.current || !dotRef.current) return;

    const colors = getThemeColors();
    const targetX = checked ? currentSize.travel : 0;
    const targetBg = checked ? colors.active : colors.inactive;
    const targetGlow = checked ? colors.activeGlow : colors.inactiveGlow;
    const targetDot = checked ? colors.active : colors.inactiveDot;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevChecked.current = checked;

      // Immediate setup without animation on initial mount
      gsap.set(thumbRef.current, { x: targetX, scaleX: 1, scaleY: 1 });
      gsap.set(trackRef.current, { backgroundColor: targetBg, boxShadow: targetGlow });
      gsap.set(dotRef.current, { backgroundColor: targetDot, scale: 1 });

      if (onTextRef.current) {
        gsap.set(onTextRef.current, {
          autoAlpha: checked ? 1 : 0,
          scale: checked ? 1 : 0.65,
          x: checked ? 0 : -4,
        });
      }
      if (offTextRef.current) {
        gsap.set(offTextRef.current, {
          autoAlpha: !checked ? 1 : 0,
          scale: !checked ? 1 : 0.65,
          x: !checked ? 0 : 4,
          color: colors.offTextColor,
        });
      }
      return;
    }

    // ISOLATION GUARD: Only animate if THIS toggle's checked state actually changed!
    if (prevChecked.current === checked) {
      return;
    }
    prevChecked.current = checked;

    // GSAP animation context for smooth, isolated fluid spring transition
    const ctx = gsap.context(() => {
      // 1. Track background & soft primary glow
      gsap.to(trackRef.current, {
        backgroundColor: targetBg,
        boxShadow: targetGlow,
        duration: 0.32,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      // 2. Thumb translation with fluid spring bounce overshoot
      gsap.to(thumbRef.current, {
        x: targetX,
        duration: 0.34,
        ease: 'back.out(1.5)',
        overwrite: 'auto',
      });

      // 3. Thumb subtle squash & stretch timeline
      const stretchTl = gsap.timeline({ overwrite: 'auto' });
      stretchTl
        .to(thumbRef.current, {
          scaleX: 1.14,
          scaleY: 0.9,
          duration: 0.12,
          ease: 'power1.out',
        })
        .to(thumbRef.current, {
          scaleX: 1,
          scaleY: 1,
          duration: 0.22,
          ease: 'back.out(2)',
        });

      // 4. Center dot color and micro-pop animation
      gsap.to(dotRef.current, {
        backgroundColor: targetDot,
        duration: 0.28,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      const dotTl = gsap.timeline({ overwrite: 'auto' });
      dotTl
        .to(dotRef.current, {
          scale: 0.75,
          duration: 0.1,
          ease: 'power1.in',
        })
        .to(dotRef.current, {
          scale: 1,
          duration: 0.24,
          ease: 'back.out(2.2)',
        });

      // 5. Text transitions: ON & OFF slide + scale + fade
      if (checked) {
        if (offTextRef.current) {
          gsap.to(offTextRef.current, {
            autoAlpha: 0,
            scale: 0.6,
            x: 4,
            duration: 0.16,
            ease: 'power2.in',
            overwrite: 'auto',
          });
        }
        if (onTextRef.current) {
          gsap.fromTo(
            onTextRef.current,
            { autoAlpha: 0, scale: 0.6, x: -4 },
            { autoAlpha: 1, scale: 1, x: 0, duration: 0.28, ease: 'back.out(1.4)', delay: 0.05, overwrite: 'auto' }
          );
        }
      } else {
        if (onTextRef.current) {
          gsap.to(onTextRef.current, {
            autoAlpha: 0,
            scale: 0.6,
            x: -4,
            duration: 0.16,
            ease: 'power2.in',
            overwrite: 'auto',
          });
        }
        if (offTextRef.current) {
          gsap.fromTo(
            offTextRef.current,
            { autoAlpha: 0, scale: 0.6, x: 4, color: colors.offTextColor },
            { autoAlpha: 1, scale: 1, x: 0, duration: 0.28, ease: 'back.out(1.4)', delay: 0.05, overwrite: 'auto' }
          );
        }
      }
    });

    return () => ctx.revert();
  }, [checked, size]);

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent parent cards or row onClick from double-triggering
    if (disabled) return;
    onChange?.(!checked);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onChange?.(!checked);
    }
  };

  const initialColors = getThemeColors();

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        aria-label={ariaLabel || label || (checked ? onLabel : offLabel)}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`group relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 dark:focus-visible:ring-offset-[var(--bg-app)] transition-transform active:scale-[0.96] select-none ${
          disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
        } ${isImplied ? 'ring-2 ring-primary-400 ring-offset-2 dark:ring-offset-[var(--bg-app)] ring-dashed' : ''}`}
        style={{
          width: currentSize.trackWidth,
          height: currentSize.trackHeight,
        }}
        {...props}
      >
        {/* Animated Pill Track */}
        <div
          ref={trackRef}
          className="relative w-full h-full rounded-full flex items-center overflow-hidden"
          style={{
            backgroundColor: checked ? initialColors.active : initialColors.inactive,
            boxShadow: checked ? initialColors.activeGlow : initialColors.inactiveGlow,
          }}
        >
          {/* ON Text */}
          {showText && (
            <span
              ref={onTextRef}
              aria-hidden="true"
              className={`absolute font-black tracking-wider text-white uppercase select-none pointer-events-none ${currentSize.fontSize}`}
              style={{ left: currentSize.onLeft }}
            >
              {onLabel}
            </span>
          )}

          {/* OFF Text */}
          {showText && (
            <span
              ref={offTextRef}
              aria-hidden="true"
              className={`absolute font-black tracking-wider uppercase select-none pointer-events-none ${currentSize.fontSize}`}
              style={{
                right: currentSize.offRight,
                color: initialColors.offTextColor,
              }}
            >
              {offLabel}
            </span>
          )}

          {/* Sliding Thumb with Inner Synchronized Center Dot */}
          <div
            ref={thumbRef}
            className="absolute rounded-full bg-white shadow-sm flex items-center justify-center pointer-events-none"
            style={{
              width: currentSize.thumbSize,
              height: currentSize.thumbSize,
              left: currentSize.inset,
              top: currentSize.inset,
            }}
          >
            {/* Center Dot matching primary/inactive state */}
            <div
              ref={dotRef}
              className="rounded-full pointer-events-none"
              style={{
                width: currentSize.dotSize,
                height: currentSize.dotSize,
                backgroundColor: checked ? initialColors.active : initialColors.inactiveDot,
              }}
            />
          </div>
        </div>
      </button>

      {(label || description) && (
        <label
          htmlFor={toggleId}
          onClick={(e) => e.stopPropagation()}
          className={`select-none ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          {label && (
            <span className="block text-xs font-semibold text-[var(--text-primary)]">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-[11px] text-[var(--text-muted)]">
              {description}
            </span>
          )}
        </label>
      )}
    </div>
  );
};

export default Toggle;
