import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Textarea from '../../../../components/shared/Textarea';
import Badge from '../../../../components/shared/Badge';
import { toast } from 'sonner';
import { approveCorrection, rejectCorrection } from '../../api/staffAttendanceApi';
import { Clock, CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';

export const ReviewCorrectionModal = ({
  isOpen,
  onClose,
  onSuccess,
  correction,
  organizationId,
}) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!correction) return null;

  const handleAction = async (action) => {
    setIsProcessing(true);
    try {
      if (action === 'approve') {
        await approveCorrection(
          correction.id,
          { reviewNotes: reviewNotes.trim() },
          organizationId,
        );
        toast.success(`Correction for ${correction.staff?.fullName || 'employee'} approved.`);
      } else {
        await rejectCorrection(
          correction.id,
          { reviewNotes: reviewNotes.trim() },
          organizationId,
        );
        toast.info(`Correction request rejected.`);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || `Failed to ${action} correction.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return 'None';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Attendance Correction"
      description="Inspect employee punch correction request and apply or reject the proposed change."
    >
      <div className="space-y-4">
        {/* Employee Summary Card */}
        <div className="p-3.5 bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)] flex items-center justify-between">
          <div>
            <div className="font-semibold text-[var(--text-primary)]">
              {correction.staff?.fullName}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              ID: {correction.staff?.employeeCode} • {correction.staff?.homeBranch?.name}
            </div>
          </div>
          <Badge variant="warning">Pending Review</Badge>
        </div>

        {/* Comparison: Original vs Proposed */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-[var(--bg-app)] border border-[var(--border-color)]">
            <div className="text-xs font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1.5">
              <Clock size={14} /> Originally Recorded
            </div>
            <div className="text-[var(--text-secondary)]">
              In: <span className="font-mono text-[var(--text-primary)] font-medium">{formatTime(correction.attendance?.checkInAt)}</span>
            </div>
            <div className="text-[var(--text-secondary)]">
              Out: <span className="font-mono text-[var(--text-primary)] font-medium">{formatTime(correction.attendance?.checkOutAt)}</span>
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              Status: {correction.attendance?.status || 'absent'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
            <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1 flex items-center gap-1.5">
              <ArrowRight size={14} /> Requested Times
            </div>
            <div className="text-[var(--text-primary)]">
              In: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatTime(correction.requestedCheckInAt)}</span>
            </div>
            <div className="text-[var(--text-primary)]">
              Out: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatTime(correction.requestedCheckOutAt)}</span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              Date: {new Date(correction.correctionDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <div className="text-xs font-semibold text-[var(--text-secondary)] mb-1">
            Reason Stated by Staff:
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--bg-app)] text-sm text-[var(--text-primary)] italic border border-[var(--border-color)]">
            "{correction.reason}"
          </div>
        </div>

        {correction.supportingDocumentUrl && (
          <div>
            <div className="text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Supporting Evidence:
            </div>
            <a
              href={correction.supportingDocumentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
            >
              <FileText size={14} /> View Document / Evidence
            </a>
          </div>
        )}

        {/* Review Notes */}
        <div>
          <Textarea
            label="Manager Review Notes (Optional)"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Add explanation for approval or rejection..."
            rows={2}
            maxLength={255}
            showCharCount={true}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
          <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={() => handleAction('reject')}
              disabled={isProcessing}
              icon={XCircle}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => handleAction('approve')}
              disabled={isProcessing}
              icon={CheckCircle2}
            >
              Approve Correction
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewCorrectionModal;
