import React, { useState } from 'react';
import { ShieldCheck, Search, Key, Sparkles, Layers } from 'lucide-react';

export const EffectivePermissionsDrawer = ({
  effectivePermissions = [],
  userDisplayName = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPermissions = effectivePermissions.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.label && p.label.toLowerCase().includes(q)) ||
      (p.permissionKey && p.permissionKey.toLowerCase().includes(q)) ||
      (p.moduleLabel && p.moduleLabel.toLowerCase().includes(q))
    );
  });

  // Group permissions by module
  const groupedModules = filteredPermissions.reduce((acc, perm) => {
    const modKey = perm.moduleLabel || perm.moduleCode || 'General';
    if (!acc[modKey]) acc[modKey] = [];
    acc[modKey].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
              Effective Permissions (Union)
              <span className="text-xs bg-emerald-500/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20">
                {effectivePermissions.length} Grants
              </span>
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Computed union of all active assigned roles for {userDisplayName}
            </p>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-60">
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:border-primary-500 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {effectivePermissions.length === 0 ? (
        <div className="p-6 text-center text-xs text-[var(--text-muted)]">
          No effective permissions granted. Assign an active role to grant permissions.
        </div>
      ) : Object.keys(groupedModules).length === 0 ? (
        <div className="p-4 text-center text-xs text-[var(--text-muted)]">
          No permissions matching search filter.
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {Object.entries(groupedModules).map(([moduleName, perms]) => (
            <div key={moduleName} className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-1">
                <Layers size={13} className="text-primary-500" />
                <span>{moduleName}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-normal">({perms.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {perms.map((p) => (
                  <div
                    key={p.id || p.permissionKey}
                    className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:border-[var(--border-hover)] transition-colors space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                        <Key size={12} className="text-primary-500 shrink-0" />
                        <span>{p.label || p.permissionKey}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono font-extrabold px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] shrink-0">
                        {p.action}
                      </span>
                    </div>

                    {p.description && (
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                        {p.description}
                      </p>
                    )}

                    {/* Granted By Roles */}
                    {p.grantedByRoles && p.grantedByRoles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">Granted by:</span>
                        {p.grantedByRoles.map((g) => (
                          <span
                            key={g.roleId}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              g.isPrimary
                                ? 'bg-primary-500/15 text-primary-500 border border-primary-500/20'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                            }`}
                          >
                            {g.roleName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EffectivePermissionsDrawer;
