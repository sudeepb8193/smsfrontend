import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService } from '../../../services/userService';
import { fetchBranches } from '../../branch/api/branchApi';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { useDebounce } from '../../../hooks/useDebounce';
import { queryClient, queryKeys } from '../../../config/queryClient';
import { notifyPermissionUpdate } from '../../../utils/permissionUtils';

/**
 * 1. State Management Hook for User Management & Access Control Page
 * Powered by TanStack Query for caching, server-side filtering, and instant deduplication.
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

  // Layout View Mode ('split' | 'table')
  const [viewMode, setViewMode] = useState('split');

  // Server-Side Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);

  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // Server-Side Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Selection
  const [selectedUser, setSelectedUser] = useState(null);
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

  // 1. TanStack Query: Users list with Server-Side Search, Filtering, and Pagination
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      roleId: roleFilter || undefined,
      branchId: branchFilter || undefined,
      organizationId: effectiveOrgId || undefined,
    }),
    [page, limit, debouncedSearch, statusFilter, roleFilter, branchFilter, effectiveOrgId],
  );

  const {
    data: usersResponse,
    isLoading: loading,
    isFetching,
    refetch: loadData,
  } = useQuery({
    queryKey: queryKeys.users.list(effectiveOrgId, queryParams),
    queryFn: () => userService.getUsers(queryParams),
    enabled: Boolean(!isSuperAdmin || effectiveOrgId),
    staleTime: 45 * 1000,
    placeholderData: keepPreviousData,
  });

  const users = useMemo(() => {
    if (Array.isArray(usersResponse?.items)) return usersResponse.items;
    if (Array.isArray(usersResponse?.data)) return usersResponse.data;
    if (Array.isArray(usersResponse)) return usersResponse;
    return [];
  }, [usersResponse]);

  // Keep selected user synchronized with query data
  useEffect(() => {
    if (users.length > 0) {
      if (!selectedUser || !users.some((u) => u.id === selectedUser.id)) {
        setSelectedUser(users[0]);
      }
    } else {
      setSelectedUser(null);
    }
  }, [users]);

  // 2. TanStack Query: User Role Details (Lazy-fetched when a user is selected)
  const {
    data: userDetails,
    isLoading: detailsLoading,
  } = useQuery({
    queryKey: queryKeys.users.detail(effectiveOrgId, selectedUser?.id),
    queryFn: () => userService.getUserRoleDetails(selectedUser.id),
    enabled: Boolean(selectedUser?.id),
    staleTime: 60 * 1000,
  });

  // 3. TanStack Query: Available Roles (Cached with long staleTime)
  const { data: rolesResponse } = useQuery({
    queryKey: queryKeys.users.roles(effectiveOrgId),
    queryFn: () => userService.getAvailableRoles(effectiveOrgId),
    enabled: Boolean(!isSuperAdmin || effectiveOrgId),
    staleTime: 5 * 60 * 1000,
  });

  const availableRoles = useMemo(() => {
    if (Array.isArray(rolesResponse?.data)) return rolesResponse.data;
    if (Array.isArray(rolesResponse)) return rolesResponse;
    return [];
  }, [rolesResponse]);

  // 4. TanStack Query: Available Branches (Cached with long staleTime)
  const { data: branchesResponse } = useQuery({
    queryKey: queryKeys.branches.list(effectiveOrgId, {
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    }),
    queryFn: () =>
      fetchBranches(
        effectiveOrgId
          ? { organizationId: effectiveOrgId, limit: 10, sortBy: 'createdAt', sortOrder: 'asc' }
          : { limit: 10, sortBy: 'createdAt', sortOrder: 'asc' },
      ),
    enabled: Boolean(!isSuperAdmin || effectiveOrgId),
    staleTime: 5 * 60 * 1000,
  });

  const availableBranches = useMemo(() => {
    if (Array.isArray(branchesResponse?.data)) return branchesResponse.data;
    if (Array.isArray(branchesResponse?.branches)) return branchesResponse.branches;
    if (Array.isArray(branchesResponse)) return branchesResponse;
    return [];
  }, [branchesResponse]);

  const handleSelectUser = useCallback((u) => {
    setSelectedUser(u);
  }, []);

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  };

  const handleInviteSuccess = async (payload) => {
    const result = await userService.inviteUser(payload);
    invalidateUsers();
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
      invalidateUsers();
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
    invalidateUsers();
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
      }
      invalidateUsers();
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
      invalidateUsers();
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
      invalidateUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to assign role');
    } finally {
      setActionLoading(false);
      setIsAddRoleOpen(false);
    }
  };

  const handleOpenRemoveModal = (role) => {
    setRoleToRemove(role);
    setIsRemoveImpactOpen(true);
  };

  const handleConfirmRoleRemoval = async () => {
    if (!selectedUser || !roleToRemove) return;
    setActionLoading(true);
    const roleId = roleToRemove.roleId || roleToRemove.id;
    try {
      await userService.removeRole(selectedUser.id, roleId);
      toast.success(`Removed role "${roleToRemove.name}"`);
      notifyPermissionUpdate({ userId: selectedUser.id });
      await refreshUser();
      invalidateUsers();
      setIsRemoveImpactOpen(false);
      setRoleToRemove(null);
    } catch (err) {
      toast.error(err.message || 'Failed to remove role');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick KPI metrics from current paginated and total metadata
  const total = usersResponse?.pagination?.totalRecords ?? usersResponse?.total ?? users.length;
  const totalPages = usersResponse?.pagination?.totalPages ?? usersResponse?.totalPages ?? 1;

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
    isFetching,
    loadData,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery: (val) => {
      setSearchQuery(val);
      setPage(1);
    },
    statusFilter,
    setStatusFilter: (val) => {
      setStatusFilter(val);
      setPage(1);
    },
    roleFilter,
    setRoleFilter: (val) => {
      setRoleFilter(val);
      setPage(1);
    },
    branchFilter,
    setBranchFilter: (val) => {
      setBranchFilter(val);
      setPage(1);
    },
    statusFilterOptions,
    roleFilterOptions,
    branchFilterOptions,
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
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
    filteredUsers: users, // Direct server-filtered data
    paginatedTableUsers: users, // Direct server-paginated data (NO local slice!)
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
  const [tokenStatus, setTokenStatus] = useState(null);
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
