import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  title = 'No records found',
  description = 'There are no data items available to display right now.',
  action,
  icon: Icon = PackageOpen,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-12 bg-[var(--bg-input)] border border-dashed border-[var(--border-color)] rounded-2xl ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary-500/15 text-primary-500 flex items-center justify-center mb-4">
        {React.isValidElement(Icon) ? Icon : <Icon size={32} />}
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
