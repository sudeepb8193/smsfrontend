import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import { toast } from '../../../../components/shared/Toast';
import { approvePeriod } from '../../api/staffAttendanceApi';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export const PeriodApprovalModal = ({
  isOpen,
  onClose,
  onSuccess,
  staff,
  periodStart,
  periodEnd,
  branchId,
  organizationId,
}) => {
  const [isApproving, setIsApproving] = useState(false);

  if (!staff) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approvePeriod(
        {
          branchId,
          staffId: staff.staffId,
          periodStart,
          periodEnd,
        },
        organizationId,
      );

      toast.success(
        `Attendance period signed off and locked for ${staff.fullName}. Ready for payroll.`,
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to approve attendance period.');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve & Lock Attendance Period"
      description="Formal manager sign-off for payroll processing."
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-sm">
          <div className="font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary-500" />
            {staff.fullName} ({staff.employeeCode})
          </div>
          <div className="text-[var(--text-secondary)] text-xs">
            Period: <span className="text-[var(--text-primary)] font-mono font-medium">{periodStart} to {periodEnd}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[var(--bg-app)] rounded-lg border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)]">Present Days:</span>{' '}
            <span className="font-bold text-[var(--text-primary)]">{staff.presentDays}</span>
          </div>
          <div className="p-3 bg-[var(--bg-app)] rounded-lg border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)]">Late Arrivals:</span>{' '}
            <span className="font-bold text-amber-600 dark:text-amber-400">{staff.lateDays}</span>
          </div>
          <div className="p-3 bg-[var(--bg-app)] rounded-lg border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)]">Total Worked:</span>{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{staff.totalWorkedHoursFormatted}</span>
          </div>
          <div className="p-3 bg-[var(--bg-app)] rounded-lg border border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)]">Overtime:</span>{' '}
            <span className="font-bold text-primary-600 dark:text-primary-400">{staff.totalOvertimeHoursFormatted}</span>
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <strong>Financial Integrity Lock:</strong> Approving this period sets <code className="bg-black/10 dark:bg-black/30 px-1 rounded font-mono">isLocked = true</code> on all underlying attendance rows, preventing modifications or new correction requests without an explicit manager reopen.
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
          <Button variant="secondary" onClick={onClose} disabled={isApproving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={isApproving}
            icon={Lock}
          >
            {isApproving ? 'Locking...' : 'Sign Off & Lock Period'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PeriodApprovalModal;
