import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOrganisations } from '../api/organisationApi';
import { useAuth } from '../../../hooks/useAuth';
import { clearTenantCache, queryKeys } from '../../../config/queryClient';

export const OrganisationContext = createContext(null);

export const OrganisationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedOrganisation, setSelectedOrganisationState] = useState(null);

  const userRole = String(
    user?.roleSlug || user?.role || user?.roleName || '',
  ).toLowerCase().replace(/_/g, '-');
  const isSuperAdmin = userRole === 'super-admin';

  // Use centralized TanStack Query with standard limit=10 and 5-min staleTime
  const {
    data: orgsRes,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.organisations.list({ limit: 10, sortBy: 'name', sortOrder: 'asc' }),
    queryFn: () => fetchOrganisations({ limit: 10, sortBy: 'name', sortOrder: 'asc' }),
    enabled: Boolean(isAuthenticated && isSuperAdmin),
    staleTime: 5 * 60 * 1000,
  });

  const organisations = useMemo(() => {
    if (!isAuthenticated || !isSuperAdmin) return [];
    if (Array.isArray(orgsRes?.data)) return orgsRes.data;
    if (Array.isArray(orgsRes?.items)) return orgsRes.items;
    if (Array.isArray(orgsRes)) return orgsRes;
    return [];
  }, [isAuthenticated, isSuperAdmin, orgsRes]);

  const refreshOrganisations = useCallback(() => {
    return refetch();
  }, [refetch]);

  useEffect(() => {
    if (!isSuperAdmin) {
      if (user?.organizationId) {
        setSelectedOrganisationState({
          id: user.organizationId,
          name: user.organizationName || 'Current Organization',
        });
      } else {
        setSelectedOrganisationState(null);
      }
      return;
    }

    if (organisations.length > 0) {
      const savedOrgId = localStorage.getItem('sms_active_organization_id');
      const matched = organisations.find((org) => org.id === savedOrgId);

      if (matched) {
        setSelectedOrganisationState(matched);
      } else {
        const activeFirst = organisations.find((org) => org.status === 'active') || organisations[0];
        setSelectedOrganisationState(activeFirst);
        localStorage.setItem('sms_active_organization_id', activeFirst.id);
      }
    }
  }, [isSuperAdmin, user?.organizationId, user?.organizationName, organisations]);

  const setSelectedOrganisation = useCallback(
    (orgOrId) => {
      clearTenantCache();
      if (!orgOrId) {
        setSelectedOrganisationState(null);
        localStorage.removeItem('sms_active_organization_id');
        return;
      }

      if (typeof orgOrId === 'string') {
        const found = organisations.find((org) => org.id === orgOrId);
        if (found) {
          setSelectedOrganisationState(found);
          localStorage.setItem('sms_active_organization_id', found.id);
        } else {
          // If not yet in list, store minimal object
          setSelectedOrganisationState({ id: orgOrId, name: 'Selected Organization' });
          localStorage.setItem('sms_active_organization_id', orgOrId);
        }
      } else {
        setSelectedOrganisationState(orgOrId);
        localStorage.setItem('sms_active_organization_id', orgOrId.id);
      }
    },
    [organisations],
  );

  const value = {
    organisations,
    selectedOrganisation,
    isSuperAdmin,
    loading,
    error: error?.message || null,
    setSelectedOrganisation,
    refreshOrganisations,
  };

  return <OrganisationContext.Provider value={value}>{children}</OrganisationContext.Provider>;
};

export const useOrganisation = () => {
  const context = useContext(OrganisationContext);
  if (!context) {
    throw new Error('useOrganisation must be used within an OrganisationProvider');
  }
  return context;
};

export default OrganisationContext;
