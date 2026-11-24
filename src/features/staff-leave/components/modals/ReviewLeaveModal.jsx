import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import { Textarea } from '../../../../components/shared/Textarea';
import { Badge } from '../../../../components/shared/Badge';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Clock,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';

/**
 * ReviewLeaveModal: Used by Managers, Admins, and Owners to inspect a pending leave request,
 * evaluate staffing impact and leave balance metrics, and execute atomic approval or rejection.
 */
export default function ReviewLeaveModal({
  isOpen,
  onClose,
  request,
  onReview,
  isSubmitting = false,
}) {
  const [action, setAction] = useState('approve'); // 'approve' | 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (formError) setFormError('');
  };

  useEffect(() => {
    setErrors({});
    setFormError('');
    setAction('approve');
    setRejectionReason('');
    setNotes('');
  }, [isOpen, request]);

  if (!request) return null;

  const staff = request.staff || {};
  const leaveType = request.leaveType || {};
  const balance = request.balanceMetrics || null;

  const availableDays = balance ? Number(balance.availableDays || 0) : null;
  const requestedDays = Number(request.durationDays || 0);
  const isShortfall = availableDays !== null && requestedDays > availableDays;
  const projectedBalance = availableDays !== null ? availableDays - requestedDays : null;

  const handleExecute = async () => {
    setFormError('');
    const newErrors = {};

    if (action === 'reject' && (!rejectionReason.trim() || rejectionReason.trim().length < 3)) {
      newErrors.rejectionReason = 'Please specify a rejection reason of at least 3 characters for the audit trail';
      setErrors(newErrors);
      return;
    }

    try {
      await onReview({
        id: request.id,
        payload: {
          action,
          rejectionReason: action === 'reject' ? rejectionReason.trim() : undefined,
          notes: notes.trim() || undefined,
        },
      });
      onClose();
    } catch (err) {
      setFormError(err?.message || 'Failed to review leave request');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Leave Application"
      size="large"
    >
      <div className="space-y-6">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Staff & Leave Type Summary Header */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center font-bold text-primary-600 text-lg">
              {staff.firstName ? staff.firstName[0] : 'S'}
              {staff.lastName ? staff.lastName[0] : ''}
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {staff.firstName} {staff.lastName}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Code: {staff.employeeCode || 'N/A'} • Branch: {staff.branch?.name || request.branch?.name || 'All'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <Badge variant="primary" className="text-xs font-semibold">
              {leaveType.name} ({leaveType.code})
            </Badge>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              {leaveType.isPaid ? 'Paid Leave' : 'Unpaid Leave'}
            </p>
          </div>
        </div>

        {/* Request Details & Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span>Requested Period:</span>
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {new Date(request.startDate).toLocaleDateString()} — {new Date(request.endDate).toLocaleDateString()}
            </p>
            {request.isHalfDay && (
              <Badge variant="secondary" className="text-[10px]">
                Half Day ({request.halfDayPeriod === 'morning' || request.halfDayPeriod === 'FIRST_HALF' ? 'Morning' : 'Afternoon'})
              </Badge>
            )}
          </div>

          <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>Authoritative Duration:</span>
            </div>
            <p className="text-sm font-bold text-primary-600">
              {requestedDays} {requestedDays === 1 ? 'Working Day' : 'Working Days'}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              Excludes public holidays and branch off-days
            </p>
          </div>
        </div>

        {/* Reason & Supporting Documentation */}
        <div className="p-4 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-1">Reason:</h4>
            <p className="text-xs text-[var(--text-secondary)] italic bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-color)]">
              "{request.reason || 'No reason provided'}"
            </p>
          </div>

          {request.supportingDocumentUrl && (
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-primary)] font-medium">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Supporting Document Attached</span>
              </div>
              <a
                href={request.supportingDocumentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                <span>View Attachment</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {request.emergencyContactPhone && (
            <div className="text-xs text-[var(--text-muted)]">
              <strong>Emergency Phone:</strong> {request.emergencyContactPhone}
            </div>
          )}
        </div>

        {/* Balance Impact Metrics */}
        {availableDays !== null && (
          <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Leave Balance Impact
              </h4>
              {isShortfall && (
                <Badge variant="danger" className="text-xs flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Shortfall: Exceeds Available by {requestedDays - availableDays} days
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 bg-[var(--bg-card-hover)] rounded-lg">
                <span className="text-[10px] text-[var(--text-muted)] block">Current Available</span>
                <span className="text-sm font-bold text-[var(--text-primary)]">{availableDays}d</span>
              </div>
              <div className="p-2.5 bg-[var(--bg-card-hover)] rounded-lg">
                <span className="text-[10px] text-[var(--text-muted)] block">Requested</span>
                <span className="text-sm font-bold text-amber-500">-{requestedDays}d</span>
              </div>
              <div className="p-2.5 bg-[var(--bg-card-hover)] rounded-lg">
                <span className="text-[10px] text-[var(--text-muted)] block">Projected Balance</span>
                <span
                  className={`text-sm font-bold ${
                    projectedBalance < 0 ? 'text-rose-500' : 'text-emerald-500'
                  }`}
                >
                  {projectedBalance}d
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Review Action Selection (Approve vs Reject) */}
        <div className="space-y-4 pt-2 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
              <input
                type="radio"
                name="reviewAction"
                value="approve"
                checked={action === 'approve'}
                onChange={() => {
                  setAction('approve');
                  clearError('rejectionReason');
                }}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Approve Application
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
              <input
                type="radio"
                name="reviewAction"
                value="reject"
                checked={action === 'reject'}
                onChange={() => setAction('reject')}
                className="w-4 h-4 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Reject Application
              </span>
            </label>
          </div>

          {action === 'reject' && (
            <div>
              <Textarea
                label="Rejection Reason (Audit Trail Mandate)"
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  clearError('rejectionReason');
                }}
                error={errors.rejectionReason}
                placeholder="State the specific operational, staffing, or policy reason for rejecting this leave..."
                rows={2}
                maxLength={255}
                showCharCount={true}
                required
              />
            </div>
          )}

          <div>
            <Textarea
              label="Manager / Reviewer Internal Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any internal guidance or shift coverage instructions..."
              rows={2}
              maxLength={255}
              showCharCount={true}
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={action === 'approve' ? 'primary' : 'danger'}
            onClick={handleExecute}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
