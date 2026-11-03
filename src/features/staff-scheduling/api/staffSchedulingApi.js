import { apiClient } from '../../../services/apiClient';

/**
 * Module 07: Staff Scheduling API Service
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
// TASK 7.1: SHIFT TEMPLATES
// =========================================================================

export async function fetchShiftTemplates(params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/scheduling/templates${q}`);
  return res?.data || res;
}

export async function fetchShiftTemplateById(templateId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/templates/${templateId}${q}`);
  return res?.data || res;
}

export async function createShiftTemplate(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/templates${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateShiftTemplate(templateId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/templates/${templateId}${q}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function retireShiftTemplate(templateId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/templates/${templateId}/retire${q}`, {
    method: 'PATCH',
  });
  return res?.data || res;
}

export async function reactivateShiftTemplate(templateId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/templates/${templateId}/reactivate${q}`, {
    method: 'PATCH',
  });
  return res?.data || res;
}

export async function deleteShiftTemplate(templateId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/templates/${templateId}${q}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// =========================================================================
// TASK 7.2: WEEKLY SCHEDULES & DAYS OFF
// =========================================================================

export async function fetchStaffWeeklySchedule(staffId, date, organizationId) {
  const q = buildQuery(organizationId, { date });
  const res = await apiClient.request(`/scheduling/weekly/staff/${staffId}${q}`);
  return res?.data || res;
}

export async function fetchBranchTeamSchedule(branchId, weekStartDate, organizationId) {
  const q = buildQuery(organizationId, { branchId, weekStartDate });
  const res = await apiClient.request(`/scheduling/weekly/team${q}`);
  return res?.data || res;
}

export async function saveWeeklySchedule(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/weekly${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function copyWeeklySchedule(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/weekly/copy${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

// =========================================================================
// TASK 7.3: AVAILABILITY PREFERENCES
// =========================================================================

export async function fetchAvailabilityPreferences(params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/scheduling/preferences${q}`);
  return res?.data || res;
}

export async function createAvailabilityPreference(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/preferences${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateAvailabilityPreference(preferenceId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/preferences/${preferenceId}${q}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function deleteAvailabilityPreference(preferenceId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/preferences/${preferenceId}${q}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

export async function checkSchedulingConflict(params, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/scheduling/preferences/check-conflict${q}`);
  return res?.data || res;
}

// =========================================================================
// TASK 7.4: SCHEDULE OVERRIDES & SHIFT SWAPS
// =========================================================================

export async function fetchScheduleOverrides(params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/scheduling/overrides${q}`);
  return res?.data || res;
}

export async function createScheduleOverride(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/overrides${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function createShiftSwap(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/overrides/swap${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function reviewScheduleOverride(overrideId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/overrides/${overrideId}/review${q}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function cancelScheduleOverride(overrideId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/overrides/${overrideId}${q}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// =========================================================================
// TASK 7.5: BLOCKED TIME
// =========================================================================

export async function fetchBlockedTimes(params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/scheduling/blocked-time${q}`);
  return res?.data || res;
}

export async function createBlockedTime(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/blocked-time${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function bulkCreateBlockedTime(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/blocked-time/bulk${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function cancelBlockedTime(blockId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/scheduling/blocked-time/${blockId}${q}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// =========================================================================
// WORKSPACE OVERVIEW & AVAILABILITY ENGINE
// =========================================================================

export async function fetchSchedulingOverview(params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/scheduling/overview${q}`);
  return res?.data || res;
}

export async function fetchStaffAvailability(staffId, params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/scheduling/availability/staff/${staffId}${q}`);
  return res?.data || res;
}

export async function fetchBranchAvailability(branchId, params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/scheduling/availability/branch/${branchId}${q}`);
  return res?.data || res;
}

