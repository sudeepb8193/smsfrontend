import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Textarea from '../../../../components/shared/Textarea';
import { toast } from '../../../../components/shared/Toast';
import { reopenPeriod } from '../../api/staffAttendanceApi';
import { Unlock, AlertTriangle } from 'lucide-react';

export const ReopenPeriodModal = ({
  isOpen,
  onClose,
  onSuccess,
  staff,
  organizationId,
}) => {
  const [reason, setReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);

  if (!staff) return null;

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('A mandatory justification reason is required to reopen an approved period.');
      return;
    }

    setIsReopening(true);
    try {
      await reopenPeriod(
        staff.approvalId,
        { reason: reason.trim() },
        organizationId,
      );

      toast.warning(
        `Attendance period unlocked for ${staff.fullName}. Records can now accept corrections and will require re-approval.`,
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to reopen period.');
    } finally {
      setIsReopening(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reopen Attendance Period"
      description="Unlock historical attendance records to allow retroactive corrections."
    >
      <form onSubmit={handleReopen} className="space-y-4">
        {/* Warning banner */}
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
          <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div>
            <div className="font-semibold text-rose-700 dark:text-rose-300 mb-0.5">
              Downstream Payroll Warning:
            </div>
            If Payroll has already consumed or processed figures for this period, unlocking it invalidates finalized numbers and may require manual payroll recalculation.
          </div>
        </div>

        <div className="text-sm text-[var(--text-secondary)]">
          Target Employee: <strong className="text-[var(--text-primary)] font-semibold">{staff.fullName}</strong> ({staff.employeeCode})
        </div>

        <div>
          <Textarea
            label="Mandatory Reopening Justification"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this approved period must be reopened (e.g. employee submitted verified late punch correction)..."
            rows={3}
            required
            maxLength={255}
            showCharCount={true}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
          <Button variant="secondary" onClick={onClose} disabled={isReopening}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={isReopening}
            icon={Unlock}
          >
            {isReopening ? 'Reopening...' : 'Confirm Reopen'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReopenPeriodModal;
