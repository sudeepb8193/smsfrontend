import React from 'react';

export const UnderlineTabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  size = 'md',
  showBorder = false,
}) => {
  return (
    <div
      className={`relative flex items-center gap-1 ${
        showBorder ? 'border-b border-[var(--border-color)]' : ''
      } overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange && onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer whitespace-nowrap group ${
              isActive
                ? 'text-primary-500 font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-t-xl'
            }`}
          >
            {Icon && (
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-primary-500' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                }`}
              />
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count !== null && (
              <span
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-500 border border-primary-500/30'
                    : 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                {tab.count}
              </span>
            )}

            {/* Center-Expanding Outward Underline Indicator (Half Left, Half Right) */}
            <span
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] bg-primary-600 dark:bg-primary-400 rounded-full transition-all duration-300 ease-out origin-center ${
                isActive
                  ? 'w-full scale-x-100 opacity-100'
                  : 'w-full scale-x-0 opacity-0'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default UnderlineTabs;
