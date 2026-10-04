import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import Tooltip from './Tooltip';

export const ViewToggle = ({
  view = 'list',
  onChange,
  options = [
    { id: 'list', label: 'List', icon: List, title: 'List View' },
    { id: 'grid', label: 'Grid', icon: LayoutGrid, title: 'Grid View' },
  ],
  className = '',
}) => {
  const activeIndex = Math.max(
    0,
    options.findIndex((opt) => opt.id === view)
  );

  const getIcon = (opt) => {
    if (opt.icon) return opt.icon;
    if (opt.id === 'grid') return LayoutGrid;
    if (opt.id === 'list' || opt.id === 'table') return List;
    return null;
  };

  return (
    <div
      className={`relative inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl select-none h-[40px] transition-colors ${className}`}
    >
      {/* Sliding Active Primary Background Pill */}
      <div
        className="absolute top-0.5 bottom-0.5 w-9 bg-primary-600 rounded-lg shadow-sm shadow-primary-600/30 transition-all duration-300 ease-out pointer-events-none"
        style={{
          transform: `translateX(${activeIndex * 2.25}rem)`,
        }}
      />

      {/* Toggle Options (Icon Only) */}
      {options.map((opt) => {
        const Icon = getIcon(opt);
        const isActive = opt.id === view;
        const itemTitle = opt.title || `${opt.label || opt.id} View`;

        return (
          <Tooltip key={opt.id} content={itemTitle} position="top">
            <button
              type="button"
              onClick={() => onChange && onChange(opt.id)}
              className={`relative z-10 w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-200 cursor-pointer ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default ViewToggle;
