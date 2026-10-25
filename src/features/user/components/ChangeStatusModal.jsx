import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Clock,
  UserX,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../../../components/shared/Modal';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import { userService } from '../../../services/userService';

export const ChangeStatusModal = ({
  isOpen,
  onClose,
  targetUser,
  currentUser,
  onStatusChanged,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('deactivated');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentStatus = targetUser?.status || 'active';
  const isSelf = targetUser?.id && currentUser?.id && targetUser.id === currentUser.id;

  useEffect(() => {
    if (targetUser) {
      if (currentStatus === 'active') {
        setSelectedStatus('deactivated');
      } else {
        setSelectedStatus('active');
      }
      setReason('');
      setErrorMsg('');
    }
  }, [targetUser, currentStatus, isOpen]);

  if (!isOpen || !targetUser) return null;

  const isDeactivating = selectedStatus === 'deactivated' || selectedStatus === 'suspended';

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (isSelf && isDeactivating) {
      setErrorMsg('You cannot deactivate or suspend your own account.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        status: selectedStatus,
        reason: reason.trim() || undefined,
      };

      const result = await userService.changeUserStatus(targetUser.id, payload);
      toast.success(
        result?.message || `Account for ${targetUser.displayName} updated to ${selectedStatus}!`,
      );

      if (onStatusChanged) {
        await onStatusChanged({
          ...targetUser,
          status: selectedStatus,
        });
      }

      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update user status';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        currentStatus === 'active'
          ? `Deactivate / Suspend User: ${targetUser.displayName}`
          : `Reactivate Account: ${targetUser.displayName}`
      }
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Card Summary */}
        <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="font-bold text-sm text-[var(--text-primary)] block truncate">
              {targetUser.displayName}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono block truncate">
              {targetUser.email || targetUser.phoneNumber || 'No email registered'}
            </span>
          </div>
          <Badge
            variant={
              currentStatus === 'active'
                ? 'success'
                : currentStatus === 'pending_invite'
                ? 'warning'
                : 'neutral'
            }
            size="small"
          >
            <span className="capitalize">{currentStatus.replace('_', ' ')}</span>
          </Badge>
        </div>

        {/* Self-Protection Alert */}
        {isSelf && isDeactivating && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Self-Action Prohibited</span>
              <span>
                You are currently signed into this account. System safeguards prohibit self-deactivation or self-suspension to prevent locking your organization out.
              </span>
            </div>
          </div>
        )}

        {/* Action Selection for Active User */}
        {currentStatus === 'active' ? (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Choose Target Action
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedStatus('deactivated')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedStatus === 'deactivated'
                    ? 'border-rose-500/50 bg-rose-500/10 text-[var(--text-primary)] shadow-sm'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-color-hover)]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-rose-500 mb-1">
                  <UserX size={15} />
                  <span>Deactivate Account</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Revokes login access immediately. Preserves historical appointment, billing, and audit records.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('suspended')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedStatus === 'suspended'
                    ? 'border-amber-500/50 bg-amber-500/10 text-[var(--text-primary)] shadow-sm'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-color-hover)]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-amber-500 mb-1">
                  <Clock size={15} />
                  <span>Suspend Temporarily</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Temporarily freezes authentication (e.g. for extended leave or security review).
                </p>
              </button>
            </div>
          </div>
        ) : (
          /* Action Selection for Deactivated / Suspended User */
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Reactivate Account</span>
              <span>
                Setting this account to <strong>Active</strong> will immediately restore login credentials with their existing password and assigned permissions.
              </span>
            </div>
          </div>
        )}

        {/* Reason for Audit Log */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Audit Reason <span className="text-[var(--text-muted)] font-normal">(Optional, saved to status log)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              selectedStatus === 'deactivated'
                ? 'e.g. Employee resigned, contract ended'
                : selectedStatus === 'suspended'
                ? 'e.g. Temporary leave of absence'
                : 'e.g. Returned to service, account re-enabled'
            }
            maxLength={255}
            rows={3}
            className="w-full text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] p-3 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <div className="text-right text-[10px] text-[var(--text-muted)] font-mono">
            {reason.length}/255
          </div>
        </div>

        {/* Error Display */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
          <Button
            type="button"
            variant="outline"
            size="small"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant={selectedStatus === 'deactivated' ? 'danger' : 'primary'}
            size="small"
            disabled={submitting || (isSelf && isDeactivating)}
            className="font-bold"
          >
            {submitting
              ? 'Updating Status...'
              : selectedStatus === 'deactivated'
              ? 'Confirm Deactivation'
              : selectedStatus === 'suspended'
              ? 'Confirm Suspension'
              : 'Reactivate Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangeStatusModal;
