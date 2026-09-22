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
    <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
              Effective Permissions (Union)
              <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full">
                {effectivePermissions.length} Grants
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Computed union of all active assigned roles for {userDisplayName}
            </p>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-60">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {effectivePermissions.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">
          No effective permissions granted. Assign an active role to grant permissions.
        </div>
      ) : Object.keys(groupedModules).length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-400">
          No permissions matching search filter.
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {Object.entries(groupedModules).map(([moduleName, perms]) => (
            <div key={moduleName} className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/80 pb-1">
                <Layers size={13} className="text-primary-500" />
                <span>{moduleName}</span>
                <span className="text-[10px] text-slate-400 font-normal">({perms.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {perms.map((p) => (
                  <div
                    key={p.id || p.permissionKey}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 transition-colors space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Key size={12} className="text-primary-500 shrink-0" />
                        <span>{p.label || p.permissionKey}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shrink-0">
                        {p.action}
                      </span>
                    </div>

                    {p.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {p.description}
                      </p>
                    )}

                    {/* Granted By Roles */}
                    {p.grantedByRoles && p.grantedByRoles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] text-slate-400 font-medium">Granted by:</span>
                        {p.grantedByRoles.map((g) => (
                          <span
                            key={g.roleId}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              g.isPrimary
                                ? 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
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
