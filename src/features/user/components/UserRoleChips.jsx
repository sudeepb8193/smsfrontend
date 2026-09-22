import React, { useState } from 'react';
import { Star, ShieldAlert, X, ChevronDown, Check } from 'lucide-react';

export const UserRoleChips = ({
  roles = [],
  onMakePrimary,
  onRemoveRole,
  onAddRoleClick,
  readOnly = false,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);

  if (!roles || roles.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1">
          <ShieldAlert size={13} /> No Active Roles
        </span>
        {!readOnly && onAddRoleClick && (
          <button
            type="button"
            onClick={onAddRoleClick}
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-bold"
          >
            + Add Role
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {roles.map((r) => {
        const roleId = r.roleId || r.id;
        const isPrimary = r.isPrimary;
        const isInactive = r.isRoleInactive;
        const isDropdownOpen = openDropdownId === roleId;

        return (
          <div key={roleId} className="relative inline-flex items-center">
            {/* Primary Role Chip */}
            {isPrimary ? (
              <div className="group relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/20 border border-primary-500/40 transition-all">
                <Star size={13} className="fill-yellow-300 text-yellow-300 shrink-0 animate-pulse" />
                <span>{r.name}</span>
                <span className="text-[10px] uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded text-white font-extrabold ml-0.5">
                  Primary
                </span>

                {isInactive && (
                  <span
                    title="Role deactivated in Module 03"
                    className="flex items-center gap-0.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold"
                  >
                    <ShieldAlert size={11} /> Inactive
                  </span>
                )}

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onRemoveRole && onRemoveRole(r)}
                    className="ml-1 p-0.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    title="Remove Role"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ) : (
              /* Secondary Role Chip */
              <div
                className={`group relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isInactive
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500'
                }`}
              >
                <span>{r.name}</span>

                {isInactive && (
                  <span
                    title="Role deactivated in Module 03 - review required"
                    className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold text-[10px] bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-full"
                  >
                    <ShieldAlert size={11} /> Inactive
                  </span>
                )}

                {!readOnly && (
                  <div className="flex items-center gap-1 ml-1">
                    {/* Make Primary Dropdown / Quick Action */}
                    <button
                      type="button"
                      onClick={() => setOpenDropdownId(isDropdownOpen ? null : roleId)}
                      className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      title="Role options"
                    >
                      <ChevronDown size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveRole && onRemoveRole(r)}
                      className="p-0.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Remove Role"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}

                {/* Popover menu for Make Primary */}
                {isDropdownOpen && !readOnly && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setOpenDropdownId(null)}
                    />
                    <div className="absolute top-full left-0 mt-1 z-30 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-1 text-xs select-none">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdownId(null);
                          onMakePrimary && onMakePrimary(r);
                        }}
                        className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded text-left font-semibold text-slate-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <Star size={13} className="text-yellow-500" />
                        <span>Make Primary</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* + Add Role Pill */}
      {!readOnly && onAddRoleClick && (
        <button
          type="button"
          onClick={onAddRoleClick}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-dashed border-primary-400 dark:border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-all"
        >
          + Add Role
        </button>
      )}
    </div>
  );
};

export default UserRoleChips;
