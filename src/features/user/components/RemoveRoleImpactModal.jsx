import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { userService } from '../../../services/userService';
import Modal from '../../../components/shared/Modal';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import ErrorMessage from '../../../components/shared/ErrorMessage';

export const RemoveRoleImpactModal = ({
  isOpen,
  onClose,
  onConfirmRemove,
  userId,
  userDisplayName = '',
  roleToRemove = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [impactData, setImpactData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && userId && roleToRemove) {
      const roleId = roleToRemove.roleId || roleToRemove.id;
      fetchImpact(roleId);
    } else {
      setImpactData(null);
      setErrorMsg('');
    }
  }, [isOpen, userId, roleToRemove]);

  const fetchImpact = async (roleId) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await userService.getRoleRemovalImpact(userId, roleId);
      setImpactData(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to calculate role removal impact');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!roleToRemove || impactData?.isLastRole) return;

    const roleId = roleToRemove.roleId || roleToRemove.id;
    setSubmitting(true);
    try {
      await onConfirmRemove(roleId);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove role');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !roleToRemove) return null;

  const isLastRole = impactData?.isLastRole;

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button
        variant="secondary"
        size="medium"
        onClick={onClose}
        disabled={submitting}
      >
        {isLastRole ? 'Close' : 'Cancel'}
      </Button>
      {!isLastRole && (
        <Button
          variant="danger"
          size="medium"
          onClick={handleConfirm}
          disabled={submitting || loading}
          loading={submitting}
        >
          Confirm Removal
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLastRole ? 'Role Removal Blocked' : 'Confirm Role Removal Impact'}
      size="medium"
      footer={footer}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isLastRole
                ? 'bg-rose-500/10 text-rose-500'
                : 'bg-amber-500/10 text-amber-500'
            }`}
          >
            {isLastRole ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)]">Target Role to Remove:</div>
            <div className="text-sm font-bold text-[var(--text-primary)]">
              {roleToRemove.name} <span className="text-xs font-normal text-[var(--text-muted)]">for {userDisplayName}</span>
            </div>
          </div>
        </div>

        {errorMsg && <ErrorMessage message={errorMsg} />}

        {loading ? (
          <Loader text="Calculating permission impact summary..." size="medium" />
        ) : isLastRole ? (
          /* BLOCKED CASE: User's last remaining role */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed font-medium space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <ShieldAlert size={18} />
                <span>Cannot Remove Only Remaining Role</span>
              </div>
              <p>
                A user must always hold at least <strong>one active role</strong> to retain login access to SalonFlow Pro.
              </p>
              <p className="font-semibold text-rose-300 bg-black/30 p-2.5 rounded-lg border border-rose-500/30">
                Deactivation is the correct action if access should be fully removed.
              </p>
            </div>
          </div>
        ) : impactData ? (
          /* ALLOWED REMOVAL IMPACT SUMMARY */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Access Loss Warning:</span> Removing the{' '}
                  <strong>{roleToRemove.name}</strong> role will revoke{' '}
                  <span className="font-extrabold text-amber-400">
                    {impactData.lostPermissionsCount} permissions
                  </span>{' '}
                  that are not granted by any of the user's other assigned roles.
                </div>
              </div>
            </div>

            {/* Permissions list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                Exclusive Permissions to be Lost ({impactData.lostPermissionsCount})
              </h4>
              {impactData.lostPermissionsCount === 0 ? (
                <div className="p-3 text-xs text-[var(--text-muted)] bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
                  No exclusive permissions will be lost. All permissions of this role are also granted by other assigned roles.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-[var(--border-color)] rounded-xl p-2 bg-[var(--bg-input)]">
                  {impactData.lostPermissions.map((perm) => (
                    <div
                      key={perm.id || perm.permissionKey}
                      className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs"
                    >
                      <span className="font-medium text-[var(--text-primary)]">
                        {perm.label || perm.permissionKey}
                      </span>
                      <Badge variant="neutral" size="small" className="font-mono">
                        {perm.moduleLabel || perm.moduleCode}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default RemoveRoleImpactModal;
