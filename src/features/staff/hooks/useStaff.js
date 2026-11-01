import { useState, useEffect, useCallback } from 'react';
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

export function useStaff(initialFilters = {}) {
  const { user } = useAuth();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();
  const { currentBranch } = useBranch();

  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;
  const activeBranchId = currentBranch?.id || '';

  const [staffList, setStaffList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    employmentStatus: '',
    designation: '',
    department: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  const loadStaffList = useCallback(async () => {
    if (!effectiveOrgId) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        organizationId: effectiveOrgId,
        page,
        limit,
        ...filters,
      };

      // Automatically scope by the active branch selected in the Topbar switcher
      if (activeBranchId) {
        params.branchId = activeBranchId;
      }

      const res = await fetchStaffList(params);
      setStaffList(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load staff list:', err);
      setError(err?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [effectiveOrgId, activeBranchId, page, limit, filters]);

  useEffect(() => {
    loadStaffList();
  }, [loadStaffList]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page on filter change
  };

  const createStaff = async (payload) => {
    const res = await apiCreateStaff(payload, effectiveOrgId);
    await loadStaffList();
    return res;
  };

  const updateStaff = async (id, payload) => {
    const res = await apiUpdateStaff(id, payload, effectiveOrgId);
    await loadStaffList();
    return res;
  };

  const updateStatus = async (id, status, reason) => {
    const res = await apiUpdateStaffStatus(id, status, reason, effectiveOrgId);
    await loadStaffList();
    return res;
  };

  const linkUser = async (id, userId) => {
    const res = await apiLinkStaffUser(id, userId, effectiveOrgId);
    await loadStaffList();
    return res;
  };

  const unlinkUser = async (id) => {
    const res = await apiUnlinkStaffUser(id, effectiveOrgId);
    await loadStaffList();
    return res;
  };

  const removeStaff = async (id) => {
    const res = await apiDeleteStaff(id, effectiveOrgId);
    await loadStaffList();
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
