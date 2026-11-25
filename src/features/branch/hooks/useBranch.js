import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  fetchBranches,
  fetchBranchDetails,
  createBranch,
  updateBranch,
} from '../api/branchApi';
import { useBranch as useBranchContext } from '../context/BranchContext';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { useDebounce } from '../../../hooks/useDebounce';
import { queryClient, queryKeys } from '../../../config/queryClient';
import { toast } from '../../../components/shared/Toast';

/**
 * 1. State Management Hook for Branch List Page
 */
export const useBranchList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canView, canCreate, canEdit, canDelete } = usePermission();
  const { currentBranch, refreshBranches } = useBranchContext();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();

  const userRole = String(
    user?.roleSlug || user?.role || user?.roleName || '',
  ).toLowerCase().replace(/_/g, '-');
  const userIsSuperAdmin = userRole === 'super-admin' || isSuperAdmin;
  const isOwner = userRole === 'owner';

  const canViewBranch = userIsSuperAdmin || canView('branches');
  const canCreateBranch = userIsSuperAdmin || canCreate('branches');
  const canEditBranch = userIsSuperAdmin || canEdit('branches');
  const canDeleteBranch = userIsSuperAdmin || canDelete('branches');

  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;

  // Filters State
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals & Menu State
  const [deleteModalBranch, setDeleteModalBranch] = useState(null);
  const [copyModalBranch, setCopyModalBranch] = useState(null);
  const [activeMenuBranchId, setActiveMenuBranchId] = useState(null);
  const tableMenuRef = useRef(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    if (!activeMenuBranchId) return;
    const handleOutsideClick = (e) => {
      if (tableMenuRef.current && !tableMenuRef.current.contains(e.target)) {
        setActiveMenuBranchId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeMenuBranchId]);

  // Construct query params
  const queryParams = useMemo(
    () => ({
      organizationId: effectiveOrgId,
      search: debouncedSearch ? debouncedSearch.trim() : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      branchType: typeFilter !== 'all' ? typeFilter : undefined,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    [effectiveOrgId, debouncedSearch, statusFilter, typeFilter, page, limit, sortBy, sortOrder],
  );

  const shouldFetch = canViewBranch && (!isSuperAdmin || Boolean(effectiveOrgId));

  const {
    data: branchResponse,
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch: loadData,
  } = useQuery({
    queryKey: queryKeys.branches.list(effectiveOrgId, queryParams),
    queryFn: () => fetchBranches(queryParams),
    enabled: Boolean(shouldFetch),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const branchesData = useMemo(() => {
    if (Array.isArray(branchResponse?.data)) return branchResponse.data;
    if (Array.isArray(branchResponse?.items)) return branchResponse.items;
    if (Array.isArray(branchResponse)) return branchResponse;
    return [];
  }, [branchResponse]);

  const total = branchResponse?.pagination?.totalRecords ?? branchResponse?.meta?.total ?? branchResponse?.total ?? branchesData.length;
  const totalPages =
    branchResponse?.pagination?.totalPages ??
    branchResponse?.meta?.totalPages ??
    (limit > 0 ? Math.ceil(total / limit) : 1);

  const meta = useMemo(
    () => ({
      total,
      totalPages: totalPages || 1,
      page,
      limit,
    }),
    [total, totalPages, page, limit],
  );

  const error = queryError ? queryError.message || 'Failed to fetch salon branches' : null;

  const handleRefresh = async () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
    await refreshBranches();
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
    setPage(1);
  };

  const handleSortChange = (combinedValue) => {
    const [field, order] = combinedValue.split(':');
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const handleCreateBranchNavigate = () => {
    navigate('/branches/create');
  };

  const handleBranchDetailsNavigate = (branchId) => {
    navigate(`/branches/${branchId}`);
  };

  const handleBranchEditNavigate = (branchId) => {
    navigate(`/branches/${branchId}/edit`);
  };

  return {
    // Data & Async
    branchesData,
    meta,
    loading,
    isFetching,
    error,
    loadData,
    handleRefresh,

    // Filters & Pagination
    search,
    statusFilter,
    typeFilter,
    sortBy,
    sortOrder,
    viewMode,
    page,
    limit,
    setViewMode,
    setPage,
    setLimit,
    handleSearchChange,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handleSortChange,
    handleResetFilters,

    // Permissions & Context
    isOwner,
    canViewBranch,
    canCreateBranch,
    canEditBranch,
    canDeleteBranch,
    canEdit,
    canDelete,
    currentBranch,
    isSuperAdmin,
    effectiveOrgId,

    // Modals & Menu
    deleteModalBranch,
    setDeleteModalBranch,
    copyModalBranch,
    setCopyModalBranch,
    activeMenuBranchId,
    setActiveMenuBranchId,
    tableMenuRef,

    // Navigation
    handleCreateBranchNavigate,
    handleBranchDetailsNavigate,
    handleBranchEditNavigate,
  };
};

/**
 * 2. State Management Hook for Branch Create Page
 */
export const useBranchCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canCreate } = usePermission();
  const { isSuperAdmin } = useOrganisation();
  const { refreshBranches, setCurrentBranch } = useBranchContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRole = String(
    user?.roleSlug || user?.role || user?.roleName || '',
  ).toLowerCase().replace(/_/g, '-');
  const userIsSuperAdmin = userRole === 'super-admin' || isSuperAdmin;
  const canCreateBranch = userIsSuperAdmin || canCreate('branches');

  const handleCreate = async (payload, isDraftExit) => {
    try {
      setIsSubmitting(true);
      const res = await createBranch(payload);
      const newBranch = res?.data || res;

      await refreshBranches();
      if (newBranch?.id) {
        setCurrentBranch(newBranch);
      }

      if (isDraftExit) {
        toast.success(`Draft branch "${newBranch.name}" created and saved.`);
      } else {
        toast.success(`Branch "${newBranch.name}" (${newBranch.code}) created successfully.`);
      }
      navigate('/branches');
    } catch (err) {
      console.error('Branch creation error:', err);
      toast.error(err?.message || 'Failed to create branch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/branches');
  };

  return {
    canCreateBranch,
    isSubmitting,
    handleCreate,
    handleCancel,
  };
};

/**
 * 3. State Management Hook for Branch Edit Page
 */
export const useBranchEdit = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canEdit } = usePermission();
  const { isSuperAdmin } = useOrganisation();
  const { refreshBranches } = useBranchContext();

  const userRole = String(
    user?.roleSlug || user?.role || user?.roleName || '',
  ).toLowerCase().replace(/_/g, '-');
  const userIsSuperAdmin = userRole === 'super-admin' || isSuperAdmin;
  const canEditBranch = userIsSuperAdmin || canEdit('branches', branchId);

  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchBranchDetails(branchId);
        setBranch(res?.data || res);
      } catch (err) {
        console.error('Failed to load branch for editing:', err);
        setError(err?.message || 'Branch not found or inaccessible');
      } finally {
        setLoading(false);
      }
    };
    if (branchId) {
      load();
    }
  }, [branchId]);

  const handleUpdate = async (payload) => {
    try {
      setIsSubmitting(true);
      const res = await updateBranch(branchId, payload);
      const updated = res?.data || res;
      toast.success(`Branch "${updated.name}" updated successfully.`);
      await refreshBranches();
      navigate(`/branches/${branchId}`);
    } catch (err) {
      console.error('Branch update error:', err);
      toast.error(err?.message || 'Failed to update branch profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/branches/${branchId}`);
  };

  const handleBackToBranches = () => {
    navigate('/branches');
  };

  return {
    branchId,
    branch,
    loading,
    isSubmitting,
    error,
    canEditBranch,
    handleUpdate,
    handleCancel,
    handleBackToBranches,
  };
};

/**
 * 4. State Management Hook for Branch Details Page
 */
export const useBranchDetails = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canView, canEdit, canDelete } = usePermission();
  const { currentBranch, setCurrentBranch, refreshBranches } = useBranchContext();

  const userRole = String(
    user?.roleSlug || user?.role || user?.roleName || '',
  ).toLowerCase().replace(/_/g, '-');
  const userIsSuperAdmin = userRole === 'super-admin';
  const isOwner = userRole === 'owner';
  const canViewBranch = userIsSuperAdmin || canView('branches', branchId);
  const canEditBranch = userIsSuperAdmin || canEdit('branches', branchId);
  const canDeleteBranch = userIsSuperAdmin || canDelete('branches', branchId);

  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  const isCurrentActive = currentBranch?.id === branch?.id;

  const loadBranch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchBranchDetails(branchId);
      setBranch(res?.data || res);
    } catch (err) {
      console.error('Failed to load branch details:', err);
      setError(err?.message || 'Branch not found or inaccessible');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    if (branchId) {
      loadBranch();
    }
  }, [branchId, loadBranch]);

  const handleStatusChange = async (newStatus) => {
    if (!branch?.id) return;
    try {
      setStatusUpdating(true);
      await updateBranch(branch.id, { status: newStatus });
      toast.success(`Branch status updated to ${newStatus.replace('_', ' ')}.`);
      await loadBranch();
      await refreshBranches();
    } catch (err) {
      toast.error(err?.message || 'Failed to update branch status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSetActiveContext = () => {
    if (!branch) return;
    setCurrentBranch(branch);
    toast.success(`Active context switched to "${branch.name}".`);
  };

  const handleBackToBranches = () => {
    navigate('/branches');
  };

  const handleNavigateToEdit = () => {
    if (branch?.id) {
      navigate(`/branches/${branch.id}/edit`);
    }
  };

  const handleDeleteSuccess = async () => {
    await refreshBranches();
    navigate('/branches');
  };

  const handleCopySuccess = async () => {
    await loadBranch();
    await refreshBranches();
  };

  return {
    branchId,
    branch,
    loading,
    error,
    statusUpdating,
    isCurrentActive,
    isOwner,
    canViewBranch,
    canEditBranch,
    canDeleteBranch,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isCopyModalOpen,
    setIsCopyModalOpen,
    loadBranch,
    handleStatusChange,
    handleSetActiveContext,
    handleBackToBranches,
    handleNavigateToEdit,
    handleDeleteSuccess,
    handleCopySuccess,
  };
};

export { useBranch } from '../context/BranchContext';

export default {
  useBranchList,
  useBranchCreate,
  useBranchEdit,
  useBranchDetails,
};

