import React, { useState } from 'react';
import { X, ShieldPlus, Star, Loader2, CheckCircle2 } from 'lucide-react';

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
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
              <ShieldPlus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Add Role Assignment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assigning access role to <span className="font-bold text-slate-700 dark:text-slate-200">{userDisplayName}</span>
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Select Role
            </label>
            {selectableRoles.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
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
                          ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          : isSelected
                          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 text-primary-900 dark:text-primary-100 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-primary-600 bg-primary-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <CheckCircle2 size={12} className="fill-current" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            {role.name}
                            {isInactive && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
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
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <input
                type="checkbox"
                id="isPrimaryCheckbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600"
              />
              <label htmlFor="isPrimaryCheckbox" className="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                <Star size={14} className="text-yellow-500" />
                <span>Mark as Primary Role (drives default dashboard view)</span>
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRoleId || selectableRoles.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md shadow-primary-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
