import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert, Loader2, Info } from 'lucide-react';
import { userService } from '../../../services/userService';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isLastRole
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              {isLastRole ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {isLastRole ? 'Role Removal Blocked' : 'Confirm Role Removal Impact'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target Role: <span className="font-bold text-slate-700 dark:text-slate-200">{roleToRemove.name}</span> for {userDisplayName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2 text-slate-500">
              <Loader2 size={24} className="animate-spin text-primary-600" />
              <p className="text-xs font-medium">Calculating permission impact summary...</p>
            </div>
          ) : isLastRole ? (
            /* BLOCKED CASE: User's last remaining role */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs leading-relaxed font-medium space-y-2">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
                  <ShieldAlert size={18} />
                  <span>Cannot Remove Only Remaining Role</span>
                </div>
                <p>
                  A user must always hold at least <strong>one active role</strong> to retain login access to SalonFlow Pro.
                </p>
                <p className="font-semibold text-rose-800 dark:text-rose-300 bg-white/50 dark:bg-black/20 p-2.5 rounded-lg border border-rose-300 dark:border-rose-700">
                  Deactivation is the correct action if access should be fully removed.
                </p>
              </div>
            </div>
          ) : impactData ? (
            /* ALLOWED REMOVAL IMPACT SUMMARY */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Access Loss Warning:</span> Removing the{' '}
                    <strong>{roleToRemove.name}</strong> role will revoke{' '}
                    <span className="font-extrabold text-amber-700 dark:text-amber-300">
                      {impactData.lostPermissionsCount} permissions
                    </span>{' '}
                    that are not granted by any of the user's other assigned roles.
                  </div>
                </div>
              </div>

              {/* Permissions list */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Exclusive Permissions to be Lost ({impactData.lostPermissionsCount})
                </h4>
                {impactData.lostPermissionsCount === 0 ? (
                  <div className="p-3 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    No exclusive permissions will be lost. All permissions of this role are also granted by other assigned roles.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-800/30">
                    {impactData.lostPermissions.map((perm) => (
                      <div
                        key={perm.id || perm.permissionKey}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-xs"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {perm.label || perm.permissionKey}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                          {perm.moduleLabel || perm.moduleCode}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isLastRole ? 'Close' : 'Cancel'}
            </button>
            {!isLastRole && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting || loading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/25 disabled:opacity-50 transition-all"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                <span>Confirm Removal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveRoleImpactModal;
