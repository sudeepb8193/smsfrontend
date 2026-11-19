import { apiClient } from '../../../services/apiClient';

/**
 * Module 08: Staff Attendance API Client
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
// TASK 8.1: PUNCHING & DAILY ATTENDANCE
// =========================================================================

export async function checkInStaff(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/attendance/check-in${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function checkOutStaff(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/attendance/check-out${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function punchKiosk(payload) {
  const res = await apiClient.request('/attendance/kiosk/punch', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function submitManualAttendance(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/attendance/manual${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function fetchDailyAttendance(params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/attendance/daily${q}`);
  return res?.data || res;
}

export async function fetchCurrentlyCheckedIn(branchId, organizationId) {
  const q = buildQuery(organizationId, { branchId });
  const res = await apiClient.request(`/attendance/currently-checked-in${q}`);
  return res?.data || res;
}

export async function fetchMyAttendance(params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/attendance/me${q}`);
  return res?.data || res;
}

// =========================================================================
// TASK 8.2: ATTENDANCE POLICIES
// =========================================================================

export async function fetchEffectivePolicy(branchId, organizationId) {
  const q = buildQuery(organizationId, { branchId });
  const res = await apiClient.request(`/attendance/policies/effective${q}`);
  return res?.data || res;
}

export async function saveOrganizationPolicy(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/attendance/policies/organization${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function saveBranchPolicy(branchId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/attendance/policies/branch/${branchId}${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function deleteBranchPolicy(branchId, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/attendance/policies/branch/${branchId}${q}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// =========================================================================
// TASK 8.3: ATTENDANCE CORRECTIONS
// =========================================================================

export async function submitCorrectionRequest(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/attendance/corrections/request${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function fetchPendingCorrections(params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/attendance/corrections/pending${q}`);
  return res?.data || res;
}

export async function fetchMyCorrections(params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/attendance/corrections/my${q}`);
  return res?.data || res;
}

export async function approveCorrection(correctionId, payload = {}, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/attendance/corrections/${correctionId}/approve${q}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function rejectCorrection(correctionId, payload = {}, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/attendance/corrections/${correctionId}/reject${q}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

// =========================================================================
// TASK 8.4: PAY-PERIOD APPROVAL & LOCK
// =========================================================================

export async function fetchPeriodReview(branchId, periodStart, periodEnd, organizationId) {
  const q = buildQuery(organizationId, { branchId, periodStart, periodEnd });
  const res = await apiClient.request(`/attendance/approvals/period-review${q}`);
  return res?.data || res;
}

export async function approvePeriod(payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/attendance/approvals/period/approve${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function approveAllClean(branchId, periodStart, periodEnd, organizationId) {
  const q = buildQuery(organizationId, { branchId, periodStart, periodEnd });
  const res = await apiClient.request(`/attendance/approvals/period/approve-all-clean${q}`, {
    method: 'POST',
  });
  return res?.data || res;
}

export async function reopenPeriod(approvalId, payload, organizationId) {
  const q = buildQuery(organizationId);
  const res = await apiClient.request(`/attendance/approvals/period/${approvalId}/reopen${q}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function fetchPayrollReadyAttendance(branchId, periodStart, periodEnd, organizationId) {
  const q = buildQuery(organizationId, { branchId, periodStart, periodEnd });
  const res = await apiClient.request(`/attendance/approvals/payroll-ready${q}`);
  return res?.data || res;
}

// =========================================================================
// TASK 8.5: MONTHLY SUMMARY & REPORTS
// =========================================================================

export async function fetchAttendanceOverview(params = {}, organizationId) {
  const q = buildQuery(organizationId, params);
  const res = await apiClient.request(`/attendance/summary/overview${q}`);
  return res?.data || res;
}

export async function fetchMonthlySummary(branchId, year, month, organizationId) {
  const q = buildQuery(organizationId, { branchId, year, month });
  const res = await apiClient.request(`/attendance/summary/monthly${q}`);
  return res?.data || res;
}

export async function recalculateMonthlySummary(branchId, year, month, organizationId) {
  const q = buildQuery(organizationId, { branchId, year, month });
  const res = await apiClient.request(`/attendance/summary/monthly/recalculate${q}`, {
    method: 'POST',
  });
  return res?.data || res;
}

export async function exportMonthlySummaryCsv(branchId, year, month, organizationId) {
  const q = buildQuery(organizationId, { branchId, year, month });
  const res = await apiClient.request(`/attendance/summary/monthly/export${q}`);
  return res?.csv || res;
}
