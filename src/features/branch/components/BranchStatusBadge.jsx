import React from 'react';

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    dotClass: 'bg-emerald-500 animate-pulse',
    containerClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  draft: {
    label: 'Draft',
    dotClass: 'bg-amber-500',
    containerClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  temporarily_closed: {
    label: 'Temporarily Closed',
    dotClass: 'bg-orange-500',
    containerClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  permanently_closed: {
    label: 'Permanently Closed',
    dotClass: 'bg-rose-500',
    containerClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
};

export const BranchStatusBadge = ({ status = 'draft', size = 'sm', className = '' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border transition-all ${
        isSm ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      } ${config.containerClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default BranchStatusBadge;
