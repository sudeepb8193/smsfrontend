import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Store, AlertTriangle, X, CheckCircle2, ShieldAlert } from 'lucide-react';

export const MarketplaceToggleModal = ({
  isOpen,
  onClose,
  onConfirm,
  targetEnabled,
  loading,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(targetEnabled, reason);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop with oversized bleed */}
      <div
        className="fixed -inset-10 bg-black/75 backdrop-blur-md transition-opacity duration-200 animate-fadeOnly"
        style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="min-h-full flex items-center justify-center p-4 relative z-10" onClick={onClose}>
      <div className="w-full max-w-lg bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden text-[var(--text-primary)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                targetEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {targetEnabled ? (
                <Store className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {targetEnabled
                ? 'Enable Central Marketplace?'
                : 'Disable Central Marketplace?'}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {targetEnabled
              ? 'Enabling the Central Marketplace allows customers to search across all branches and discover services. It makes public listings visible.'
              : 'Disabling the Central Marketplace hides public salon listings. Appointments and operational records remain completely safe and untouched.'}
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)]">
              Reason or Note (Optional):
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Operational policy update or temporary pause..."
              rows={3}
              className="w-full p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500 placeholder:text-[var(--text-muted)] resize-none"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[var(--bg-input)] border-t border-[var(--border-color)]">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
              targetEnabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : targetEnabled ? (
              'Confirm & Enable Marketplace'
            ) : (
              'Confirm & Disable Marketplace'
            )}
          </button>
        </div>
      </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default MarketplaceToggleModal;
