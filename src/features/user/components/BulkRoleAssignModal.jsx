import React, { useState } from 'react';
import { Users, Star, CheckCircle2 } from 'lucide-react';
import { userService } from '../../../services/userService';
import Modal from '../../../components/shared/Modal';
import Button from '../../../components/shared/Button';
import CustomSelector from '../../../components/shared/CustomSelector';
import SearchInput from '../../../components/shared/SearchInput';
import Toggle from '../../../components/shared/Toggle';
import Badge from '../../../components/shared/Badge';
import ErrorMessage from '../../../components/shared/ErrorMessage';
import { notifyPermissionUpdate } from '../../../utils/permissionUtils';

export const BulkRoleAssignModal = ({
  isOpen,
  onClose,
  users = [],
  availableRoles = [],
  onSuccess,
}) => {
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleToggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (selectedUserIds.length === 0) {
      setErrorMsg('Please select at least one user');
      return;
    }
    if (!selectedRoleId) {
      setErrorMsg('Please select a target role to assign');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await userService.bulkAssignRoles({
        userIds: selectedUserIds,
        roleId: selectedRoleId,
        isPrimary,
      });

      notifyPermissionUpdate({ userIds: selectedUserIds });
      setResultSummary(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete bulk role assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions = availableRoles.map((role) => ({
    value: role.id,
    label: role.name,
    badge: role.status !== 'active' ? 'Inactive' : null,
  }));

  const footer = resultSummary ? (
    <div className="flex justify-end w-full">
      <Button variant="primary" size="medium" onClick={onClose}>
        Done
      </Button>
    </div>
  ) : (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button
        variant="secondary"
        size="medium"
        onClick={onClose}
        disabled={submitting}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        size="medium"
        onClick={handleSubmit}
        disabled={submitting || selectedUserIds.length === 0 || !selectedRoleId}
        loading={submitting}
      >
        Assign to {selectedUserIds.length} User(s)
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Role Assignment"
      size="large"
      footer={footer}
    >
      {resultSummary ? (
        /* RESULT SUMMARY VIEW */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <CheckCircle2 size={18} />
              <span>Bulk Role Assignment Complete</span>
            </div>
            <p className="text-[var(--text-secondary)]">
              Successfully assigned <strong>{resultSummary.roleName}</strong> role to{' '}
              <span className="font-extrabold text-[var(--text-primary)]">{resultSummary.assignedCount}</span> of{' '}
              {resultSummary.totalRequested} requested users.
            </p>
            {resultSummary.skippedCount > 0 && (
              <p className="text-amber-400">
                {resultSummary.skippedCount} users were skipped (already held the role or error).
              </p>
            )}
          </div>
        </div>
      ) : (
        /* SELECTION FORM VIEW */
        <div className="space-y-5">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <Users size={18} className="shrink-0" />
            <p className="text-xs text-[var(--text-secondary)]">
              Onboard or update roles for multiple team members simultaneously
            </p>
          </div>

          {errorMsg && <ErrorMessage message={errorMsg} />}

          {/* Target Role Selector */}
          <div className="space-y-3">
            <CustomSelector
              label="1. Select Target Role to Assign"
              options={roleOptions}
              value={selectedRoleId}
              onChange={(val) => setSelectedRoleId(val)}
              placeholder="-- Choose Role --"
              searchPlaceholder="Search roles..."
              required
              isSearchable={true}
              isClearable={false}
            />

            {/* Primary Role Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-warning-500" />
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  Set as Primary Role for target users
                </span>
              </div>
              <Toggle
                checked={isPrimary}
                onChange={setIsPrimary}
                size="md"
                color="primary"
                aria-label="Set as Primary Role"
              />
            </div>
          </div>

          {/* User Selection List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                2. Select Users ({selectedUserIds.length} of {users.length} selected)
              </label>
              <Button
                variant="ghost"
                size="small"
                onClick={handleToggleSelectAll}
                className="text-primary-500 font-bold hover:underline"
              >
                {selectedUserIds.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <SearchInput
              placeholder="Filter users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />

            <div className="max-h-56 overflow-y-auto border border-[var(--border-color)] rounded-xl divide-y divide-[var(--border-color)] bg-[var(--bg-card)]">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--text-muted)]">
                  No users matching search filter.
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isChecked = selectedUserIds.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleToggleUser(u.id)}
                      className={`flex items-center justify-between p-3 text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-primary-500/10 font-semibold'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 border-[var(--border-color)] bg-[var(--bg-input)]"
                        />
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">
                            {u.displayName}
                          </div>
                          <div className="text-[var(--text-muted)] text-[11px]">
                            {u.email || 'No email registered'}
                          </div>
                        </div>
                      </div>

                      {/* Current roles summary */}
                      <Badge variant="neutral" size="small">
                        {u.activeRolesCount || 0} active role(s)
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BulkRoleAssignModal;
