import React, { useState } from 'react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
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
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {targetEnabled
              ? 'Enabling the Central Marketplace will make published salon listings discoverable on the central discovery directory (salons.example.com). Consumers can search, compare, and book appointments through the marketplace.'
              : 'Disabling the Central Marketplace will immediately hide consumer discovery and prevent new bookings placed via the central directory (salons.example.com).'}
          </p>

          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              targetEnabled
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/5 border-amber-500/20 text-amber-300'
            }`}
          >
            <span className="font-semibold block mb-0.5">
              {targetEnabled ? 'Operational Notice:' : 'Important Continuity Rule:'}
            </span>
            {targetEnabled
              ? 'Only organisations configured in "Central Marketplace" operating mode with published listings will be shown to public consumers.'
              : 'Direct website bookings on individual salon domains remain 100% active and will not be interrupted by this action.'}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
              Reason / Audit Note (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Scheduled marketplace maintenance or platform review"
              className="w-full px-3.5 py-2 text-sm bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
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
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 ${
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
  );
};

export default MarketplaceToggleModal;
