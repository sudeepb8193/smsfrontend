
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Tooltip from '../../../components/shared/Tooltip';
import Spinner from '../../../components/shared/Spinner';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import Toggle from '../../../components/shared/Toggle';
import {
  Shield,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Lock,
  Building,
  Info,
  Check,
  X,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STANDARD_ACTIONS = [
  { key: 'view', label: 'View', color: 'primary' },
  { key: 'create', label: 'Create', color: 'success' },
  { key: 'edit', label: 'Edit', color: 'warning' },
  { key: 'delete', label: 'Delete', color: 'danger' },
  { key: 'approve', label: 'Approve', color: 'brand' },
  { key: 'export', label: 'Export', color: 'secondary' },
  { key: 'print', label: 'Print', color: 'neutral' },
];

export const RolePermissionMatrix = ({
  role,
  matrixTemplate = [],
  initialAssignments = [],
  branches = [],
  versionToken = '',
  onSave,
  loading = false,
  saving = false,
  concurrencyConflict = null,
  onResolveConflict,
}) => {
  // State: Map of permissionKey -> { scope: string, restrictedBranchIds: string[] }
  const [selectedPermissions, setSelectedPermissions] = useState({});
  // Module-level scope state: moduleCode -> { scope: string, restrictedBranchIds: string[] }
  const [moduleScopes, setModuleScopes] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const [expandedBranchesModule, setExpandedBranchesModule] = useState(null);

  // Initialize from props
  useEffect(() => {
    const permMap = {};
    const modScopeMap = {};

    initialAssignments.forEach((assign) => {
      permMap[assign.permissionKey] = {
        scope: assign.scope || 'own_branch',
        restrictedBranchIds: assign.restrictedBranches?.map((b) => b.branchId) || [],
      };

      if (!modScopeMap[assign.moduleCode]) {
        modScopeMap[assign.moduleCode] = {
          scope: assign.scope || 'own_branch',
          restrictedBranchIds: assign.restrictedBranches?.map((b) => b.branchId) || [],
        };
      }
    });

    setSelectedPermissions(permMap);
    setModuleScopes(modScopeMap);
    setHasUnsavedChanges(false);
  }, [initialAssignments]);

  // Calculate statistics
  const totalAvailableCount = useMemo(() => {
    return matrixTemplate.reduce((acc, mod) => acc + (mod.permissions?.length || 0), 0);
  }, [matrixTemplate]);

  const selectedCount = Object.keys(selectedPermissions).length;

  // Toggle single permission with dependency resolution
  const handleTogglePermission = (moduleCode, action, permission) => {
    const key = permission.permissionKey;
    const isCurrentlyChecked = Boolean(selectedPermissions[key]);
    const next = { ...selectedPermissions };

    const currentModScope = moduleScopes[moduleCode] || {
      scope: 'own_branch',
      restrictedBranchIds: [],
    };

    if (isCurrentlyChecked) {
      // Removing permission
      delete next[key];

      // If removing View, remove all dependent non-view actions in this module
      if (action === 'view') {
        const moduleDef = matrixTemplate.find((m) => m.moduleCode === moduleCode);
        if (moduleDef) {
          moduleDef.permissions.forEach((p) => {
            if (p.action !== 'view') {
              delete next[p.permissionKey];
            }
          });
        }
      }
    } else {
      // Adding permission
      next[key] = {
        scope: currentModScope.scope,
        restrictedBranchIds: [...currentModScope.restrictedBranchIds],
      };

      // Dependency Rule: Any non-view action automatically implies and grants View
      if (action !== 'view') {
        const viewKey = `${moduleCode}.view`;
        const viewDef = matrixTemplate
          .find((m) => m.moduleCode === moduleCode)
          ?.permissions?.find((p) => p.action === 'view');

        if (viewDef && !next[viewKey]) {
          next[viewKey] = {
            scope: currentModScope.scope,
            restrictedBranchIds: [...currentModScope.restrictedBranchIds],
          };
        }
      }
    }

    setSelectedPermissions(next);
    setHasUnsavedChanges(true);
  };

  // Grant All for a module
  const handleGrantModuleAll = (moduleCode) => {
    const moduleDef = matrixTemplate.find((m) => m.moduleCode === moduleCode);
    if (!moduleDef) return;

    const next = { ...selectedPermissions };
    const currentModScope = moduleScopes[moduleCode] || {
      scope: 'own_branch',
      restrictedBranchIds: [],
    };

    moduleDef.permissions.forEach((p) => {
      next[p.permissionKey] = {
        scope: currentModScope.scope,
        restrictedBranchIds: [...currentModScope.restrictedBranchIds],
      };
    });

    setSelectedPermissions(next);
    setHasUnsavedChanges(true);
  };

  // Revoke All for a module
  const handleRevokeModuleAll = (moduleCode) => {
    const moduleDef = matrixTemplate.find((m) => m.moduleCode === moduleCode);
    if (!moduleDef) return;

    const next = { ...selectedPermissions };
    moduleDef.permissions.forEach((p) => {
      delete next[p.permissionKey];
    });

    setSelectedPermissions(next);
    setHasUnsavedChanges(true);
  };

  // Grant All globally
  const handleGrantAllGlobal = () => {
    const next = {};
    matrixTemplate.forEach((mod) => {
      const scope = moduleScopes[mod.moduleCode]?.scope || 'own_branch';
      const branchIds = moduleScopes[mod.moduleCode]?.restrictedBranchIds || [];
      mod.permissions.forEach((p) => {
        next[p.permissionKey] = {
          scope,
          restrictedBranchIds: [...branchIds],
        };
      });
    });
    setSelectedPermissions(next);
    setHasUnsavedChanges(true);
  };

  // Revoke All globally
  const handleRevokeAllGlobal = () => {
    setSelectedPermissions({});
    setHasUnsavedChanges(true);
  };

  // Update Branch Scope for a module
  const handleScopeChange = (moduleCode, newScope) => {
    const nextScopes = {
      ...moduleScopes,
      [moduleCode]: {
        scope: newScope,
        restrictedBranchIds: moduleScopes[moduleCode]?.restrictedBranchIds || [],
      },
    };
    setModuleScopes(nextScopes);

    // Synchronize selected permissions for this module
    const nextPerms = { ...selectedPermissions };
    const moduleDef = matrixTemplate.find((m) => m.moduleCode === moduleCode);
    if (moduleDef) {
      moduleDef.permissions.forEach((p) => {
        if (nextPerms[p.permissionKey]) {
          nextPerms[p.permissionKey] = {
            ...nextPerms[p.permissionKey],
            scope: newScope,
          };
        }
      });
    }

    setSelectedPermissions(nextPerms);
    setHasUnsavedChanges(true);
    if (newScope === 'restricted_branches') {
      setExpandedBranchesModule(moduleCode);
    }
  };

  // Toggle restricted branch chip
  const handleToggleRestrictedBranch = (moduleCode, branchId) => {
    const current = moduleScopes[moduleCode] || {
      scope: 'restricted_branches',
      restrictedBranchIds: [],
    };
    const branchIds = current.restrictedBranchIds.includes(branchId)
      ? current.restrictedBranchIds.filter((id) => id !== branchId)
      : [...current.restrictedBranchIds, branchId];

    const nextScopes = {
      ...moduleScopes,
      [moduleCode]: {
        ...current,
        scope: 'restricted_branches',
        restrictedBranchIds: branchIds,
      },
    };
    setModuleScopes(nextScopes);

    // Propagate to permissions in this module
    const nextPerms = { ...selectedPermissions };
    const moduleDef = matrixTemplate.find((m) => m.moduleCode === moduleCode);
    if (moduleDef) {
      moduleDef.permissions.forEach((p) => {
        if (nextPerms[p.permissionKey]) {
          nextPerms[p.permissionKey] = {
            ...nextPerms[p.permissionKey],
            scope: 'restricted_branches',
            restrictedBranchIds: branchIds,
          };
        }
      });
    }

    setSelectedPermissions(nextPerms);
    setHasUnsavedChanges(true);
  };

  // Discard changes
  const handleDiscard = () => {
    const permMap = {};
    const modScopeMap = {};

    initialAssignments.forEach((assign) => {
      permMap[assign.permissionKey] = {
        scope: assign.scope || 'own_branch',
        restrictedBranchIds: assign.restrictedBranches?.map((b) => b.branchId) || [],
      };

      if (!modScopeMap[assign.moduleCode]) {
        modScopeMap[assign.moduleCode] = {
          scope: assign.scope || 'own_branch',
          restrictedBranchIds: assign.restrictedBranches?.map((b) => b.branchId) || [],
        };
      }
    });

    setSelectedPermissions(permMap);
    setModuleScopes(modScopeMap);
    setHasUnsavedChanges(false);
    setConfirmDiscardOpen(false);
  };

  // Save handler
  const handleSaveCommit = () => {
    // Validate that any restricted_branches has at least 1 branch selected
    for (const mod of matrixTemplate) {
      const scopeData = moduleScopes[mod.moduleCode];
      if (scopeData?.scope === 'restricted_branches') {
        const hasSelectedPerms = mod.permissions?.some((p) => selectedPermissions[p.permissionKey]);
        if (hasSelectedPerms && (!scopeData.restrictedBranchIds || scopeData.restrictedBranchIds.length === 0)) {
          alert(`Module "${mod.moduleLabel}" has scope "Restricted Branches", but no branches are selected. Please select at least one branch.`);
          setExpandedBranchesModule(mod.moduleCode);
          return;
        }
      }
    }

    // Assemble payload
    const permissionsPayload = Object.entries(selectedPermissions).map(([key, data]) => ({
      permissionKey: key,
      scope: data.scope || 'own_branch',
      restrictedBranchIds: data.scope === 'restricted_branches' ? data.restrictedBranchIds : undefined,
    }));

    if (onSave) {
      onSave({
        permissions: permissionsPayload,
        expectedUpdatedAt: versionToken,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[var(--text-muted)]">
        <Spinner size="large" />
        <span className="mt-3 text-sm font-semibold">Loading Permission Matrix...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Concurrency Conflict Banner */}
      {concurrencyConflict && (
        <div className="bg-warning-500/10 border border-warning-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-warning-800 dark:text-warning-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-warning-500 shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">Concurrency Conflict Detected</h4>
              <p className="text-xs text-warning-700 dark:text-warning-300 mt-0.5">
                {concurrencyConflict.message || 'Another administrator updated this role recently.'}
              </p>
            </div>
          </div>
          <Button
            variant="warning"
            size="small"
            icon={RotateCcw}
            onClick={onResolveConflict}
          >
            Review & Refresh Matrix
          </Button>
        </div>
      )}

      {/* Top Header & Actions Card */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-6 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{role?.name}</h3>
                <Badge variant={role?.roleType === 'system' ? 'brand' : 'primary'} size="small">
                  {role?.roleType === 'system' ? 'System Role' : 'Custom Role'}
                </Badge>
                <Badge variant={role?.status === 'active' ? 'success' : 'danger'} size="small">
                  {role?.status}
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl">
                {role?.description || 'Configure role access permissions and multi-branch data restrictions.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={handleGrantAllGlobal}
            >
              Grant All Permissions
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={handleRevokeAllGlobal}
            >
              Revoke All
            </Button>
            <Button
              variant="primary"
              size="small"
              icon={Save}
              loading={saving}
              disabled={!hasUnsavedChanges}
              onClick={handleSaveCommit}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[var(--border-color)] text-xs">
          <div>
            <span className="text-[var(--text-muted)] block text-[11px]">Total Granted:</span>
            <span className="font-extrabold text-[var(--text-primary)] text-base">
              {selectedCount} <span className="text-xs text-[var(--text-muted)] font-normal">/ {totalAvailableCount}</span>
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block text-[11px]">Modules Configured:</span>
            <span className="font-extrabold text-[var(--text-primary)] text-base">{matrixTemplate.length}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block text-[11px]">Assigned Users:</span>
            <span className="font-extrabold text-[var(--text-primary)] text-base">{role?.activeUsersCount || 0} active</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block text-[11px]">Change Status:</span>
            {hasUnsavedChanges ? (
              <span className="text-warning-500 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-warning-500 animate-pulse" />
                Unsaved Changes Pending
              </span>
            ) : (
              <span className="text-success-500 font-semibold flex items-center gap-1">
                <CheckCircle size={14} /> Synchronized
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Zero Permissions Warning */}
      {selectedCount === 0 && (
        <div className="bg-danger-500/10 border border-danger-500/20 rounded-2xl p-4 flex items-center gap-3 text-danger-300">
          <AlertTriangle className="text-danger-500 shrink-0" size={20} />
          <p className="text-xs">
            <strong className="font-bold">Warning:</strong> This role currently has zero permissions assigned. Any user holding only this role will be completely locked out of protected system features.
          </p>
        </div>
      )}

      {/* Floating Sticky Unsaved Changes Bar */}
      {hasUnsavedChanges && (
        <div className="sticky top-20 z-30 bg-[var(--bg-card)]/95 backdrop-blur-md border border-primary-500/40 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 pl-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-ping" />
            <span className="font-bold text-[var(--text-primary)]">You have unsaved changes to this permission matrix.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setConfirmDiscardOpen(true)}
            >
              Discard
            </Button>
            <Button
              variant="primary"
              size="small"
              icon={Save}
              loading={saving}
              onClick={handleSaveCommit}
            >
              Commit & Save
            </Button>
          </div>
        </div>
      )}

      {/* Main Permission Matrix Table Card */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[var(--bg-input)] border-b border-[var(--border-color)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="py-3.5 px-4 sticky left-0 z-20 bg-[var(--bg-input)] border-r border-[var(--border-color)] min-w-[240px]">
                  Module & Branch Scope
                </th>
                {STANDARD_ACTIONS.map((action) => (
                  <th key={action.key} className="py-3.5 px-3 text-center min-w-[90px]">
                    {action.label}
                  </th>
                ))}
                <th className="py-3.5 px-4 text-right min-w-[140px]">
                  Module Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-sm">
              {matrixTemplate.map((module) => {
                const currentScope = moduleScopes[module.moduleCode]?.scope || 'own_branch';
                const restrictedBranchIds = moduleScopes[module.moduleCode]?.restrictedBranchIds || [];
                const viewPerm = module.permissions.find((p) => p.action === 'view');
                const isViewChecked = viewPerm ? Boolean(selectedPermissions[viewPerm.permissionKey]) : false;

                // Check if any non-view is selected
                const hasNonViewChecked = module.permissions.some(
                  (p) => p.action !== 'view' && selectedPermissions[p.permissionKey]
                );

                return (
                  <React.Fragment key={module.moduleCode}>
                    <tr className="hover:bg-white/5 transition-colors group">
                      {/* Sticky Module Column with Scope Selector */}
                      <td className="py-4 px-4 sticky left-0 z-10 bg-[var(--bg-card)] group-hover:bg-white/5 border-r border-[var(--border-color)]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--text-primary)] text-sm">
                              {module.moduleLabel}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                              ({module.moduleCode})
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Standard Action Toggle Cells */}
                      {STANDARD_ACTIONS.map((actionCol) => {
                        const perm = module.permissions.find((p) => p.action === actionCol.key);
                        if (!perm) {
                          return (
                            <td key={actionCol.key} className="py-4 px-3 text-center text-[var(--text-muted)] opacity-40 select-none">
                              —
                            </td>
                          );
                        }

                        const isChecked = Boolean(selectedPermissions[perm.permissionKey]);
                        // Implied View: if View is required by a child action, show implied indicator
                        const isImpliedView = actionCol.key === 'view' && hasNonViewChecked && isViewChecked;

                        return (
                          <td key={actionCol.key} className="py-4 px-3 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Tooltip content={`${perm.label}: ${perm.description || perm.permissionKey}${isImpliedView ? ' (Automatically granted because other module actions require View)' : ''}`}>
                                <div>
                                  <Toggle
                                    checked={isChecked}
                                    onChange={() => handleTogglePermission(module.moduleCode, actionCol.key, perm)}
                                    size="sm"
                                    color="primary"
                                    isImplied={isImpliedView}
                                    aria-label={`Toggle ${perm.label} for ${module.moduleLabel}`}
                                  />
                                </div>
                              </Tooltip>
                              {isImpliedView && (
                                <span className="text-[9px] text-primary-500 font-bold uppercase tracking-tighter mt-1 leading-none">
                                  Implied
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Module Level Action Quick Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleGrantModuleAll(module.moduleCode)}
                            className="text-[11px] font-bold text-primary-500 hover:text-primary-400 px-2 py-1 rounded-md hover:bg-white/10 transition-all cursor-pointer"
                          >
                            All
                          </button>
                          <span className="text-[var(--text-muted)]">•</span>
                          <button
                            type="button"
                            onClick={() => handleRevokeModuleAll(module.moduleCode)}
                            className="text-[11px] font-bold text-danger-500 hover:text-danger-400 px-2 py-1 rounded-md hover:bg-white/10 transition-all cursor-pointer"
                          >
                            None
                          </button>
                        </div>
                      </td>
                    </tr>


                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discard Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDiscardOpen}
        onClose={() => setConfirmDiscardOpen(false)}
        onConfirm={handleDiscard}
        title="Discard Unsaved Changes?"
        message="Are you sure you want to discard your unsaved permission changes? All modifications will be reverted to the last saved database state."
        confirmText="Discard Changes"
        confirmVariant="danger"
      />
    </div>
  );
};

export default RolePermissionMatrix;
