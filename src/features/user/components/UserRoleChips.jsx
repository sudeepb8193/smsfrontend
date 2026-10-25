import React, { useState } from 'react';
import { Star, ShieldAlert, X, ChevronDown } from 'lucide-react';
import Badge from '../../../components/shared/Badge';
import Button from '../../../components/shared/Button';

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
        <Badge variant="warning">
          <ShieldAlert size={13} /> No Active Roles
        </Badge>
        {!readOnly && onAddRoleClick && (
          <Button
            variant="ghost"
            size="small"
            onClick={onAddRoleClick}
            className="text-primary-500 font-bold hover:underline h-7 px-2"
          >
            + Add Role
          </Button>
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
                  <Badge variant="warning" size="small" className="ml-1 text-white bg-amber-500 border-none">
                    <ShieldAlert size={11} /> Inactive
                  </Badge>
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
                  <Badge variant="warning" size="small">
                    <ShieldAlert size={11} /> Inactive
                  </Badge>
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
        <Button
          variant="outline"
          size="small"
          onClick={onAddRoleClick}
          className="rounded-full border-dashed h-7 px-3 text-xs"
        >
          + Add Role
        </Button>
      )}
    </div>
  );
};

export default UserRoleChips;
