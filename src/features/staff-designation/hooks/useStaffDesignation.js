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
import { toast } from '../../../components/shared/Toast';

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
    try {
      await createStaffDesignation(staffId, payload, organizationId);
      toast.success('Designation added successfully.');
      invalidateTab('designations');
    } catch (err) {
      toast.error(err?.message || 'Failed to add designation');
      throw err;
    }
  };

  const updateDesignation = async (designationId, payload) => {
    try {
      await updateStaffDesignation(staffId, designationId, payload, organizationId);
      toast.success('Designation updated successfully.');
      invalidateTab('designations');
    } catch (err) {
      toast.error(err?.message || 'Failed to update designation');
      throw err;
    }
  };

  const setPrimary = async (designationId) => {
    try {
      await setPrimaryStaffDesignation(staffId, designationId, organizationId);
      toast.success('Primary designation updated.');
      invalidateTab('designations');
    } catch (err) {
      toast.error(err?.message || 'Failed to set primary designation');
      throw err;
    }
  };

  const deleteDesignation = async (designationId) => {
    try {
      await deleteStaffDesignation(staffId, designationId, organizationId);
      toast.success('Designation removed.');
      invalidateTab('designations');
    } catch (err) {
      toast.error(err?.message || 'Failed to remove designation');
      throw err;
    }
  };

  // Mutations 6.2 (Skills)
  const addSkill = async (payload) => {
    try {
      await createStaffSkill(staffId, payload, organizationId);
      toast.success('Skill added successfully.');
      invalidateTab('skills');
    } catch (err) {
      toast.error(err?.message || 'Failed to add skill');
      throw err;
    }
  };

  const updateSkill = async (skillId, payload) => {
    try {
      await updateStaffSkill(staffId, skillId, payload, organizationId);
      toast.success('Skill updated successfully.');
      invalidateTab('skills');
    } catch (err) {
      toast.error(err?.message || 'Failed to update skill');
      throw err;
    }
  };

  const verifySkill = async (skillId, note) => {
    try {
      await verifyStaffSkill(staffId, skillId, note, organizationId);
      toast.success('Skill verified.');
      invalidateTab('skills');
    } catch (err) {
      toast.error(err?.message || 'Failed to verify skill');
      throw err;
    }
  };

  const rejectSkill = async (skillId, reason) => {
    try {
      await rejectStaffSkill(staffId, skillId, reason, organizationId);
      toast.info('Skill verification rejected.');
      invalidateTab('skills');
    } catch (err) {
      toast.error(err?.message || 'Failed to reject skill verification');
      throw err;
    }
  };

  const deleteSkill = async (skillId) => {
    try {
      await deleteStaffSkill(staffId, skillId, organizationId);
      toast.success('Skill removed.');
      invalidateTab('skills');
    } catch (err) {
      toast.error(err?.message || 'Failed to remove skill');
      throw err;
    }
  };

  // Mutations 6.3 (Services)
  const assignBulk = async (payload) => {
    try {
      await bulkAssignServicesToStaff(staffId, payload, organizationId);
      toast.success('Services assigned successfully.');
      invalidateTab('services');
      invalidateTab('catalog');
    } catch (err) {
      toast.error(err?.message || 'Failed to assign services');
      throw err;
    }
  };

  const updateAssignment = async (assignmentId, payload) => {
    try {
      await updateAssignedService(staffId, assignmentId, payload, organizationId);
      toast.success('Service assignment updated.');
      invalidateTab('services');
    } catch (err) {
      toast.error(err?.message || 'Failed to update service assignment');
      throw err;
    }
  };

  const unassign = async (assignmentId) => {
    try {
      await unassignServiceFromStaff(staffId, assignmentId, organizationId);
      toast.success('Service unassigned.');
      invalidateTab('services');
      invalidateTab('catalog');
    } catch (err) {
      toast.error(err?.message || 'Failed to unassign service');
      throw err;
    }
  };

  // Mutations 6.4 (Branch Overrides)
  const setBranchOverride = async (staffServiceId, payload) => {
    try {
      await createOrUpdateBranchOverride(staffId, staffServiceId, payload, organizationId);
      toast.success('Branch availability exception saved.');
      invalidateTab('branches');
    } catch (err) {
      toast.error(err?.message || 'Failed to save branch exception');
      throw err;
    }
  };

  const removeBranchOverride = async (staffServiceId, branchId) => {
    try {
      await deleteBranchOverride(staffId, staffServiceId, branchId, organizationId);
      toast.success('Default branch availability restored.');
      invalidateTab('branches');
    } catch (err) {
      toast.error(err?.message || 'Failed to restore default availability');
      throw err;
    }
  };

  // Mutations 6.5 (Commission)
  const setCommissionEligible = async (isEligible) => {
    try {
      await setStaffCommissionEligibility(staffId, isEligible, organizationId);
      toast.success(
        isEligible ? 'Commission eligibility enabled.' : 'Commission eligibility disabled.',
      );
      invalidateTab('commission');
    } catch (err) {
      toast.error(err?.message || 'Failed to update commission eligibility');
      throw err;
    }
  };

  const createCommOverride = async (payload) => {
    try {
      await createCommissionOverride(staffId, payload, organizationId);
      toast.success('Commission override created.');
      invalidateTab('commission');
    } catch (err) {
      toast.error(err?.message || 'Failed to create commission override');
      throw err;
    }
  };

  const updateCommOverride = async (overrideId, payload) => {
    try {
      await updateCommissionOverride(staffId, overrideId, payload, organizationId);
      toast.success('Commission override updated.');
      invalidateTab('commission');
    } catch (err) {
      toast.error(err?.message || 'Failed to update commission override');
      throw err;
    }
  };

  const deleteCommOverride = async (overrideId) => {
    try {
      await deleteCommissionOverride(staffId, overrideId, organizationId);
      toast.success('Commission override deleted.');
      invalidateTab('commission');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete commission override');
      throw err;
    }
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
