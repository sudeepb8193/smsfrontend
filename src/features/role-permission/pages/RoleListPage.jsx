import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { rolePermissionApi } from '../api/rolePermissionApi';
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
import { toast } from 'sonner';

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
  const navigate = useNavigate();

  // Roles state
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roleSearch, setRoleSearch] = useState('');

  // Permissions & Matrix state for selected role
  const [matrixTemplate, setMatrixTemplate] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [moduleScopes, setModuleScopes] = useState({});
  const [versionToken, setVersionToken] = useState('');
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [moduleSearch, setModuleSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const [expandedRestrictedModule, setExpandedRestrictedModule] = useState(null);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Modals state
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);
  const [createModuleModalOpen, setCreateModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [deleteConfirmModule, setDeleteConfirmModule] = useState(null);
  const [deletingModule, setDeletingModule] = useState(false);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState(null);
  const [deletingRole, setDeletingRole] = useState(false);
  const [pendingSwitchRoleId, setPendingSwitchRoleId] = useState(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  // 1. Initial Load: Fetch roles, matrix template, and branches
  const fetchInitialData = async () => {
    try {
      setLoadingRoles(true);
      const apiFn = isSuperAdminView
        ? rolePermissionApi.getSuperAdminRoles
        : rolePermissionApi.getRoles;

      const [rolesRes, templateRes, branchesRes] = await Promise.all([
        apiFn({ limit: 100, organizationId: selectedOrgId || undefined }),
        rolePermissionApi.getMatrixTemplate(),
        rolePermissionApi.getBranches(selectedOrgId || undefined),
      ]);

      const roleList = rolesRes?.items || (Array.isArray(rolesRes) ? rolesRes : []);
      setRoles(roleList);
      setMatrixTemplate(templateRes || []);
      setBranches(branchesRes || []);

      // Auto-select first role if none currently selected
      if (roleList.length > 0 && !selectedRoleId) {
        setSelectedRoleId(roleList[0].id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to initialize role and permission data');
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [selectedOrgId]);

  // 2. Load Permissions whenever selectedRoleId changes
  const loadRolePermissions = async (roleId) => {
    if (!roleId) return;
    try {
      setLoadingPermissions(true);
      const permData = await rolePermissionApi.getRolePermissions(roleId);
      const assignments = permData.assignments || [];

      const permMap = {};
      const modScopeMap = {};

      assignments.forEach((assign) => {
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
      setVersionToken(permData.versionToken || permData.updatedAt || '');
      setHasUnsavedChanges(false);
    } catch (err) {
      toast.error(err.message || 'Failed to load permissions for role');
    } finally {
      setLoadingPermissions(false);
    }
  };

  useEffect(() => {
    if (selectedRoleId) {
      loadRolePermissions(selectedRoleId);
    }
  }, [selectedRoleId]);

  // Active Role Object
  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || null;
  }, [roles, selectedRoleId]);

  // Filtered Roles (Left Panel)
  const filteredRoles = useMemo(() => {
    if (!roleSearch.trim()) return roles;
    const q = roleSearch.toLowerCase().trim();
    return roles.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.slug?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [roles, roleSearch]);

  // Filter Label for Dropdown
  const filterLabel = useMemo(() => {
    if (moduleFilter === 'all') return 'All Modules';
    if (moduleFilter === 'granted') return 'Granted Only';
    if (moduleFilter === 'revoked') return 'Revoked Only';
    const found = matrixTemplate.find((m) => m.moduleCode === moduleFilter);
    return found ? found.moduleLabel : 'Filter Module';
  }, [moduleFilter, matrixTemplate]);

  // Count of modules with at least 1 granted permission
  const grantedModulesCount = useMemo(() => {
    return matrixTemplate.filter((m) =>
      m.permissions?.some((p) => selectedPermissions[p.permissionKey])
    ).length;
  }, [matrixTemplate, selectedPermissions]);

  // Filtered Modules (Right Panel)
  const filteredModules = useMemo(() => {
    let result = matrixTemplate;

    // Filter by dropdown
    if (moduleFilter !== 'all') {
      if (moduleFilter === 'granted') {
        result = result.filter((m) =>
          m.permissions?.some((p) => selectedPermissions[p.permissionKey])
        );
      } else if (moduleFilter === 'revoked') {
        result = result.filter((m) =>
          !m.permissions?.some((p) => selectedPermissions[p.permissionKey])
        );
      } else {
        result = result.filter((m) => m.moduleCode === moduleFilter);
      }
    }

    // Filter by text search
    if (moduleSearch.trim()) {
      const q = moduleSearch.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.moduleLabel?.toLowerCase().includes(q) ||
          m.moduleCode?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [matrixTemplate, moduleSearch, moduleFilter, selectedPermissions]);

  // Total permissions count stats
  const totalAvailableCount = useMemo(() => {
    return matrixTemplate.reduce((acc, mod) => acc + (mod.permissions?.length || 0), 0);
  }, [matrixTemplate]);

  const selectedCount = Object.keys(selectedPermissions).length;

  // Safe Role Switcher (handles unsaved changes confirmation)
  const handleSelectRole = (newRoleId) => {
    if (newRoleId === selectedRoleId) return;
    if (hasUnsavedChanges) {
      setPendingSwitchRoleId(newRoleId);
      setConfirmDiscardOpen(true);
    } else {
      setSelectedRoleId(newRoleId);
    }
  };

  const handleConfirmRoleSwitch = () => {
    setConfirmDiscardOpen(false);
    if (pendingSwitchRoleId) {
      setSelectedRoleId(pendingSwitchRoleId);
      setPendingSwitchRoleId(null);
    }
  };

  // Toggle Single Action Permission
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

  // Grant All globally for this role
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

  // Revoke All globally for this role
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
      setExpandedRestrictedModule(moduleCode);
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

  // Save Permissions
  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;

    // Validate restricted branches
    for (const mod of matrixTemplate) {
      const scopeData = moduleScopes[mod.moduleCode];
      if (scopeData?.scope === 'restricted_branches') {
        const hasSelectedPerms = mod.permissions?.some((p) => selectedPermissions[p.permissionKey]);
        if (hasSelectedPerms && (!scopeData.restrictedBranchIds || scopeData.restrictedBranchIds.length === 0)) {
          toast.warning(`Module "${mod.moduleLabel}" has scope "Restricted Branches", but no branches are selected.`);
          setExpandedRestrictedModule(mod.moduleCode);
          return;
        }
      }
    }

    try {
      setSavingPermissions(true);
      const permissionsPayload = Object.entries(selectedPermissions).map(([key, data]) => ({
        permissionKey: key,
        scope: data.scope || 'own_branch',
        restrictedBranchIds: data.scope === 'restricted_branches' ? data.restrictedBranchIds : undefined,
      }));

      const res = await rolePermissionApi.updateRolePermissions(selectedRoleId, {
        permissions: permissionsPayload,
        expectedUpdatedAt: versionToken,
      });

      toast.success(`Permissions saved successfully for "${selectedRole?.name}"`);
      if (res.warning) toast.warning(res.warning);
      setVersionToken(res.versionToken);
      setHasUnsavedChanges(false);

      // Refresh roles to update permission counters
      const apiFn = isSuperAdminView ? rolePermissionApi.getSuperAdminRoles : rolePermissionApi.getRoles;
      const rolesRes = await apiFn({ limit: 100, organizationId: selectedOrgId || undefined });
      setRoles(rolesRes?.items || (Array.isArray(rolesRes) ? rolesRes : []));
    } catch (err) {
      toast.error(err.message || 'Failed to save permissions');
    } finally {
      setSavingPermissions(false);
    }
  };

  // Create Role Submit
  const handleCreateRoleSubmit = async (data) => {
    try {
      const apiFn = isSuperAdminView ? rolePermissionApi.createSuperAdminRole : rolePermissionApi.createRole;
      const newRole = await apiFn(data);
      toast.success(`Role "${newRole.name}" created successfully`);
      setCreateRoleModalOpen(false);

      // Refresh list & select newly created role
      const rolesRes = await apiFn({ limit: 100, organizationId: selectedOrgId || undefined });
      const roleList = rolesRes?.items || (Array.isArray(rolesRes) ? rolesRes : []);
      setRoles(roleList);
      setSelectedRoleId(newRole.id);
    } catch (err) {
      toast.error(err.message || 'Failed to create role');
    }
  };

  // Create Module Submit
  const handleCreateModuleSubmit = async (data) => {
    const res = await rolePermissionApi.createModulePermissions(data);
    toast.success(`Module "${res.moduleLabel}" registered with ${res.permissions?.length || 0} actions`);
    // Refresh matrix template
    const templateRes = await rolePermissionApi.getMatrixTemplate();
    setMatrixTemplate(templateRes || []);
  };

  // Update Module Submit
  const handleUpdateModuleSubmit = async (moduleCode, data) => {
    try {
      const res = await rolePermissionApi.updateModulePermissions(moduleCode, data);
      toast.success(`Module "${res.moduleLabel || data.moduleLabel}" updated successfully`);
      setEditingModule(null);
      // Refresh template & current permissions
      const templateRes = await rolePermissionApi.getMatrixTemplate();
      setMatrixTemplate(templateRes || []);
      if (selectedRoleId) {
        await loadRolePermissions(selectedRoleId);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update module');
    }
  };

  // Delete Module Submit
  const handleDeleteModuleSubmit = async () => {
    if (!deleteConfirmModule) return;
    try {
      setDeletingModule(true);
      await rolePermissionApi.deleteModule(deleteConfirmModule.moduleCode);
      toast.success(`Module "${deleteConfirmModule.moduleLabel}" deleted successfully`);
      setDeleteConfirmModule(null);
      // Refresh template & current permissions
      const templateRes = await rolePermissionApi.getMatrixTemplate();
      setMatrixTemplate(templateRes || []);
      if (selectedRoleId) {
        await loadRolePermissions(selectedRoleId);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete module');
    } finally {
      setDeletingModule(false);
    }
  };

  // Delete Role
  const handleDeleteRoleSubmit = async () => {
    if (!deleteConfirmRole) return;
    try {
      setDeletingRole(true);
      await rolePermissionApi.deleteRole(deleteConfirmRole.id);
      toast.success(`Role "${deleteConfirmRole.name}" deleted successfully`);
      setDeleteConfirmRole(null);

      // Refresh roles
      const apiFn = isSuperAdminView ? rolePermissionApi.getSuperAdminRoles : rolePermissionApi.getRoles;
      const rolesRes = await apiFn({ limit: 100, organizationId: selectedOrgId || undefined });
      const roleList = rolesRes?.items || (Array.isArray(rolesRes) ? rolesRes : []);
      setRoles(roleList);
      if (selectedRoleId === deleteConfirmRole.id) {
        setSelectedRoleId(roleList[0]?.id || null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete role');
    } finally {
      setDeletingRole(false);
    }
  };

  return (
    <div>
      {/* Two-Section Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT SECTION: ALL ROLES (Master Panel)                     */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 xl:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors lg:sticky lg:top-20 h-[calc(100vh-6rem)] min-h-[500px]">
          {/* Roles Search & Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="Search roles..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Roles Scrollable List */}
          <div className="flex-1 p-2 space-y-1.5 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
            {loadingRoles ? (
              <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-xs">
                <Spinner size="small" />
                <span className="mt-2 font-medium">Loading roles...</span>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs italic">
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
                          ? 'bg-primary-50/80 dark:bg-primary-950/40 border-primary-500 shadow-xs  ring-primary-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/50'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected
                              ? 'bg-primary-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                            }`}
                        >
                          <Shield size={18} />
                        </div>

                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                            {role.name}
                          </span>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
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
                              className="p-1 rounded-md text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/30 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </Tooltip>
                        )}
                        <ChevronRight
                          size={15}
                          className={`transition-transform ${isSelected
                              ? 'text-primary-600 dark:text-primary-400 translate-x-0.5'
                              : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'
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
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          {/* Header on Right Side */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Roles & Access Permissions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
              <Shield className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold">Select a role from the left to configure permissions</p>
            </div>
          ) : (
            <>
              {/* Selected Role Header & Global Action Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Role Identity & Details */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <Shield size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {selectedRole.name}
                        </h3>
                        <Badge variant={selectedRole.status === 'active' ? 'success' : 'danger'} size="small">
                          {selectedRole.status}
                        </Badge>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                          {selectedCount} / {totalAvailableCount} granted
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                        {selectedRole.description || 'Configure accessible business modules and operations.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Toolbar (Neatly aligned in a single horizontal group) */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center flex-wrap sm:flex-nowrap">
                    {/* Bulk Selection Segmented Group */}
                    <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                      <button
                        type="button"
                        onClick={handleGrantAllGlobal}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                      >
                        Grant All
                      </button>
                      <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                      <button
                        type="button"
                        onClick={handleRevokeAllGlobal}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
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
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-warning-700 dark:text-warning-300">
                    <span className="w-2 h-2 rounded-full bg-warning-500 animate-pulse" />
                    <span>Unsaved permission adjustments pending. Remember to click "Save Changes".</span>
                  </div>
                )}
              </div>

              {/* Modules Filter & Search Toolbar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-colors">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    placeholder="Filter modules (e.g. appointments, customers, billing, inventory)..."
                    className="w-full pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary-500 transition-all"
                  />
                  {moduleSearch && (
                    <button
                      type="button"
                      onClick={() => setModuleSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full cursor-pointer"
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
                        ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-300 dark:border-primary-500/30 text-primary-700 dark:text-primary-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Filter size={13} className={moduleFilter !== 'all' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'} />
                      <span className="truncate max-w-[150px]">{filterLabel}</span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${filterDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Panel */}
                  {filterDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-30 p-2 space-y-1">
                      <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Filter Modules</span>
                        {moduleFilter !== 'all' && (
                          <button
                            type="button"
                            onClick={() => {
                              setModuleFilter('all');
                              setFilterDropdownOpen(false);
                            }}
                            className="text-primary-600 dark:text-primary-400 hover:underline capitalize font-semibold cursor-pointer text-[11px]"
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
                            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                      >
                        <span>All Modules</span>
                        <span className="text-[10px] text-slate-400 font-medium">{matrixTemplate.length}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setModuleFilter('granted');
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${moduleFilter === 'granted'
                            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                      >
                        <span>Granted Only</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-success-50 dark:bg-success-950/40 text-success-600 dark:text-success-400 rounded-full font-bold">
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
                            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                      >
                        <span>Revoked / None</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold">
                          {matrixTemplate.length - grantedModulesCount}
                        </span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <div className="px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                                  ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 font-bold'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                }`}
                            >
                              <span className="truncate pr-2">{m.moduleLabel}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[10px] font-semibold ${grantedInMod > 0 ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
                                  {grantedInMod}/{totalInMod}
                                </span>
                                {isSelected && <Check size={12} className="text-primary-600 dark:text-primary-400" />}
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
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
                  <Spinner size="large" />
                  <span className="mt-3 block text-xs font-semibold">Loading module permissions...</span>
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 text-xs">
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
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors"
                      >
                        {/* Module Card Header */}
                        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                          {/* Module Title */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 font-bold text-xs">
                              <Layers size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                  {module.moduleLabel}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
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
                                className="px-2.5 py-1 text-xs font-medium rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors cursor-pointer"
                              >
                                Select All
                              </button>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <button
                                type="button"
                                onClick={() => handleRevokeModuleAll(module.moduleCode)}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-500 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors cursor-pointer"
                              >
                                Clear All
                              </button>
                            </div>

                            {/* Edit & Delete Module Actions */}
                            <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                              <Tooltip content="Edit Module">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingModule(module);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors cursor-pointer"
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
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors cursor-pointer"
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
                                  onClick={() => handleTogglePermission(module.moduleCode, actionCol.key, perm)}
                                  className={`p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${isChecked
                                      ? 'bg-primary-50/70 dark:bg-primary-950/30 border-primary-500/50 shadow-2xs'
                                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                                    }`}
                                >
                                  <div className="flex items-center justify-between gap-1 mb-2">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
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

                                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                                    <span className="truncate" title={perm.description || perm.label}>
                                      {perm.action}
                                    </span>
                                    {isImpliedView && (
                                      <span className="text-[9px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-tighter shrink-0">
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
                    className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary-500/50 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 transition-all flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
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
