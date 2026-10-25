import React from 'react';

/**
 * Premium SMS Salon Logo with stylized geometric lotus blossom
 * Matches the production SaaS design specification.
 */
export const SmsLogo = ({
  variant = 'light', // 'light' (on white/light background) or 'dark' (on dark background)
  size = 'md', // 'sm' | 'md' | 'lg'
  showSubtitle = true,
  className = '',
}) => {
  const isDarkBg = variant === 'dark';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Lotus Floral SVG Icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center shrink-0 rounded-xl transition-transform duration-300 hover:scale-105`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Outer Petals */}
          <path
            d="M24 6C24 6 15 16 15 25C15 31.075 19.029 35 24 35C28.971 35 33 31.075 33 25C33 16 24 6 24 6Z"
            stroke={isDarkBg ? '#FB923C' : '#F97316'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Left Petal */}
          <path
            d="M17.5 17C13 20 8 26 8 32C8 36.5 12 39 16.5 39C20.5 39 23 36.5 24 35"
            stroke={isDarkBg ? '#FDBA74' : '#F97316'}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Petal */}
          <path
            d="M30.5 17C35 20 40 26 40 32C40 36.5 36 39 31.5 39C27.5 39 25 36.5 24 35"
            stroke={isDarkBg ? '#FDBA74' : '#F97316'}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Base Calyx Curve */}
          <path
            d="M14 39C17 41.5 20.3 42.5 24 42.5C27.7 42.5 31 41.5 34 39"
            stroke={isDarkBg ? '#FB923C' : '#F97316'}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Inner Stamen Accent */}
          <circle cx="24" cy="24" r="2.5" fill={isDarkBg ? '#FB923C' : '#F97316'} />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex items-center gap-1.5 leading-none">
        <span
          className={`font-extrabold tracking-tight font-jakarta ${titleSizes[size]} ${
            isDarkBg ? 'text-white' : 'text-slate-900'
          }`}
        >
          SalonFlow <span className={isDarkBg ? 'text-primary-400' : 'text-primary-500'}>Pro</span>
        </span>
      </div>
    </div>
  );
};

export default SmsLogo;
