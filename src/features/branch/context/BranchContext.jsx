import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchBranches } from '../api/branchApi';
import { useAuth } from '../../../hooks/useAuth';
import { useOrganisation } from '../../organisation/context/OrganisationContext';

export const BranchContext = createContext(null);

export const BranchProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranchState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;

  const refreshBranches = useCallback(async () => {
    if (!isAuthenticated || !effectiveOrgId) {
      setBranches([]);
      setCurrentBranchState(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetchBranches({
        organizationId: effectiveOrgId,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });
      const branchList = res?.data || res || [];
      setBranches(branchList);

      const savedBranchId = localStorage.getItem(`sms_active_branch_id_${effectiveOrgId}`) || localStorage.getItem('sms_active_branch_id');
      const matched = branchList.find((b) => b.id === savedBranchId);

      if (matched) {
        setCurrentBranchState(matched);
      } else if (branchList.length > 0) {
        // Default to first active branch or first available branch
        const activeFirst = branchList.find((b) => b.status === 'active') || branchList[0];
        setCurrentBranchState(activeFirst);
        localStorage.setItem(`sms_active_branch_id_${effectiveOrgId}`, activeFirst.id);
      } else {
        setCurrentBranchState(null);
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
      setError(err?.message || 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, effectiveOrgId]);

  useEffect(() => {
    refreshBranches();
  }, [refreshBranches]);

  const setCurrentBranch = useCallback((branchOrId) => {
    if (!branchOrId) {
      setCurrentBranchState(null);
      localStorage.removeItem('sms_active_branch_id');
      return;
    }

    if (typeof branchOrId === 'string') {
      const found = branches.find((b) => b.id === branchOrId);
      if (found) {
        setCurrentBranchState(found);
        localStorage.setItem('sms_active_branch_id', found.id);
      }
    } else {
      setCurrentBranchState(branchOrId);
      localStorage.setItem('sms_active_branch_id', branchOrId.id);
    }
  }, [branches]);

  const value = {
    branches,
    currentBranch,
    loading,
    error,
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
