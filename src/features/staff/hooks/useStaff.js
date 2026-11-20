import { useState, useMemo, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  fetchStaffList,
  fetchStaffById,
  createStaff as apiCreateStaff,
  updateStaff as apiUpdateStaff,
  updateStaffStatus as apiUpdateStaffStatus,
  linkStaffUser as apiLinkStaffUser,
  unlinkStaffUser as apiUnlinkStaffUser,
  deleteStaff as apiDeleteStaff,
  suggestEmployeeCode,
} from '../api/staffApi';
import { useAuth } from '../../../hooks/useAuth';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { useBranch } from '../../branch/hooks/useBranch';
import { useDebounce } from '../../../hooks/useDebounce';
import { queryClient, queryKeys } from '../../../config/queryClient';

export function useStaff(initialFilters = {}, options = {}) {
  const { user } = useAuth();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();
  const { currentBranch, loading: branchLoading } = useBranch();

  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;
  const activeBranchId =
    initialFilters.branchId ||
    currentBranch?.id ||
    (effectiveOrgId ? localStorage.getItem(`sms_active_branch_id_${effectiveOrgId}`) : null) ||
    localStorage.getItem('sms_active_branch_id') ||
    '';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [filters, setFilters] = useState({
    search: '',
    employmentStatus: '',
    designation: '',
    department: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  const debouncedSearch = useDebounce(filters.search, 350);

  // Construct parameter payload for query key and API request
  const queryParams = useMemo(
    () => ({
      organizationId: effectiveOrgId,
      branchId: activeBranchId || undefined,
      page,
      limit,
      ...filters,
      search: debouncedSearch ? debouncedSearch.trim() : undefined,
    }),
    [effectiveOrgId, activeBranchId, page, limit, filters, debouncedSearch],
  );

  // Prevent firing without branchId while BranchProvider is still resolving the initial active branch
  const isBranchResolving = branchLoading && !activeBranchId;
  const isQueryEnabled = options.enabled !== undefined ? options.enabled : true;

  // TanStack Query: Cached, deduplicated, and server-paginated staff list
  const {
    data: staffResponse,
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch: loadStaffList,
  } = useQuery({
    queryKey: queryKeys.staff.list(effectiveOrgId, activeBranchId, queryParams),
    queryFn: () => fetchStaffList(queryParams),
    enabled: Boolean(effectiveOrgId && !isBranchResolving && isQueryEnabled),
    staleTime: 60 * 1000, // 1 minute fresh cache
    placeholderData: keepPreviousData,
  });

  const staffList = useMemo(() => {
    if (Array.isArray(staffResponse?.items)) return staffResponse.items;
    if (Array.isArray(staffResponse?.data)) return staffResponse.data;
    if (Array.isArray(staffResponse)) return staffResponse;
    return [];
  }, [staffResponse]);

  const total = staffResponse?.pagination?.totalRecords ?? staffResponse?.total ?? staffList.length;
  const totalPages =
    staffResponse?.pagination?.totalPages ??
    staffResponse?.totalPages ??
    (limit > 0 ? Math.ceil(total / limit) : 1);

  const error = queryError ? queryError.message || 'Failed to load employees' : null;

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page on filter change
  };

  const invalidateStaff = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
  };

  const createStaff = async (payload) => {
    const res = await apiCreateStaff(payload, effectiveOrgId);
    invalidateStaff();
    return res;
  };

  const updateStaff = async (id, payload) => {
    const res = await apiUpdateStaff(id, payload, effectiveOrgId);
    invalidateStaff();
    return res;
  };

  const updateStatus = async (id, status, reason) => {
    const res = await apiUpdateStaffStatus(id, status, reason, effectiveOrgId);
    invalidateStaff();
    return res;
  };

  const linkUser = async (id, userId) => {
    const res = await apiLinkStaffUser(id, userId, effectiveOrgId);
    invalidateStaff();
    return res;
  };

  const unlinkUser = async (id) => {
    const res = await apiUnlinkStaffUser(id, effectiveOrgId);
    invalidateStaff();
    return res;
  };

  const removeStaff = async (id) => {
    const res = await apiDeleteStaff(id, effectiveOrgId);
    invalidateStaff();
    return res;
  };

  return {
    staffList,
    total,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    loading,
    isFetching,
    error,
    filters,
    updateFilters,
    loadStaffList,
    createStaff,
    updateStaff,
    updateStatus,
    linkUser,
    unlinkUser,
    removeStaff,
    effectiveOrgId,
    currentBranch,
  };
}

export default useStaff;
