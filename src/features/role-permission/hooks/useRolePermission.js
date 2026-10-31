import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { rolePermissionApi } from '../api/rolePermissionApi';
import { notifyPermissionUpdate } from '../../../utils/permissionUtils';
import { useAuth } from '../../../hooks/useAuth';

/**
 * 1. State Management Hook for Role List & Role-Permission Matrix Page
 */
export const useRoleList = ({ isSuperAdminView = false, selectedOrgId = null } = {}) => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

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
  const fetchInitialData = useCallback(async () => {
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
  }, [isSuperAdminView, selectedOrgId, selectedRoleId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // 2. Load Permissions whenever selectedRoleId changes
  const loadRolePermissions = useCallback(async (roleId) => {
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
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      loadRolePermissions(selectedRoleId);
    }
  }, [selectedRoleId, loadRolePermissions]);

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
      next[key] = {
        scope: currentModScope.scope,
        restrictedBranchIds: [...currentModScope.restrictedBranchIds],
      };

      // Dependency Rule: Any non-view action automatically implies and grants View
      if (action !== 'view') {
        const viewPerm = matrixTemplate
          .find((m) => m.moduleCode === moduleCode)
          ?.permissions?.find((p) => p.action === 'view');

        if (viewPerm && !next[viewPerm.permissionKey]) {
          next[viewPerm.permissionKey] = {
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

      // Immediately propagate updated permissions across state and tabs without page reload
      notifyPermissionUpdate({ roleId: selectedRoleId });
      await refreshUser();

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
      notifyPermissionUpdate({ roleId: deleteConfirmRole.id });
      await refreshUser();
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

  return {
    navigate,
    roles,
    setRoles,
    selectedRoleId,
    setSelectedRoleId,
    selectedRole,
    loadingRoles,
    roleSearch,
    setRoleSearch,
    filteredRoles,
    matrixTemplate,
    branches,
    selectedPermissions,
    moduleScopes,
    versionToken,
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
    fetchInitialData,
    loadRolePermissions,
  };
};

/**
 * 2. State Management Hook for Single Role Permission Matrix Page
 */
export const useRolePermissions = ({ isSuperAdminView = false } = {}) => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [role, setRole] = useState(null);
  const [matrixTemplate, setMatrixTemplate] = useState([]);
  const [initialAssignments, setInitialAssignments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [versionToken, setVersionToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [concurrencyConflict, setConcurrencyConflict] = useState(null);

  const loadData = useCallback(async () => {
    if (!roleId) return;
    try {
      setLoading(true);
      setConcurrencyConflict(null);

      const [roleData, permData, templateData, branchData] = await Promise.all([
        rolePermissionApi.getRole(roleId),
        rolePermissionApi.getRolePermissions(roleId),
        rolePermissionApi.getMatrixTemplate(),
        rolePermissionApi.getBranches(),
      ]);

      setRole(roleData);
      setInitialAssignments(permData.assignments || []);
      setVersionToken(permData.versionToken || permData.updatedAt || '');
      setMatrixTemplate(templateData || []);
      setBranches(branchData || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load role permission matrix');
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      setConcurrencyConflict(null);

      const res = await rolePermissionApi.updateRolePermissions(roleId, payload);
      toast.success('Permissions and branch scopes saved successfully');
      if (res.warning) {
        toast.warning(res.warning);
      }

      // Immediately synchronize permissions across client state and other tabs without page reload
      notifyPermissionUpdate({ roleId });
      await refreshUser();

      setVersionToken(res.versionToken);
      // Reload fresh data
      await loadData();
    } catch (err) {
      if (err.status === 409 || err.data?.code === 'CONCURRENCY_CONFLICT') {
        setConcurrencyConflict({
          message: err.data?.message || 'Role permissions have been modified by another administrator.',
        });
        toast.error('Concurrency Conflict: Please review the updated role state before saving.');
      } else {
        toast.error(err.message || 'Failed to save permissions');
      }
    } finally {
      setSaving(false);
    }
  };

  const basePath = isSuperAdminView ? '/super-admin/roles' : '/owner/roles';
  const handleBack = () => navigate(basePath);

  return {
    roleId,
    navigate,
    basePath,
    handleBack,
    role,
    matrixTemplate,
    initialAssignments,
    branches,
    versionToken,
    loading,
    saving,
    concurrencyConflict,
    loadData,
    handleSave,
  };
};

/**
 * 3. State Management Hook for Permission Catalog Reference Page
 */
export const usePermissionCatalog = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await rolePermissionApi.getPermissions({
          includeLegacy: true,
        });
        setPermissions(data || []);

        // Auto-expand all modules initially
        const autoExpanded = {};
        (data || []).forEach((p) => {
          autoExpanded[p.moduleCode] = true;
        });
        setExpandedModules(autoExpanded);
      } catch (err) {
        toast.error(err.message || 'Failed to load permissions catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  // Filter permissions
  const filtered = useMemo(() => {
    return permissions.filter((p) => {
      if (moduleFilter && p.moduleCode !== moduleFilter) return false;
      if (actionFilter && p.action !== actionFilter) return false;
      if (search) {
        const term = search.toLowerCase();
        return (
          p.permissionKey.toLowerCase().includes(term) ||
          p.label.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)) ||
          p.moduleLabel.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [permissions, search, moduleFilter, actionFilter]);

  // Group by module
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((p) => {
      if (!map.has(p.moduleCode)) {
        map.set(p.moduleCode, {
          moduleCode: p.moduleCode,
          moduleLabel: p.moduleLabel,
          items: [],
        });
      }
      map.get(p.moduleCode).items.push(p);
    });
    return Array.from(map.values());
  }, [filtered]);

  // Unique module options for filter dropdown
  const moduleOptions = useMemo(() => {
    const mods = new Map();
    permissions.forEach((p) => {
      mods.set(p.moduleCode, p.moduleLabel);
    });
    return [
      { value: '', label: 'All Modules' },
      ...Array.from(mods.entries()).map(([code, label]) => ({
        value: code,
        label: `${label} (${code})`,
      })),
    ];
  }, [permissions]);

  const toggleExpand = (modCode) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modCode]: !prev[modCode],
    }));
  };

  const expandAll = () => {
    const next = {};
    grouped.forEach((g) => {
      next[g.moduleCode] = true;
    });
    setExpandedModules(next);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  return {
    permissions,
    loading,
    search,
    setSearch,
    moduleFilter,
    setModuleFilter,
    actionFilter,
    setActionFilter,
    expandedModules,
    filtered,
    grouped,
    moduleOptions,
    toggleExpand,
    expandAll,
    collapseAll,
  };
};

/**
 * 4. State Management Hook for Staff Overrides Page
 */
export const useStaffOverrides = () => {
  const { refreshUser } = useAuth();
  const [staffIdInput, setStaffIdInput] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [overridesData, setOverridesData] = useState(null);
  const [permissionsCatalog, setPermissionsCatalog] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOverrideTarget, setDeleteOverrideTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load catalog and branches on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const [perms, brs] = await Promise.all([
          rolePermissionApi.getPermissions(),
          rolePermissionApi.getBranches(),
        ]);
        setPermissionsCatalog(perms || []);
        setBranches(brs || []);
      } catch (err) {
        console.error('Failed to prefetch metadata', err);
      }
    };
    initData();
  }, []);

  const loadStaffOverrides = async (id) => {
    if (!id?.trim()) return;
    try {
      setLoading(true);
      const [overridesRes, effRes] = await Promise.all([
        rolePermissionApi.getStaffOverrides(id.trim()),
        rolePermissionApi.getStaffEffectivePermissions(id.trim()),
      ]);

      setOverridesData({
        ...overridesRes,
        effectivePermissions: effRes.effectivePermissions || [],
      });
      setSelectedStaff({
        id: overridesRes.staffId,
        fullName: overridesRes.fullName,
        employeeCode: overridesRes.employeeCode,
        homeBranch: overridesRes.homeBranch,
      });
    } catch (err) {
      toast.error(err.message || 'Staff member not found');
      setOverridesData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOverride = async (payload) => {
    try {
      setSubmitting(true);
      await rolePermissionApi.createStaffOverride(selectedStaff.id, payload);
      toast.success('Permission exception created successfully');
      setModalOpen(false);
      notifyPermissionUpdate({ staffId: selectedStaff.id });
      await refreshUser();
      loadStaffOverrides(selectedStaff.id);
    } catch (err) {
      toast.error(err.message || 'Failed to create override');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOverride = async () => {
    if (!deleteOverrideTarget) return;
    try {
      setDeleting(true);
      await rolePermissionApi.deleteStaffOverride(selectedStaff.id, deleteOverrideTarget.id);
      toast.success('Permission override removed');
      setDeleteOverrideTarget(null);
      notifyPermissionUpdate({ staffId: selectedStaff.id });
      await refreshUser();
      loadStaffOverrides(selectedStaff.id);
    } catch (err) {
      toast.error(err.message || 'Failed to remove override');
    } finally {
      setDeleting(false);
    }
  };

  return {
    staffIdInput,
    setStaffIdInput,
    selectedStaff,
    setSelectedStaff,
    overridesData,
    permissionsCatalog,
    branches,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    deleteOverrideTarget,
    setDeleteOverrideTarget,
    deleting,
    loadStaffOverrides,
    handleCreateOverride,
    handleDeleteOverride,
  };
};

export default {
  useRoleList,
  useRolePermissions,
  usePermissionCatalog,
  useStaffOverrides,
};
