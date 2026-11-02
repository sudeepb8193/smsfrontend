import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import { Building2, AlertTriangle } from 'lucide-react';

export default function BranchOverrideModal({
  isOpen,
  onClose,
  onSave,
  serviceName,
  branch,
  currentAvailability,
  loading = false,
}) {
  const [reason, setReason] = useState(currentAvailability?.reason || '');
  const [isAvailable, setIsAvailable] = useState(
    currentAvailability ? currentAvailability.isAvailable : false,
  );
  const [error, setError] = useState('');

  const isHome = branch?.isHomeBranch;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    onSave({
      branchId: branch.id,
      isAvailable,
      reason: reason.trim() || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Branch Service Availability Exception"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="text-xs text-[var(--text-muted)]">Service:</div>
          <div className="font-extrabold text-sm text-[var(--text-primary)] mb-2">
            {serviceName}
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Building2 size={13} />
            <span>Branch:</span>
            <span className="font-bold text-[var(--text-primary)]">
              {branch?.name} ({branch?.code})
            </span>
            {isHome && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary-500/10 text-primary-600 font-bold">
                Home Branch
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--text-secondary)]">
            Availability Status at this Branch
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsAvailable(true)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                isAvailable
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]'
              }`}
            >
              Available
            </button>
            <button
              type="button"
              onClick={() => setIsAvailable(false)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                !isAvailable
                  ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]'
              }`}
            >
              Not Available (Exception)
            </button>
          </div>
        </div>

        {!isAvailable && (
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Reason for Limitation (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Specialized ventilation or equipment unavailable at this location"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Internal explanation of why this service cannot be booked at this location.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Save Exception
          </Button>
        </div>
      </form>
    </Modal>
  );
}

