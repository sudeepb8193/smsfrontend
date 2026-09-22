import React from 'react';
import { Building2, Clock, CalendarDays } from 'lucide-react';

export const ORGANIZATION_TABS = [
  { id: 'setup', label: 'Organization Profile & Setup', icon: Building2, path: '/organization/setup' },
  { id: 'business-hours', label: 'Business Hours & Shifts', icon: Clock, path: '/organization/business-hours' },
  { id: 'holidays', label: 'Holiday Calendar', icon: CalendarDays, path: '/organization/holidays' },
];

export const OrganizationNavTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-2 border-b border-[var(--border-color)] mb-6 pb-2">
      {ORGANIZATION_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default OrganizationNavTabs;
