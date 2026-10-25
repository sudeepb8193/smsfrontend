import React, { useState } from 'react';
import { Key, Sparkles, Layers } from 'lucide-react';
import Card from '../../../components/shared/Card';
import Badge from '../../../components/shared/Badge';
import SearchInput from '../../../components/shared/SearchInput';
import EmptyState from '../../../components/shared/EmptyState';

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

  const headerTitle = (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
        <Sparkles size={16} />
      </div>
      <div>
        <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
          Effective Permissions (Union)
          <Badge variant="success" size="small">
            {effectivePermissions.length} Grants
          </Badge>
        </h3>
        <p className="text-[11px] text-[var(--text-muted)]">
          Computed union of all active assigned roles for {userDisplayName}
        </p>
      </div>
    </div>
  );

  const searchAction = (
    <div className="w-full sm:w-60">
      <SearchInput
        placeholder="Search permissions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClear={() => setSearchQuery('')}
      />
    </div>
  );

  return (
    <Card className="shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
        {headerTitle}
        {searchAction}
      </div>

      {effectivePermissions.length === 0 ? (
        <EmptyState
          title="No Effective Permissions"
          description="No effective permissions granted. Assign an active role to grant permissions."
          className="py-8"
        />
      ) : Object.keys(groupedModules).length === 0 ? (
        <EmptyState
          title="No Matches Found"
          description="No permissions matching your current search filter."
          className="py-8"
        />
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
                      <Badge variant="neutral" size="small" className="font-mono uppercase font-extrabold shrink-0">
                        {p.action}
                      </Badge>
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
                          <Badge
                            key={g.roleId}
                            variant={g.isPrimary ? 'primary' : 'neutral'}
                            size="small"
                          >
                            {g.roleName}
                          </Badge>
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
    </Card>
  );
};

export default EffectivePermissionsDrawer;
