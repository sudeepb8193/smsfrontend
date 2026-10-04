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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${meta.badgeColor}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {meta.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {meta.description}
          </p>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Selected Organisation
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {organisation.name}{' '}
              <span className="text-xs text-slate-500 font-normal">
                ({organisation.code})
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
