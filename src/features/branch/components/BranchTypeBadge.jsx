import React from 'react';
import { Crown, Building2, Store } from 'lucide-react';

const TYPE_CONFIG = {
  flagship: {
    label: 'Flagship',
    icon: Crown,
    containerClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  standard: {
    label: 'Standard',
    icon: Building2,
    containerClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  kiosk: {
    label: 'Kiosk',
    icon: Store,
    containerClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  },
};

export const BranchTypeBadge = ({ type = 'standard', size = 'sm', className = '' }) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.standard;
  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      } ${config.containerClass} ${className}`}
    >
      <Icon size={isSm ? 12 : 14} />
      <span>{config.label}</span>
    </span>
  );
};

export default BranchTypeBadge;
