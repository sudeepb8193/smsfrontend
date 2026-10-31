import React from 'react';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Toggle from '../../../components/shared/Toggle';
import Tooltip from '../../../components/shared/Tooltip';
import Spinner from '../../../components/shared/Spinner';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import CreateRoleModal from '../components/CreateRoleModal';
import CreateModuleModal from '../components/CreateModuleModal';
import EditModuleModal from '../components/EditModuleModal';
import {
  Shield,
  Plus,
  Trash2,
  Users,
  Search,
  Save,
  RotateCcw,
  Building,
  CheckCircle,
  AlertTriangle,
  Layers,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Sliders,
  Filter,
  Pencil,
} from 'lucide-react';
import { useRoleList } from '../hooks/useRolePermission';

const STANDARD_ACTIONS = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'approve', label: 'Approve' },
  { key: 'export', label: 'Export' },
  { key: 'print', label: 'Print' },
];

export const RoleListPage = ({ isSuperAdminView = false, selectedOrgId = null }) => {
  const {
    roles,
    selectedRoleId,
    selectedRole,
    loadingRoles,
    roleSearch,
    setRoleSearch,
    filteredRoles,
    matrixTemplate,
    branches,
    selectedPermissions,
    moduleScopes,
    loadingPermissions,
    savingPermissions,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    moduleSearch,
    setModuleSearch,
    moduleFilter,
    setModuleFilter,
    filterDropdownOpen,
    setFilterDropdownOpen,
    filterDropdownRef,
    expandedRestrictedModule,
    setExpandedRestrictedModule,
    filterLabel,
    grantedModulesCount,
    filteredModules,
    totalAvailableCount,
    selectedCount,
    createRoleModalOpen,
    setCreateRoleModalOpen,
    createModuleModalOpen,
    setCreateModuleModalOpen,
    editingModule,
    setEditingModule,
    deleteConfirmModule,
    setDeleteConfirmModule,
    deletingModule,
    deleteConfirmRole,
    setDeleteConfirmRole,
    deletingRole,
    confirmDiscardOpen,
    setConfirmDiscardOpen,
    handleSelectRole,
    handleConfirmRoleSwitch,
    handleTogglePermission,
    handleGrantModuleAll,
    handleRevokeModuleAll,
    handleGrantAllGlobal,
    handleRevokeAllGlobal,
    handleScopeChange,
    handleToggleRestrictedBranch,
    handleSavePermissions,
    handleCreateRoleSubmit,
    handleCreateModuleSubmit,
    handleUpdateModuleSubmit,
    handleDeleteModuleSubmit,
    handleDeleteRoleSubmit,
    loadRolePermissions,
  } = useRoleList({ isSuperAdminView, selectedOrgId });

  return (
    <div>
      {/* Two-Section Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT SECTION: ALL ROLES (Master Panel)                     */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 xl:col-span-3 2xl:col-span-3 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col transition-colors lg:sticky lg:top-20 h-[calc(100vh-6rem)] min-h-[500px]">
          {/* Roles Search & Header */}
          <div className="p-3.5 border-b border-[var(--border-color)] space-y-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Roles ({filteredRoles.length})
              </span>
              <Button
                variant="primary"
                size="small"
                icon={Plus}
                onClick={() => setCreateRoleModalOpen(true)}
                className="text-xs py-1 px-2.5"
              >
                Create Role
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="Search roles..."
                className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Roles Scrollable List */}
          <div className="flex-1 p-2 space-y-1.5 overflow-y-auto divide-y divide-[var(--border-color)]">
            {loadingRoles ? (
              <div className="flex flex-col items-center justify-center p-8 text-[var(--text-muted)] text-xs">
                <Spinner size="small" />
                <span className="mt-2 font-medium">Loading roles...</span>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="p-6 text-center text-[var(--text-muted)] text-xs italic">
                No matching roles found.
              </div>
            ) : (
              filteredRoles.map((role) => {
                const isSelected = role.id === selectedRoleId;
                const isSystem = role.roleType === 'system' || role.isSystem;

                return (
                  <div
                    key={role.id}
                    onClick={() => handleSelectRole(role.id)}
                    className={`pt-1.5 first:pt-0 group cursor-pointer transition-all`}
                  >
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${isSelected
                          ? 'bg-primary-500/15 border-primary-500 shadow-xs ring-1 ring-primary-500/30'
                          : 'bg-[var(--bg-input)] border-[var(--border-color)] hover:border-[var(--border-hover)] hover:bg-white/5'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected
                              ? 'bg-primary-500 text-white shadow-xs'
                              : 'bg-[var(--bg-card)] text-[var(--text-muted)] group-hover:text-primary-500'
                            }`}
                        >
                          <Shield size={18} />
                        </div>

                        <div className="min-w-0">
                          <span className="font-bold text-xs text-[var(--text-primary)] truncate block">
                            {role.name}
                          </span>

                          <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Users size={11} className="opacity-70" />
                              {role.activeUsersCount || 0} users
                            </span>
                            <span>•</span>
                            <span>{role.permissionsCount || 0} perms</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!isSystem && (
                          <Tooltip content="Delete Custom Role">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmRole(role);
                              }}
                              className="p-1 rounded-md text-[var(--text-muted)] hover:text-danger-400 hover:bg-danger-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </Tooltip>
                        )}
                        <ChevronRight
                          size={15}
                          className={`transition-transform ${isSelected
                              ? 'text-primary-500 translate-x-0.5'
                              : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                            }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SECTION: MODULES & ACTION PERMISSIONS (Detail Panel) */}
        {/* ========================================================= */}
        <div className="lg:col-span-9 xl:col-span-9 2xl:col-span-9 space-y-4">
          {/* Header on Right Side */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary-500" />
                Roles & Access Permissions
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Select a role from the left to configure module action permissions and branch scopes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="small"
                icon={Plus}
                onClick={() => setCreateModuleModalOpen(true)}
              >
                Add Module
              </Button>
            </div>
          </div>
          {!selectedRole ? (
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-12 text-center text-[var(--text-muted)]">
              <Shield className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2" />
              <p className="text-sm font-semibold">Select a role from the left to configure permissions</p>
            </div>
          ) : (
            <>
              {/* Selected Role Header & Global Action Bar */}
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-4 sm:p-5 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Role Identity & Details */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <Shield size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-[var(--text-primary)]">
                          {selectedRole.name}
                        </h3>
                        <Badge variant={selectedRole.status === 'active' ? 'success' : 'danger'} size="small">
                          {selectedRole.status}
                        </Badge>
                        <span className="text-[11px] font-bold text-[var(--text-secondary)] bg-[var(--bg-input)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                          {selectedCount} / {totalAvailableCount} granted
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl">
                        {selectedRole.description || 'Configure accessible business modules and operations.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Toolbar (Neatly aligned in a single horizontal group) */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center flex-wrap sm:flex-nowrap">
                    {/* Bulk Selection Segmented Group */}
                    <div className="inline-flex items-center rounded-xl bg-[var(--bg-input)] p-0.5 border border-[var(--border-color)] shadow-xs">
                      <button
                        type="button"
                        onClick={handleGrantAllGlobal}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all cursor-pointer"
                      >
                        Grant All
                      </button>
                      <div className="w-px h-3.5 bg-[var(--border-color)] mx-0.5" />
                      <button
                        type="button"
                        onClick={handleRevokeAllGlobal}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all cursor-pointer"
                      >
                        Revoke All
                      </button>
                    </div>

                    {/* Discard Changes Button */}
                    {hasUnsavedChanges && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => loadRolePermissions(selectedRoleId)}
                        className="text-xs font-semibold"
                      >
                        Discard
                      </Button>
                    )}

                    {/* Primary Save Changes Button */}
                    <Button
                      variant="primary"
                      size="small"
                      icon={Save}
                      loading={savingPermissions}
                      disabled={!hasUnsavedChanges}
                      onClick={handleSavePermissions}
                      className="text-xs font-semibold shadow-xs"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>

                {/* Unsaved Changes Banner */}
                {hasUnsavedChanges && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center gap-2 text-xs font-semibold text-warning-400">
                    <span className="w-2 h-2 rounded-full bg-warning-500 animate-pulse" />
                    <span>Unsaved permission adjustments pending. Remember to click "Save Changes".</span>
                  </div>
                )}
              </div>

              {/* Modules Filter & Search Toolbar */}
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-colors">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    placeholder="Filter modules (e.g. appointments, customers, billing, inventory)..."
                    className="w-full pl-9 pr-8 py-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary-500 transition-all"
                  />
                  {moduleSearch && (
                    <button
                      type="button"
                      onClick={() => setModuleSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded-full cursor-pointer"
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Interactive Module Filter Dropdown */}
                <div className="relative shrink-0" ref={filterDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                    className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${moduleFilter !== 'all'
                        ? 'bg-primary-500/10 border-primary-500/30 text-primary-500 shadow-xs'
                        : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Filter size={13} className={moduleFilter !== 'all' ? 'text-primary-500' : 'text-[var(--text-muted)]'} />
                      <span className="truncate max-w-[150px]">{filterLabel}</span>
                    </div>
                    <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${filterDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Panel */}
                  {filterDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-72 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl z-30 p-2 space-y-1">
                      <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        <span>Filter Modules</span>
                        {moduleFilter !== 'all' && (
                          <button
                            type="button"
                            onClick={() => {
                              setModuleFilter('all');
                              setFilterDropdownOpen(false);
                            }}
                            className="text-primary-500 hover:underline capitalize font-semibold cursor-pointer text-[11px]"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {/* Quick Scope Options */}
                      <button
                        type="button"
                        onClick={() => {
                          setModuleFilter('all');
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${moduleFilter === 'all'
                            ? 'bg-primary-500/10 text-primary-500 font-bold'
                            : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                          }`}
                      >
                        <span>All Modules</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">{matrixTemplate.length}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setModuleFilter('granted');
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${moduleFilter === 'granted'
                            ? 'bg-primary-500/10 text-primary-500 font-bold'
                            : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                          }`}
                      >
                        <span>Granted Only</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-success-500/15 text-success-400 rounded-full font-bold">
                          {grantedModulesCount}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setModuleFilter('revoked');
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${moduleFilter === 'revoked'
                            ? 'bg-primary-500/10 text-primary-500 font-bold'
                            : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                          }`}
                      >
                        <span>Revoked / None</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-[var(--bg-input)] text-[var(--text-muted)] rounded-full font-bold">
                          {matrixTemplate.length - grantedModulesCount}
                        </span>
                      </button>

                      <div className="border-t border-[var(--border-color)] my-1" />

                      <div className="px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        Specific Module
                      </div>

                      {/* Scrollable List of Individual Modules */}
                      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
                        {matrixTemplate.map((m) => {
                          const isSelected = moduleFilter === m.moduleCode;
                          const grantedInMod = m.permissions?.filter((p) => selectedPermissions[p.permissionKey])?.length || 0;
                          const totalInMod = m.permissions?.length || 0;

                          return (
                            <button
                              key={m.moduleCode}
                              type="button"
                              onClick={() => {
                                setModuleFilter(m.moduleCode);
                                setFilterDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${isSelected
                                  ? 'bg-primary-500/10 text-primary-500 font-bold'
                                  : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                                }`}
                            >
                              <span className="truncate pr-2">{m.moduleLabel}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[10px] font-semibold ${grantedInMod > 0 ? 'text-primary-500' : 'text-[var(--text-muted)]'}`}>
                                  {grantedInMod}/{totalInMod}
                                </span>
                                {isSelected && <Check size={12} className="text-primary-500" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modules Cards List */}
              {loadingPermissions ? (
                <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-12 text-center text-[var(--text-muted)]">
                  <Spinner size="large" />
                  <span className="mt-3 block text-xs font-semibold">Loading module permissions...</span>
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-8 text-center text-[var(--text-muted)] text-xs">
                  No modules match "{moduleSearch}".
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredModules.map((module) => {
                    const currentScope = moduleScopes[module.moduleCode]?.scope || 'own_branch';
                    const restrictedBranchIds = moduleScopes[module.moduleCode]?.restrictedBranchIds || [];
                    const viewPerm = module.permissions.find((p) => p.action === 'view');
                    const isViewChecked = viewPerm ? Boolean(selectedPermissions[viewPerm.permissionKey]) : false;
                    const hasNonViewChecked = module.permissions.some(
                      (p) => p.action !== 'view' && selectedPermissions[p.permissionKey]
                    );

                    return (
                      <div
                        key={module.moduleCode}
                        className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-colors"
                      >
                        {/* Module Card Header */}
                        <div className="p-3.5 sm:p-4 border-b border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--bg-input)]">
                          {/* Module Title */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 font-bold text-xs">
                              <Layers size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[var(--text-primary)]">
                                  {module.moduleLabel}
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                  ({module.moduleCode})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Select All / None & Module Management */}
                          <div className="flex items-center gap-3 text-xs font-semibold">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleGrantModuleAll(module.moduleCode)}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg text-primary-500 hover:bg-primary-500/10 transition-colors cursor-pointer"
                              >
                                Select All
                              </button>
                              <span className="text-[var(--text-muted)]">•</span>
                              <button
                                type="button"
                                onClick={() => handleRevokeModuleAll(module.moduleCode)}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg text-[var(--text-muted)] hover:text-danger-400 hover:bg-danger-500/10 transition-colors cursor-pointer"
                              >
                                Clear All
                              </button>
                            </div>

                            {/* Edit & Delete Module Actions */}
                            <div className="flex items-center gap-1 pl-2 border-l border-[var(--border-color)]">
                              <Tooltip content="Edit Module">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingModule(module);
                                  }}
                                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-primary-500 hover:bg-primary-500/10 transition-colors cursor-pointer"
                                  aria-label="Edit Module"
                                >
                                  <Pencil size={13} />
                                </button>
                              </Tooltip>

                              <Tooltip content="Delete Module">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmModule(module);
                                  }}
                                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-danger-400 hover:bg-danger-500/10 transition-colors cursor-pointer"
                                  aria-label="Delete Module"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </Tooltip>
                            </div>
                          </div>
                        </div>

                        {/* Module Actions Grid */}
                        <div className="p-3.5 sm:p-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
                            {STANDARD_ACTIONS.map((actionCol) => {
                              const perm = module.permissions.find((p) => p.action === actionCol.key);
                              if (!perm) return null;

                              const isChecked = Boolean(selectedPermissions[perm.permissionKey]);
                              const isImpliedView = actionCol.key === 'view' && hasNonViewChecked && isViewChecked;

                              return (
                                <div
                                  key={actionCol.key}
                                  onClick={(e) => {
                                    if (e.target.closest('[role="switch"]') || e.target.closest('input') || e.target.closest('button')) {
                                      return;
                                    }
                                    handleTogglePermission(module.moduleCode, actionCol.key, perm);
                                  }}
                                  className={`p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${isChecked
                                      ? 'bg-primary-500/15 border-primary-500 shadow-2xs'
                                      : 'bg-[var(--bg-input)] border-[var(--border-color)] hover:bg-white/5'
                                    }`}
                                >
                                  <div className="flex items-center justify-between gap-1 mb-2">
                                    <span className="text-xs font-bold text-[var(--text-primary)]">
                                      {actionCol.label}
                                    </span>
                                    <Toggle
                                      checked={isChecked}
                                      onChange={() => handleTogglePermission(module.moduleCode, actionCol.key, perm)}
                                      size="sm"
                                      color="primary"
                                      isImplied={isImpliedView}
                                      aria-label={`Toggle ${actionCol.label}`}
                                    />
                                  </div>

                                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                                    <span className="truncate" title={perm.description || perm.label}>
                                      {perm.action}
                                    </span>
                                    {isImpliedView && (
                                      <span className="text-[9px] font-bold text-primary-500 uppercase tracking-tighter shrink-0">
                                        Implied
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Quick Add Module Card at bottom of modules */}
                  <button
                    type="button"
                    onClick={() => setCreateModuleModalOpen(true)}
                    className="w-full p-4 rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:border-primary-500 hover:bg-primary-500/10 transition-all flex items-center justify-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-primary-500 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Add New Module & Permission Actions</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateRoleModal
        isOpen={createRoleModalOpen}
        onClose={() => setCreateRoleModalOpen(false)}
        onSubmit={handleCreateRoleSubmit}
        existingRoles={roles}
      />

      <CreateModuleModal
        isOpen={createModuleModalOpen}
        onClose={() => setCreateModuleModalOpen(false)}
        onSuccess={handleCreateModuleSubmit}
      />

      {editingModule && (
        <EditModuleModal
          isOpen={Boolean(editingModule)}
          onClose={() => setEditingModule(null)}
          module={editingModule}
          onSuccess={handleUpdateModuleSubmit}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteConfirmModule)}
        onClose={() => setDeleteConfirmModule(null)}
        onConfirm={handleDeleteModuleSubmit}
        title={`Delete Module "${deleteConfirmModule?.moduleLabel}"?`}
        message={`Are you sure you want to delete module "${deleteConfirmModule?.moduleLabel}" (${deleteConfirmModule?.moduleCode})? All associated permissions and role assignments will be permanently removed.`}
        confirmText="Delete Module"
        confirmVariant="danger"
        loading={deletingModule}
      />

      <ConfirmDialog
        isOpen={confirmDiscardOpen}
        onClose={() => {
          setConfirmDiscardOpen(false);
          setPendingSwitchRoleId(null);
        }}
        onConfirm={handleConfirmRoleSwitch}
        title="Discard Unsaved Changes?"
        message="You have unsaved permission changes on the current role. Switching roles will discard those changes. Do you want to proceed?"
        confirmText="Discard & Switch Role"
        confirmVariant="danger"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteConfirmRole)}
        onClose={() => setDeleteConfirmRole(null)}
        onConfirm={handleDeleteRoleSubmit}
        title={`Delete Role "${deleteConfirmRole?.name}"?`}
        message="Are you sure you want to delete this custom role? This action cannot be undone."
        confirmText="Delete Role"
        confirmVariant="danger"
        loading={deletingRole}
      />
    </div>
  );
};

export default RoleListPage;
