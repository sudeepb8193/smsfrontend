import { useState, useEffect, useCallback } from 'react';
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

export function useStaffDesignation(staffId, organizationId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task 6.1 State
  const [designationsData, setDesignationsData] = useState({
    designations: [],
    primaryDesignation: null,
  });

  // Task 6.2 State
  const [skillsData, setSkillsData] = useState({
    skills: [],
    totalSkills: 0,
    verifiedCount: 0,
  });

  // Task 6.3 State
  const [servicesData, setServicesData] = useState({
    assignments: [],
    totalAssigned: 0,
    activeCount: 0,
  });
  const [availableCatalog, setAvailableCatalog] = useState([]);

  // Task 6.4 State
  const [branchAvailabilityData, setBranchAvailabilityData] = useState({
    assignedBranches: [],
    matrix: [],
  });

  // Task 6.5 State
  const [commissionData, setCommissionData] = useState({
    isCommissionEligible: true,
    overrides: [],
    resolvedServices: [],
  });

  const loadAll = useCallback(async () => {
    if (!staffId || !organizationId) return;

    try {
      setLoading(true);
      setError(null);

      const [desRes, skillRes, srvRes, catRes, branchRes, commRes] =
        await Promise.allSettled([
          fetchStaffDesignations(staffId, organizationId),
          fetchStaffSkills(staffId, organizationId),
          fetchAssignedServices(staffId, organizationId),
          fetchAvailableCatalogServices(staffId, {}, organizationId),
          fetchBranchServiceAvailability(staffId, null, organizationId),
          fetchStaffCommissionConfiguration(staffId, organizationId),
        ]);

      if (desRes.status === 'fulfilled') {
        setDesignationsData(desRes.value);
      }
      if (skillRes.status === 'fulfilled') {
        setSkillsData(skillRes.value);
      }
      if (srvRes.status === 'fulfilled') {
        setServicesData(srvRes.value);
      }
      if (catRes.status === 'fulfilled') {
        setAvailableCatalog(catRes.value);
      }
      if (branchRes.status === 'fulfilled') {
        setBranchAvailabilityData(branchRes.value);
      }
      if (commRes.status === 'fulfilled') {
        setCommissionData(commRes.value);
      }
    } catch (err) {
      console.error('Failed to load staff designation and service assignment data:', err);
      setError(err?.message || 'Failed to load employee configuration');
    } finally {
      setLoading(false);
    }
  }, [staffId, organizationId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Mutations 6.1
  const addDesignation = async (payload) => {
    await createStaffDesignation(staffId, payload, organizationId);
    await loadAll();
  };

  const updateDesignation = async (designationId, payload) => {
    await updateStaffDesignation(staffId, designationId, payload, organizationId);
    await loadAll();
  };

  const setPrimary = async (designationId) => {
    await setPrimaryStaffDesignation(staffId, designationId, organizationId);
    await loadAll();
  };

  const deleteDesignation = async (designationId) => {
    await deleteStaffDesignation(staffId, designationId, organizationId);
    await loadAll();
  };

  // Mutations 6.2
  const addSkill = async (payload) => {
    await createStaffSkill(staffId, payload, organizationId);
    await loadAll();
  };

  const updateSkill = async (skillId, payload) => {
    await updateStaffSkill(staffId, skillId, payload, organizationId);
    await loadAll();
  };

  const verifySkill = async (skillId, note) => {
    await verifyStaffSkill(staffId, skillId, note, organizationId);
    await loadAll();
  };

  const rejectSkill = async (skillId, reason) => {
    await rejectStaffSkill(staffId, skillId, reason, organizationId);
    await loadAll();
  };

  const deleteSkill = async (skillId) => {
    await deleteStaffSkill(staffId, skillId, organizationId);
    await loadAll();
  };

  // Mutations 6.3
  const assignBulk = async (payload) => {
    await bulkAssignServicesToStaff(staffId, payload, organizationId);
    await loadAll();
  };

  const updateAssignment = async (assignmentId, payload) => {
    await updateAssignedService(staffId, assignmentId, payload, organizationId);
    await loadAll();
  };

  const unassign = async (assignmentId) => {
    await unassignServiceFromStaff(staffId, assignmentId, organizationId);
    await loadAll();
  };

  // Mutations 6.4
  const setBranchOverride = async (staffServiceId, payload) => {
    await createOrUpdateBranchOverride(staffId, staffServiceId, payload, organizationId);
    await loadAll();
  };

  const removeBranchOverride = async (staffServiceId, branchId) => {
    await deleteBranchOverride(staffId, staffServiceId, branchId, organizationId);
    await loadAll();
  };

  // Mutations 6.5
  const setCommissionEligible = async (isEligible) => {
    await setStaffCommissionEligibility(staffId, isEligible, organizationId);
    await loadAll();
  };

  const createCommOverride = async (payload) => {
    await createCommissionOverride(staffId, payload, organizationId);
    await loadAll();
  };

  const updateCommOverride = async (overrideId, payload) => {
    await updateCommissionOverride(staffId, overrideId, payload, organizationId);
    await loadAll();
  };

  const deleteCommOverride = async (overrideId) => {
    await deleteCommissionOverride(staffId, overrideId, organizationId);
    await loadAll();
  };

  return {
    loading,
    error,
    refresh: loadAll,
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

