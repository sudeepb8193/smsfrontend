import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import CustomSelector from '../../../components/shared/CustomSelector';
import ViewToggle from '../../../components/shared/ViewToggle';
import Tooltip from '../../../components/shared/Tooltip';

export const OrganisationFilters = ({
  filters,
  onChange,
  onReset,
  viewMode = 'list',
  onViewModeChange,
}) => {
  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Suspended', value: 'suspended' },
  ];

  const planOptions = [
    { label: 'All Plans', value: 'all' },
    { label: 'Basic Plan', value: 'Basic' },
    { label: 'Pro Plan', value: 'Pro' },
    { label: 'Enterprise Plan', value: 'Enterprise' },
    { label: 'Custom Plan', value: 'Custom' },
  ];

  return (
    <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            placeholder="Search by name, code, owner, email, phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        {/* Filter Custom Selectors & View Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Custom Selector */}
          <div className="min-w-[160px]">
            <CustomSelector
              options={statusOptions}
              value={filters.status}
              onChange={(val) => onChange('status', val)}
              placeholder="All Statuses"
              isSearchable={false}
            />
          </div>

          {/* Plan Custom Selector */}
          <div className="min-w-[160px]">
            <CustomSelector
              options={planOptions}
              value={filters.plan}
              onChange={(val) => onChange('plan', val)}
              placeholder="All Plans"
              isSearchable={false}
            />
          </div>

          {/* Reset Filters Button (Icon Only with Tooltip) */}
          <Tooltip content="Reset Filters" position="top">
            <button
              type="button"
              onClick={onReset}
              className="w-10 h-[40px] flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </Tooltip>

          {/* View Switcher (Icons Only - List vs Grid) */}
          {onViewModeChange && (
            <ViewToggle
              view={viewMode}
              onChange={onViewModeChange}
              options={[
                { id: 'list', title: 'List View' },
                { id: 'grid', title: 'Grid View' },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganisationFilters;
