import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchOrganisations } from '../api/organisationApi';
import { useAuth } from '../../../hooks/useAuth';

export const OrganisationContext = createContext(null);

export const OrganisationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [organisations, setOrganisations] = useState([]);
  const [selectedOrganisation, setSelectedOrganisationState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userRole = String(
    user?.roleSlug || user?.role || user?.roleName || '',
  ).toLowerCase().replace(/_/g, '-');
  const isSuperAdmin = userRole === 'super-admin';

  const refreshOrganisations = useCallback(async () => {
    if (!isAuthenticated || !isSuperAdmin) {
      setOrganisations([]);
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

    try {
      setLoading(true);
      setError(null);
      const res = await fetchOrganisations({ limit: 100, sortBy: 'name', sortOrder: 'asc' });
      const orgList = res?.data || res || [];
      setOrganisations(orgList);

      const savedOrgId = localStorage.getItem('sms_active_organization_id');
      const matched = orgList.find((org) => org.id === savedOrgId);

      if (matched) {
        setSelectedOrganisationState(matched);
      } else if (orgList.length > 0) {
        const activeFirst = orgList.find((org) => org.status === 'active') || orgList[0];
        setSelectedOrganisationState(activeFirst);
        localStorage.setItem('sms_active_organization_id', activeFirst.id);
      } else {
        setSelectedOrganisationState(null);
      }
    } catch (err) {
      console.error('Failed to load organisations for Super Admin:', err);
      setError(err?.message || 'Failed to load organisations');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isSuperAdmin, user?.organizationId, user?.organizationName]);

  useEffect(() => {
    refreshOrganisations();
  }, [refreshOrganisations]);

  const setSelectedOrganisation = useCallback(
    (orgOrId) => {
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
    error,
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
