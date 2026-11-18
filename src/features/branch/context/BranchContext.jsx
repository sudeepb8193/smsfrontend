import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBranches } from '../api/branchApi';
import { useAuth } from '../../../hooks/useAuth';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { queryKeys } from '../../../config/queryClient';

export const BranchContext = createContext(null);

export const BranchProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();

  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;

  // Synchronously initialize active branch from localStorage to eliminate premature null-branch state on page reload
  const [currentBranch, setCurrentBranchState] = useState(() => {
    try {
      const savedOrgId = localStorage.getItem('sms_active_organization_id');
      const orgId = isSuperAdmin ? selectedOrganisation?.id || savedOrgId : user?.organizationId;
      const savedBranchObj =
        (orgId ? localStorage.getItem(`sms_active_branch_obj_${orgId}`) : null) ||
        localStorage.getItem('sms_active_branch_obj');
      if (savedBranchObj) {
        return JSON.parse(savedBranchObj);
      }
      const savedBranchId =
        (orgId ? localStorage.getItem(`sms_active_branch_id_${orgId}`) : null) ||
        localStorage.getItem('sms_active_branch_id');
      if (savedBranchId) {
        return { id: savedBranchId };
      }
    } catch (e) {}
    return null;
  });

  // Use centralized TanStack Query with standard limit=10 and 5-min staleTime
  const {
    data: branchRes,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.branches.list(effectiveOrgId, {
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    }),
    queryFn: () =>
      fetchBranches({
        organizationId: effectiveOrgId,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      }),
    enabled: Boolean(isAuthenticated && effectiveOrgId),
    staleTime: 5 * 60 * 1000,
  });

  const branches = useMemo(() => {
    if (Array.isArray(branchRes?.data)) return branchRes.data;
    if (Array.isArray(branchRes?.items)) return branchRes.items;
    if (Array.isArray(branchRes)) return branchRes;
    return [];
  }, [branchRes]);

  const refreshBranches = useCallback(() => {
    return refetch();
  }, [refetch]);

  // Synchronize branch details once full branches list is fetched from backend
  useEffect(() => {
    if (branches.length === 0) return;

    const savedBranchId =
      currentBranch?.id ||
      localStorage.getItem(`sms_active_branch_id_${effectiveOrgId}`) ||
      localStorage.getItem('sms_active_branch_id');
    const matched = branches.find((b) => b.id === savedBranchId);

    if (matched) {
      if (
        !currentBranch?.name ||
        currentBranch.name !== matched.name ||
        currentBranch.status !== matched.status
      ) {
        setCurrentBranchState(matched);
      }
      if (effectiveOrgId) {
        localStorage.setItem(`sms_active_branch_id_${effectiveOrgId}`, matched.id);
        localStorage.setItem(`sms_active_branch_obj_${effectiveOrgId}`, JSON.stringify(matched));
      }
    } else if (branches.length > 0 && !currentBranch?.id) {
      const activeFirst = branches.find((b) => b.status === 'active') || branches[0];
      setCurrentBranchState(activeFirst);
      if (effectiveOrgId) {
        localStorage.setItem(`sms_active_branch_id_${effectiveOrgId}`, activeFirst.id);
        localStorage.setItem(`sms_active_branch_obj_${effectiveOrgId}`, JSON.stringify(activeFirst));
      }
    }
  }, [branches, effectiveOrgId, currentBranch?.id]);

  const setCurrentBranch = useCallback(
    (branchOrId) => {
      if (!branchOrId) {
        setCurrentBranchState(null);
        localStorage.removeItem('sms_active_branch_id');
        localStorage.removeItem('sms_active_branch_obj');
        if (effectiveOrgId) {
          localStorage.removeItem(`sms_active_branch_id_${effectiveOrgId}`);
          localStorage.removeItem(`sms_active_branch_obj_${effectiveOrgId}`);
        }
        return;
      }

      const branchObj =
        typeof branchOrId === 'string'
          ? branches.find((b) => b.id === branchOrId) || { id: branchOrId }
          : branchOrId;

      setCurrentBranchState(branchObj);
      localStorage.setItem('sms_active_branch_id', branchObj.id);
      localStorage.setItem('sms_active_branch_obj', JSON.stringify(branchObj));
      if (effectiveOrgId) {
        localStorage.setItem(`sms_active_branch_id_${effectiveOrgId}`, branchObj.id);
        localStorage.setItem(`sms_active_branch_obj_${effectiveOrgId}`, JSON.stringify(branchObj));
      }
    },
    [branches, effectiveOrgId],
  );

  const value = {
    branches,
    currentBranch,
    loading,
    error: error?.message || null,
    setCurrentBranch,
    refreshBranches,
  };

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};
