import React from 'react';
import { AlertTriangle, X, CheckCircle2, PauseCircle, Power } from 'lucide-react';

export const StatusChangeModal = ({
  isOpen,
  onClose,
  onConfirm,
  organisation,
  targetStatus,
  loading,
}) => {
  if (!isOpen || !organisation) return null;

  const statusMeta = {
    active: {
      title: 'Activate Organisation?',
      description: `Activating "${organisation.name}" will grant users access to login and manage their salon operations.`,
      icon: CheckCircle2,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    inactive: {
      title: 'Deactivate Organisation?',
      description: `Are you sure you want to deactivate "${organisation.name}"? Users of this organisation will NOT be able to access the system, but existing data will remain completely intact. Super Admin can reactivate it at any time.`,
      icon: Power,
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      btnColor: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    suspended: {
      title: 'Suspend Organisation?',
      description: `Suspending "${organisation.name}" will freeze tenant activities. Associated users will be blocked from logging in until reactivated.`,
      icon: PauseCircle,
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
  };

  const meta = statusMeta[targetStatus] || statusMeta.inactive;
  const IconComponent = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden text-[var(--text-primary)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${meta.badgeColor}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {meta.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {meta.description}
          </p>

          <div className="p-3.5 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Selected Organisation
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              {organisation.name}{' '}
              <span className="text-xs text-[var(--text-muted)] font-normal">
                ({organisation.code})
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[var(--bg-input)] border-t border-[var(--border-color)]">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(targetStatus)}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 ${meta.btnColor}`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              'Confirm Change'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;
