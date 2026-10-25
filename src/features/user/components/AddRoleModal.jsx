import React, { useState } from 'react';
import { ShieldPlus, Star, CheckCircle2 } from 'lucide-react';
import Modal from '../../../components/shared/Modal';
import Button from '../../../components/shared/Button';
import Toggle from '../../../components/shared/Toggle';
import Badge from '../../../components/shared/Badge';
import ErrorMessage from '../../../components/shared/ErrorMessage';
import EmptyState from '../../../components/shared/EmptyState';

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
    if (e && e.preventDefault) e.preventDefault();
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

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button
        variant="secondary"
        size="medium"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        size="medium"
        onClick={handleSubmit}
        disabled={loading || !selectedRoleId || selectableRoles.length === 0}
        loading={loading}
      >
        Assign Role
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Role Assignment"
      size="small"
      footer={footer}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
          <ShieldPlus size={18} className="shrink-0" />
          <p className="text-xs text-[var(--text-secondary)]">
            Assigning access role to <strong className="text-[var(--text-primary)] font-bold">{userDisplayName}</strong>
          </p>
        </div>

        {errorMsg && <ErrorMessage message={errorMsg} />}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Select Role
          </label>
          {selectableRoles.length === 0 ? (
            <EmptyState
              title="No available roles"
              description="User already holds all available active roles in this organization."
              className="py-6 px-4"
            />
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
                            <Badge variant="warning" size="small">
                              Inactive
                            </Badge>
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
      </div>
    </Modal>
  );
};

export default AddRoleModal;
