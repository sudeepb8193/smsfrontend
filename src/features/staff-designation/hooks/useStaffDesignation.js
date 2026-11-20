import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  fetchStaffDesignations,
  createStaffDesignation,
  updateStaffDesignation,
  setPrimaryStaffDesignation,
  deleteStaffDesignation,
  fetchStaffSkills,
  createStaffSkill,
  updateStaffSkill,
  verifyStaffSkill,
  rejectStaffSkill,
  deleteStaffSkill,
  fetchAssignedServices,
  fetchAvailableCatalogServices,
  bulkAssignServicesToStaff,
  updateAssignedService,
  unassignServiceFromStaff,
  fetchBranchServiceAvailability,
  createOrUpdateBranchOverride,
  deleteBranchOverride,
  fetchStaffCommissionConfiguration,
  setStaffCommissionEligibility,
  createCommissionOverride,
  updateCommissionOverride,
  deleteCommissionOverride,
} from '../api/staffDesignationApi';
import { queryClient, queryKeys } from '../../../config/queryClient';

/**
 * Tab-level lazy fetching and caching for Staff Professional Designation & Services Workspace.
 * Conforms to SMS Production Engineering Standards: tabs are only fetched when activated.
 */
export function useStaffDesignation(staffId, organizationId, activeTab = 'designations') {
  // 1. Tab: Designations
  const isDesignationsActive = activeTab === 'designations' || !activeTab;
  const designationsQuery = useQuery({
    queryKey: queryKeys.staffDesignation.tab('designations', staffId, organizationId),
    queryFn: () => fetchStaffDesignations(staffId, organizationId),
    enabled: Boolean(staffId && organizationId && isDesignationsActive),
    staleTime: 60 * 1000,
  });

  // 2. Tab: Skills & Techniques
  const isSkillsActive = activeTab === 'skills';
  const skillsQuery = useQuery({
    queryKey: queryKeys.staffDesignation.tab('skills', staffId, organizationId),
    queryFn: () => fetchStaffSkills(staffId, organizationId),
    enabled: Boolean(staffId && organizationId && isSkillsActive),
    staleTime: 60 * 1000,
  });

  // 3. Tab: Service Assignments & Available Catalog
  const isServicesActive = activeTab === 'services';
  const servicesQuery = useQuery({
    queryKey: queryKeys.staffDesignation.tab('services', staffId, organizationId),
    queryFn: () => fetchAssignedServices(staffId, organizationId),
    enabled: Boolean(staffId && organizationId && isServicesActive),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const catalogQuery = useQuery({
    queryKey: queryKeys.staffDesignation.tab('catalog', staffId, organizationId, { page: 1, limit: 10 }),
    queryFn: () => fetchAvailableCatalogServices(staffId, { page: 1, limit: 10 }, organizationId),
    enabled: Boolean(staffId && organizationId && isServicesActive),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // 4. Tab: Branch Availability Exceptions
  const isBranchesActive = activeTab === 'branches';
  const branchAvailabilityQuery = useQuery({
    queryKey: queryKeys.staffDesignation.tab('branches', staffId, organizationId),
    queryFn: () => fetchBranchServiceAvailability(staffId, null, organizationId),
    enabled: Boolean(staffId && organizationId && isBranchesActive),
    staleTime: 60 * 1000,
  });

  // 5. Tab: Commission Rules
  const isCommissionActive = activeTab === 'commission';
  const commissionQuery = useQuery({
    queryKey: queryKeys.staffDesignation.tab('commission', staffId, organizationId),
    queryFn: () => fetchStaffCommissionConfiguration(staffId, organizationId),
    enabled: Boolean(staffId && organizationId && isCommissionActive),
    staleTime: 60 * 1000,
  });

  // Consolidated loading & error states scoped to the currently active tab
  const loading = useMemo(() => {
    if (isDesignationsActive) return designationsQuery.isLoading;
    if (isSkillsActive) return skillsQuery.isLoading;
    if (isServicesActive) return servicesQuery.isLoading;
    if (isBranchesActive) return branchAvailabilityQuery.isLoading;
    if (isCommissionActive) return commissionQuery.isLoading;
    return false;
  }, [
    isDesignationsActive,
    isSkillsActive,
    isServicesActive,
    isBranchesActive,
    isCommissionActive,
    designationsQuery.isLoading,
    skillsQuery.isLoading,
    servicesQuery.isLoading,
    branchAvailabilityQuery.isLoading,
    commissionQuery.isLoading,
  ]);

  const error =
    designationsQuery.error ||
    skillsQuery.error ||
    servicesQuery.error ||
    branchAvailabilityQuery.error ||
    commissionQuery.error ||
    null;

  const designationsData = designationsQuery.data || { designations: [], primaryDesignation: null };
  const skillsData = skillsQuery.data || { skills: [], totalSkills: 0, verifiedCount: 0 };
  const servicesData = servicesQuery.data || { assignments: [], totalAssigned: 0, activeCount: 0 };
  const availableCatalog = catalogQuery.data || [];
  const branchAvailabilityData = branchAvailabilityQuery.data || { assignedBranches: [], matrix: [] };
  const commissionData = commissionQuery.data || { isCommissionEligible: true, overrides: [], resolvedServices: [] };

  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.staffDesignation.tab(activeTab, staffId, organizationId),
    });
  };

  // Helper to invalidate queries for a specific tab
  const invalidateTab = (tabName) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.staffDesignation.tab(tabName, staffId, organizationId),
    });
  };

  // Mutations 6.1 (Designations)
  const addDesignation = async (payload) => {
    await createStaffDesignation(staffId, payload, organizationId);
    invalidateTab('designations');
  };

  const updateDesignation = async (designationId, payload) => {
    await updateStaffDesignation(staffId, designationId, payload, organizationId);
    invalidateTab('designations');
  };

  const setPrimary = async (designationId) => {
    await setPrimaryStaffDesignation(staffId, designationId, organizationId);
    invalidateTab('designations');
  };

  const deleteDesignation = async (designationId) => {
    await deleteStaffDesignation(staffId, designationId, organizationId);
    invalidateTab('designations');
  };

  // Mutations 6.2 (Skills)
  const addSkill = async (payload) => {
    await createStaffSkill(staffId, payload, organizationId);
    invalidateTab('skills');
  };

  const updateSkill = async (skillId, payload) => {
    await updateStaffSkill(staffId, skillId, payload, organizationId);
    invalidateTab('skills');
  };

  const verifySkill = async (skillId, note) => {
    await verifyStaffSkill(staffId, skillId, note, organizationId);
    invalidateTab('skills');
  };

  const rejectSkill = async (skillId, reason) => {
    await rejectStaffSkill(staffId, skillId, reason, organizationId);
    invalidateTab('skills');
  };

  const deleteSkill = async (skillId) => {
    await deleteStaffSkill(staffId, skillId, organizationId);
    invalidateTab('skills');
  };

  // Mutations 6.3 (Services)
  const assignBulk = async (payload) => {
    await bulkAssignServicesToStaff(staffId, payload, organizationId);
    invalidateTab('services');
    invalidateTab('catalog');
  };

  const updateAssignment = async (assignmentId, payload) => {
    await updateAssignedService(staffId, assignmentId, payload, organizationId);
    invalidateTab('services');
  };

  const unassign = async (assignmentId) => {
    await unassignServiceFromStaff(staffId, assignmentId, organizationId);
    invalidateTab('services');
    invalidateTab('catalog');
  };

  // Mutations 6.4 (Branch Overrides)
  const setBranchOverride = async (staffServiceId, payload) => {
    await createOrUpdateBranchOverride(staffId, staffServiceId, payload, organizationId);
    invalidateTab('branches');
  };

  const removeBranchOverride = async (staffServiceId, branchId) => {
    await deleteBranchOverride(staffId, staffServiceId, branchId, organizationId);
    invalidateTab('branches');
  };

  // Mutations 6.5 (Commission)
  const setCommissionEligible = async (isEligible) => {
    await setStaffCommissionEligibility(staffId, isEligible, organizationId);
    invalidateTab('commission');
  };

  const createCommOverride = async (payload) => {
    await createCommissionOverride(staffId, payload, organizationId);
    invalidateTab('commission');
  };

  const updateCommOverride = async (overrideId, payload) => {
    await updateCommissionOverride(staffId, overrideId, payload, organizationId);
    invalidateTab('commission');
  };

  const deleteCommOverride = async (overrideId) => {
    await deleteCommissionOverride(staffId, overrideId, organizationId);
    invalidateTab('commission');
  };

  return {
    loading,
    error,
    refresh,
    designationsData,
    skillsData,
    servicesData,
    availableCatalog,
    branchAvailabilityData,
    commissionData,
    // Actions
    addDesignation,
    updateDesignation,
    setPrimary,
    deleteDesignation,
    addSkill,
    updateSkill,
    verifySkill,
    rejectSkill,
    deleteSkill,
    assignBulk,
    updateAssignment,
    unassign,
    setBranchOverride,
    removeBranchOverride,
    setCommissionEligible,
    createCommOverride,
    updateCommOverride,
    deleteCommOverride,
  };
}
