import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { userService } from '../../../services/userService';
import { fetchBranches } from '../../branch/api/branchApi';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { notifyPermissionUpdate } from '../../../utils/permissionUtils';

/**
 * 1. State Management Hook for User Management & Access Control Page
 */
export const useUserManagement = () => {
  const { user, refreshUser } = useAuth();
  const { canCreate, canEdit, canDelete } = usePermission();

  let selectedOrganisation = null;
  let isSuperAdmin = false;
  try {
    const org = useOrganisation();
    selectedOrganisation = org.selectedOrganisation;
    isSuperAdmin = org.isSuperAdmin;
  } catch (err) {
    // Graceful fallback if rendered outside OrganisationContext
  }

  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;
  const effectiveOrgName = isSuperAdmin
    ? selectedOrganisation?.name
    : user?.organizationName || selectedOrganisation?.name || '';

  const currentRole = String(user?.role || user?.roleSlug || user?.roleName || '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const isBranchManager = currentRole === 'branch_manager';
  const isOwner = currentRole === 'owner';
  const canCreateUser = isSuperAdmin || canCreate('users');
  const canEditUser = isSuperAdmin || canEdit('users');
  const canDeleteUser = isSuperAdmin || canDelete('users');
  const canManageRoles = isSuperAdmin || canEdit('roles') || canEdit('users');

  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Layout View Mode ('split' | 'table')
  const [viewMode, setViewMode] = useState('split');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // Pagination for Table View
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Selection
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('effective-permissions');

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isRemoveImpactOpen, setIsRemoveImpactOpen] = useState(false);
  const [roleToRemove, setRoleToRemove] = useState(null);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Resend Invite & Delete state
  const [resendingId, setResendingId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteBlockerInfo, setDeleteBlockerInfo] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusModalUser, setStatusModalUser] = useState(null);

  const handleSelectUser = useCallback(async (u) => {
    setSelectedUser(u);
    setDetailsLoading(true);
    try {
      const details = await userService.getUserRoleDetails(u.id);
      setUserDetails(details);
    } catch (err) {
      toast.error(err.message || 'Failed to load user role details');
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (isSuperAdmin && !effectiveOrgId) {
      setUsers([]);
      setAvailableRoles([]);
      setAvailableBranches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [usersRes, rolesData, branchesRes] = await Promise.all([
        userService.getUsers(effectiveOrgId ? { organizationId: effectiveOrgId } : {}),
        userService.getAvailableRoles(),
        fetchBranches(
          effectiveOrgId
            ? { organizationId: effectiveOrgId, limit: 100 }
            : { limit: 100 },
        ).catch(() => ({ data: [] })),
      ]);

      const userList = Array.isArray(usersRes)
        ? usersRes
        : usersRes?.data || [];
      const roleList = Array.isArray(rolesData)
        ? rolesData
        : rolesData?.data || [];
      const branchList = Array.isArray(branchesRes)
        ? branchesRes
        : branchesRes?.data || branchesRes?.branches || [];

      setUsers(userList);
      setAvailableRoles(roleList);
      setAvailableBranches(branchList);

      if (userList.length > 0 && !selectedUser) {
        handleSelectUser(userList[0]);
      } else if (selectedUser) {
        const refreshed = userList.find((u) => u.id === selectedUser.id);
        if (refreshed) {
          handleSelectUser(refreshed);
        } else if (userList.length > 0) {
          handleSelectUser(userList[0]);
        } else {
          setSelectedUser(null);
          setUserDetails(null);
        }
      } else {
        setSelectedUser(null);
        setUserDetails(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load user management data');
    } finally {
      setLoading(false);
    }
  }, [effectiveOrgId, isSuperAdmin, selectedUser, handleSelectUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInviteSuccess = async (payload) => {
    const result = await userService.inviteUser(payload);
    await loadData();
    return result;
  };

  const handleResendInvite = async (userId, e) => {
    if (e) e.stopPropagation();
    setResendingId(userId);
    try {
      const res = await userService.resendInvite(userId);
      toast.success(
        `Invitation renewed for ${res.displayName}! Link copied to clipboard.`,
      );
      if (res.inviteToken) {
        const fullUrl = `${window.location.origin}/accept-invite?token=${res.inviteToken}`;
        navigator.clipboard.writeText(fullUrl);
      }
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to resend invitation');
    } finally {
      setResendingId(null);
    }
  };

  const handleOpenEditUser = (u, e) => {
    if (e) e.stopPropagation();
    setUserToEdit(u);
    setIsEditUserOpen(true);
  };

  const handleUserUpdated = async (userId, payload) => {
    const updated = await userService.updateUser(userId, payload);
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => ({ ...prev, ...updated }));
    }
    await loadData();
    return updated;
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    setDeleteBlockerInfo(null);
    try {
      await userService.deleteUser(userToDelete.id);
      toast.success(`User "${userToDelete.displayName}" deleted successfully`);
      setUserToDelete(null);
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
        setUserDetails(null);
      }
      await loadData();
    } catch (err) {
      const blockers =
        err.dependencies ||
        err.data?.error?.dependencies ||
        err.data?.dependencies;

      if (blockers || err.code === 'HISTORICAL_RECORDS_EXIST') {
        setDeleteBlockerInfo(blockers || { historicalRecords: 'Active' });
      } else {
        toast.error(err.message || 'Failed to delete user');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleMakePrimary = async (role) => {
    if (!selectedUser) return;
    const roleId = role.roleId || role.id;
    try {
      await userService.setPrimaryRole(selectedUser.id, roleId);
      toast.success(`Set "${role.name}" as Primary Role`);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to set primary role');
    }
  };

  const handleAssignRoleSubmit = async ({ roleId, isPrimary }) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await userService.assignRole(selectedUser.id, { roleId, isPrimary });
      toast.success('Role assigned successfully');
      notifyPermissionUpdate({ userId: selectedUser.id });
      await refreshUser();
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to assign role');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRemoveModal = (role) => {
    setRoleToRemove(role);
    setIsRemoveImpactOpen(true);
  };

  const handleConfirmRoleRemoval = async (roleId) => {
    if (!selectedUser) return;
    try {
      await userService.removeRole(selectedUser.id, roleId);
      toast.success('Role assignment removed');
      notifyPermissionUpdate({ userId: selectedUser.id });
      await refreshUser();
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to remove role');
      throw err;
    }
  };

  // Client filtering
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = u.displayName?.toLowerCase().includes(q);
      const matchesEmail = u.email?.toLowerCase().includes(q);
      const matchesPhone = u.phoneNumber?.includes(q);
      const matchesRole = u.activeRoles?.some((r) =>
        r.name?.toLowerCase().includes(q),
      );
      const matchesQuery =
        !q || matchesName || matchesEmail || matchesPhone || matchesRole;

      let matchesStatus = true;
      if (statusFilter !== 'all') {
        matchesStatus = u.status === statusFilter;
      }

      let matchesRoleFilter = true;
      if (roleFilter) {
        matchesRoleFilter = u.activeRoles?.some(
          (r) => r.roleId === roleFilter || r.id === roleFilter,
        );
      }

      let matchesBranchFilter = true;
      if (branchFilter) {
        matchesBranchFilter =
          u.homeBranch?.branchId === branchFilter ||
          u.assignedBranches?.some((b) => b.branchId === branchFilter);
      }

      return (
        matchesQuery && matchesStatus && matchesRoleFilter && matchesBranchFilter
      );
    });
  }, [users, searchQuery, statusFilter, roleFilter, branchFilter]);

  // Paginated users for Table view
  const paginatedTableUsers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredUsers.slice(start, start + limit);
  }, [filteredUsers, page, limit]);

  // Quick KPI metrics
  const activeCount = useMemo(
    () => users.filter((u) => u.status === 'active').length,
    [users],
  );
  const pendingCount = useMemo(
    () => users.filter((u) => u.status === 'pending_invite').length,
    [users],
  );
  const expiredCount = useMemo(
    () => users.filter((u) => u.status === 'pending_invite' && u.isInviteExpired).length,
    [users],
  );

  const statusFilterOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active Only' },
    { value: 'pending_invite', label: 'Pending Invite' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'deactivated', label: 'Deactivated' },
  ];

  const roleFilterOptions = [
    { value: '', label: 'All Roles' },
    ...availableRoles.map((role) => ({
      value: role.id,
      label: role.name,
    })),
  ];

  const branchFilterOptions = [
    { value: '', label: 'All Branches' },
    ...availableBranches.map((b) => ({
      value: b.id,
      label: b.name,
    })),
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setRoleFilter('');
    setBranchFilter('');
    setPage(1);
  };

  return {
    user,
    refreshUser,
    canCreateUser,
    canEditUser,
    canDeleteUser,
    canManageRoles,
    isBranchManager,
    isOwner,
    isSuperAdmin,
    effectiveOrgId,
    effectiveOrgName,
    users,
    availableRoles,
    availableBranches,
    loading,
    loadData,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    branchFilter,
    setBranchFilter,
    statusFilterOptions,
    roleFilterOptions,
    branchFilterOptions,
    page,
    setPage,
    limit,
    setLimit,
    selectedUser,
    setSelectedUser,
    userDetails,
    detailsLoading,
    activeTab,
    setActiveTab,
    handleSelectUser,
    isInviteModalOpen,
    setIsInviteModalOpen,
    isEditUserOpen,
    setIsEditUserOpen,
    userToEdit,
    setUserToEdit,
    isAddRoleOpen,
    setIsAddRoleOpen,
    isRemoveImpactOpen,
    setIsRemoveImpactOpen,
    roleToRemove,
    setRoleToRemove,
    isBulkAssignOpen,
    setIsBulkAssignOpen,
    actionLoading,
    resendingId,
    userToDelete,
    setUserToDelete,
    deleteBlockerInfo,
    setDeleteBlockerInfo,
    deleting,
    statusModalUser,
    setStatusModalUser,
    filteredUsers,
    paginatedTableUsers,
    activeCount,
    pendingCount,
    expiredCount,
    handleResetFilters,
    handleInviteSuccess,
    handleResendInvite,
    handleOpenEditUser,
    handleUserUpdated,
    handleConfirmDelete,
    handleMakePrimary,
    handleAssignRoleSubmit,
    handleOpenRemoveModal,
    handleConfirmRoleRemoval,
  };
};

/**
 * 2. State Management Hook for Accept Invitation Page
 */
export const useAcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [tokenStatus, setTokenStatus] = useState(null); // { valid, expired, user, message }
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenStatus({
        valid: false,
        message: 'No invitation token found in the URL. Please check your invitation link.',
      });
      return;
    }

    const verify = async () => {
      try {
        const res = await userService.verifyInviteToken(token);
        setTokenStatus(res);
      } catch (err) {
        setTokenStatus({
          valid: false,
          message: err.message || 'Invalid or already used invitation link.',
        });
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [token]);

  // Password rules evaluation
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&#^()_+=\-[\]{}|;:'",.<>/]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };

  const isPasswordValid = Boolean(
    rules.length && rules.upper && rules.lower && rules.number && rules.special && rules.match,
  );

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!isPasswordValid) {
      setErrorMsg('Please satisfy all password security requirements');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      await userService.acceptInvite({ token, password });
      setSuccess(true);
      toast.success('Your account has been activated!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to activate account');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    token,
    verifying,
    tokenStatus,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    submitting,
    success,
    errorMsg,
    rules,
    isPasswordValid,
    handleSubmit,
    navigate,
  };
};

export default {
  useUserManagement,
  useAcceptInvite,
};

