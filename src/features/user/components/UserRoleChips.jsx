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
        <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
          <ShieldAlert size={13} /> No Active Roles
        </span>
        {!readOnly && onAddRoleClick && (
          <button
            type="button"
            onClick={onAddRoleClick}
            className="text-xs text-primary-500 hover:underline font-bold cursor-pointer"
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
              <div className="group relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-500 text-white shadow-md shadow-primary-500/20 border border-primary-400/40 transition-all">
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
                    className="ml-1 p-0.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
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
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-primary-500'
                }`}
              >
                <span>{r.name}</span>

                {isInactive && (
                  <span
                    title="Role deactivated in Module 03 - review required"
                    className="flex items-center gap-0.5 text-amber-400 font-bold text-[10px] bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full"
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
                      className="p-0.5 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      title="Role options"
                    >
                      <ChevronDown size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveRole && onRemoveRole(r)}
                      className="p-0.5 rounded-full hover:bg-rose-500/20 text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
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
                    <div className="absolute top-full left-0 mt-1 z-30 w-36 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl p-1 text-xs select-none">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdownId(null);
                          onMakePrimary && onMakePrimary(r);
                        }}
                        className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded text-left font-semibold text-[var(--text-secondary)] hover:bg-primary-500/10 hover:text-primary-500 cursor-pointer"
                      >
                        <Star size={13} className="text-warning-500" />
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
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-dashed border-primary-500 text-primary-500 hover:bg-primary-500/10 transition-all cursor-pointer"
        >
          + Add Role
        </button>
      )}
    </div>
  );
};

export default UserRoleChips;
