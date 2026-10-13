import React, { useState } from 'react';
import { X, ShieldPlus, Star, Loader2, CheckCircle2 } from 'lucide-react';
import Toggle from '../../../components/shared/Toggle';

export const AddRoleModal = ({
  isOpen,
  onClose,
  onAssign,
  userDisplayName = '',
  assignedRoleIds = [],
  availableRoles = [],
  loading = false,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Filter out roles already assigned to user
  const selectableRoles = availableRoles.filter(
    (r) => !assignedRoleIds.includes(r.id),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoleId) {
      setErrorMsg('Please select a role to assign');
      return;
    }

    setErrorMsg('');
    try {
      await onAssign({ roleId: selectedRoleId, isPrimary });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to assign role');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-input)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
              <ShieldPlus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)] text-base">
                Add Role Assignment
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Assigning access role to <span className="font-bold text-[var(--text-primary)]">{userDisplayName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Select Role
            </label>
            {selectableRoles.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-input)] rounded-xl border border-dashed border-[var(--border-color)]">
                User already holds all available active roles in this organization.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectableRoles.map((role) => {
                  const isSelected = selectedRoleId === role.id;
                  const isInactive = role.status !== 'active';

                  return (
                    <div
                      key={role.id}
                      onClick={() => !isInactive && setSelectedRoleId(role.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isInactive
                          ? 'opacity-50 cursor-not-allowed bg-[var(--bg-input)] border-[var(--border-color)]'
                          : isSelected
                          ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-sm'
                          : 'border-[var(--border-color)] hover:border-[var(--border-hover)] bg-[var(--bg-input)] hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-primary-500 bg-primary-500 text-white'
                              : 'border-[var(--border-color)]'
                          }`}
                        >
                          {isSelected && <CheckCircle2 size={12} className="fill-current" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                            {role.name}
                            {isInactive && (
                              <span className="text-[10px] bg-amber-500/15 text-amber-500 font-bold px-1.5 py-0.5 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                              {role.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Primary Role Option */}
          {selectableRoles.length > 0 && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-warning-500" />
                <div>
                  <span className="text-xs font-semibold text-[var(--text-primary)] block">
                    Mark as Primary Role
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    Drives the default dashboard view for this user
                  </span>
                </div>
              </div>
              <Toggle
                checked={isPrimary}
                onChange={setIsPrimary}
                size="md"
                color="primary"
                aria-label="Mark as Primary Role"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRoleId || selectableRoles.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-md shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>Assign Role</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoleModal;
