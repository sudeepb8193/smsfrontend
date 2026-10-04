import React from 'react';

export const UnderlineTabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  size = 'md',
}) => {
  return (
    <div
      className={`relative flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar ${className}`}
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
                ? 'text-primary-600 dark:text-primary-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-t-xl'
            }`}
          >
            {Icon && (
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
            )}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count !== null && (
              <span
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
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
