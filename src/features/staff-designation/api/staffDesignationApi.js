import { apiClient } from '../../../services/apiClient';

/**
 * Module 06: Staff Designation & Service Assignment API Service
 */

function buildQuery(orgId, additionalParams = {}) {
  const query = new URLSearchParams();
  if (orgId) query.append('organizationId', orgId);
  Object.entries(additionalParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, v);
    }
  });
  const qStr = query.toString();
  return qStr ? `?${qStr}` : '';
}

// =========================================================================
// TASK 6.1: SERVICE PROVIDER DESIGNATIONS
// =========================================================================

export async function fetchStaffDesignations(staffId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/designations${q}`);
  return res?.data || res;
}

export async function createStaffDesignation(staffId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/designations${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateStaffDesignation(staffId, designationId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/designations/${designationId}${q}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function setPrimaryStaffDesignation(staffId, designationId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/designations/${designationId}/set-primary${q}`, {
    method: 'PATCH',
  });
  return res?.data || res;
}

export async function deleteStaffDesignation(staffId, designationId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/designations/${designationId}${q}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// =========================================================================
// TASK 6.2: SKILL PROFICIENCY & SPECIALIZATION
// =========================================================================

export async function fetchStaffSkills(staffId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/skills${q}`);
  return res?.data || res;
}

export async function createStaffSkill(staffId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/skills${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateStaffSkill(staffId, skillId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/skills/${skillId}${q}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function verifyStaffSkill(staffId, skillId, note, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/skills/${skillId}/verify${q}`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
  return res?.data || res;
}

export async function rejectStaffSkill(staffId, skillId, reason, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/skills/${skillId}/reject${q}`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  return res?.data || res;
}

export async function deleteStaffSkill(staffId, skillId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/skills/${skillId}${q}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// =========================================================================
// TASK 6.3: SERVICE ASSIGNMENT
// =========================================================================

export async function fetchAssignedServices(staffId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/services${q}`);
  return res?.data || res;
}

export async function fetchAvailableCatalogServices(staffId, params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/staff/${staffId}/available-services${q}`);
  return res?.data || res;
}

export async function assignServiceToStaff(staffId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/services${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function bulkAssignServicesToStaff(staffId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/services/bulk${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateAssignedService(staffId, assignmentId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/services/${assignmentId}${q}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function unassignServiceFromStaff(staffId, assignmentId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/services/${assignmentId}${q}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// =========================================================================
// TASK 6.4: BRANCH-WISE SERVICE AVAILABILITY
// =========================================================================

export async function fetchBranchServiceAvailability(staffId, staffServiceId, organizationId) {
  const q = buildQuery(organizationId, { staffServiceId });
  const res = await apiClient.request(`/staff/${staffId}/branch-availability${q}`);
  return res?.data || res;
}

export async function createOrUpdateBranchOverride(staffId, staffServiceId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/services/${staffServiceId}/branch-overrides${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function deleteBranchOverride(staffId, staffServiceId, branchId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/services/${staffServiceId}/branch-overrides/${branchId}${q}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// =========================================================================
// TASK 6.5: COMMISSION ELIGIBILITY & RATE OVERRIDE
// =========================================================================

export async function fetchStaffCommissionConfiguration(staffId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/commission${q}`);
  return res?.data || res;
}

export async function setStaffCommissionEligibility(staffId, isCommissionEligible, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/commission/eligibility${q}`, {
    method: 'PATCH',
    body: JSON.stringify({ isCommissionEligible }),
  });
  return res?.data || res;
}

export async function createCommissionOverride(staffId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/commission/overrides${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateCommissionOverride(staffId, overrideId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/commission/overrides/${overrideId}${q}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function deleteCommissionOverride(staffId, overrideId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/staff/${staffId}/commission/overrides/${overrideId}${q}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

