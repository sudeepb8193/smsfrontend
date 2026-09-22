import React, { useState } from 'react';
import { X, Users, ShieldCheck, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { userService } from '../../../services/userService';

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
      u.displayName.toLowerCase().includes(q) ||
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
    e.preventDefault();
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

      setResultSummary(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete bulk role assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Bulk Role Assignment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Onboard or update roles for multiple users at once
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

        {/* Modal Body */}
        {resultSummary ? (
          /* RESULT SUMMARY VIEW */
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={18} />
                <span>Bulk Role Assignment Complete</span>
              </div>
              <p>
                Successfully assigned <strong>{resultSummary.roleName}</strong> role to{' '}
                <span className="font-extrabold">{resultSummary.assignedCount}</span> of{' '}
                {resultSummary.totalRequested} requested users.
              </p>
              {resultSummary.skippedCount > 0 && (
                <p className="text-amber-700 dark:text-amber-300">
                  {resultSummary.skippedCount} users were skipped (already held the role or error).
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* SELECTION FORM VIEW */
          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Target Role Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                1. Select Target Role to Assign
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
              >
                <option value="">-- Choose Role --</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id} disabled={role.status !== 'active'}>
                    {role.name} {role.status !== 'active' ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>

              {/* Primary Role Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bulkPrimaryCheck"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600"
                />
                <label htmlFor="bulkPrimaryCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer">
                  <Star size={13} className="text-yellow-500" />
                  <span>Set as Primary Role for target users</span>
                </label>
              </div>
            </div>

            {/* User Selection List */}
            <div className="flex-1 flex flex-col min-h-0 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  2. Select Users ({selectedUserIds.length} of {users.length} selected)
                </label>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline"
                >
                  {selectedUserIds.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <input
                type="text"
                placeholder="Filter users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
              />

              <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
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
                            ? 'bg-primary-50/40 dark:bg-primary-950/30 font-semibold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600"
                          />
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100">
                              {u.displayName}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                              {u.email || 'No email registered'}
                            </div>
                          </div>
                        </div>

                        {/* Current roles summary */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {u.activeRolesCount || 0} active role(s)
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || selectedUserIds.length === 0 || !selectedRoleId}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md shadow-primary-600/25 disabled:opacity-50 transition-all"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                <span>Assign to {selectedUserIds.length} User(s)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BulkRoleAssignModal;
