import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import Tooltip from './Tooltip';

export const ViewToggle = ({
  view,
  value,
  onChange,
  options = [
    { id: 'list', label: 'List', icon: List, title: 'List View' },
    { id: 'grid', label: 'Grid', icon: LayoutGrid, title: 'Grid View' },
  ],
  className = '',
}) => {
  // Support either `value` or `view` prop
  const currentView = value !== undefined ? value : (view !== undefined ? view : options[0]?.id);

  // Match current active option index (with tolerance for 'list' <-> 'table' aliases)
  const resolveActiveIndex = () => {
    let idx = options.findIndex((opt) => opt.id === currentView);
    if (idx !== -1) return idx;

    if (currentView === 'list' || currentView === 'table') {
      idx = options.findIndex((opt) => opt.id === 'list' || opt.id === 'table');
      if (idx !== -1) return idx;
    }

    return 0;
  };

  const activeIndex = resolveActiveIndex();

  const isOptionActive = (optId) => {
    if (optId === currentView) return true;
    if ((optId === 'list' || optId === 'table') && (currentView === 'list' || currentView === 'table')) {
      const hasExact = options.some((o) => o.id === currentView);
      if (!hasExact) return true;
    }
    return false;
  };

  const getIcon = (opt) => {
    if (opt.icon) return opt.icon;
    if (opt.id === 'grid') return LayoutGrid;
    if (opt.id === 'list' || opt.id === 'table') return List;
    return null;
  };

  return (
    <div
      className={`relative inline-flex items-center p-0.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl select-none h-[40px] transition-colors ${className}`}
    >
      {/* Sliding Active Primary Background Pill */}
      <div
        className="absolute top-0.5 bottom-0.5 left-0.5 w-9 bg-primary-500 rounded-lg shadow-sm shadow-primary-500/30 transition-all duration-300 ease-out pointer-events-none"
        style={{
          transform: `translateX(${activeIndex * 2.25}rem)`,
        }}
      />

      {/* Toggle Options (Icon Only) */}
      {options.map((opt) => {
        const Icon = getIcon(opt);
        const isActive = isOptionActive(opt.id);
        const itemTitle = opt.title || `${opt.label || opt.id} View`;

        return (
          <Tooltip key={opt.id} content={itemTitle} position="top">
            <button
              type="button"
              onClick={() => onChange && onChange(opt.id)}
              className={`relative z-10 w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-200 cursor-pointer ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
