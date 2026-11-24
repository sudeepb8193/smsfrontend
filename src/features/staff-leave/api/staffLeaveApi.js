import { apiClient } from '../../../services/apiClient';

/**
 * Production-Level Staff Leave Management API Client (Module 09)
 * Integrates all 5 tasks: Leave Types & Policy, Balance & Accruals,
 * Requests & Workflows, Approvals & Audits, Calendar & Blackouts, plus Reports.
 */

// Helper to convert params object to URL query string
function buildQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

// ==========================================
// TASK 9.1: LEAVE TYPES & POLICY
// ==========================================

export async function fetchLeaveTypes(params = {}) {
  const query = buildQueryString(params);
  const res = await apiClient.request(`/leave/types${query}`);
  return res?.data || res;
}

export async function fetchLeaveTypeById(id) {
  const res = await apiClient.request(`/leave/types/${id}`);
  return res?.data || res;
}

export async function createLeaveType(payload) {
  const res = await apiClient.request('/leave/types', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateLeaveType(id, payload) {
  const res = await apiClient.request(`/leave/types/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateLeaveTypeStatus(id, statusOrIsActive) {
  const status =
    typeof statusOrIsActive === 'string'
      ? statusOrIsActive
      : statusOrIsActive
      ? 'active'
      : 'inactive';
  const res = await apiClient.request(`/leave/types/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, isActive: status === 'active' }),
  });
  return res?.data || res;
}

export async function seedDefaultLeaveTypes() {
  const res = await apiClient.request('/leave/types/seed-defaults', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return res?.data || res;
}

// ==========================================
// TASK 9.2: LEAVE BALANCE & ACCRUAL
// ==========================================

export async function fetchStaffBalances(params = {}) {
  const query = buildQueryString(params);
  const res = await apiClient.request(`/leave/balances${query}`);
  return res?.data || res;
}

export async function fetchMyLeaveBalances(params = {}) {
  const query = buildQueryString(params);
  try {
    const res = await apiClient.request(`/leave/balances/my-balances${query}`);
    return res?.data || res?.balances || res?.items || (Array.isArray(res) ? res : []);
  } catch (err) {
    // Graceful fallback for administrator accounts without a staff employment profile
    return [];
  }
}

export async function fetchBalanceTransactions(params = {}) {
  const query = buildQueryString(params);
  const res = await apiClient.request(`/leave/balances/transactions${query}`);
  return res?.data || res;
}

export async function initializeStaffBalances(payload) {
  const res = await apiClient.request('/leave/balances/initialize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function adjustStaffBalance(payload) {
  const res = await apiClient.request('/leave/balances/adjust', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function processMonthlyAccrual(payload) {
  const res = await apiClient.request('/leave/balances/accrual', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function processCarryForward(payload) {
  const res = await apiClient.request('/leave/balances/carry-forward', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

// ==========================================
// TASK 9.3: LEAVE APPLICATION & REQUEST WORKFLOW
// ==========================================

export async function applyForLeave(payload) {
  const res = await apiClient.request('/leave/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function fetchLeaveRequests(params = {}) {
  const query = buildQueryString(params);
  const res = await apiClient.request(`/leave/requests${query}`);
  return res?.data || res;
}

export async function fetchMyLeaveRequests(params = {}) {
  const query = buildQueryString(params);
  try {
    const res = await apiClient.request(`/leave/requests/my-requests${query}`);
    return res?.data || res?.items || (Array.isArray(res) ? res : []);
  } catch (err) {
    // Graceful fallback for administrator accounts without a staff employment profile
    return [];
  }
}

export async function fetchLeaveRequestById(id) {
  const res = await apiClient.request(`/leave/requests/${id}`);
  return res?.data || res;
}

export async function cancelLeaveRequest(id, reason = '') {
  const res = await apiClient.request(`/leave/requests/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  return res?.data || res;
}

// ==========================================
// TASK 9.4: LEAVE APPROVAL & AUDIT TRAIL
// ==========================================

export async function fetchPendingApprovals(params = {}) {
  const query = buildQueryString(params);
  const res = await apiClient.request(`/leave/approvals/pending${query}`);
  return res?.data || res;
}

export async function reviewLeaveRequest(id, payload) {
  // payload: { action: 'approve' | 'reject', rejectionReason?: string, notes?: string }
  const res = await apiClient.request(`/leave/approvals/${id}/review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function fetchApprovalLogs(id) {
  const res = await apiClient.request(`/leave/approvals/${id}/logs`);
  return res?.data || res;
}

// ==========================================
// TASK 9.5: LEAVE CALENDAR & BLACKOUT PERIODS
// ==========================================

export async function fetchLeaveCalendar(params = {}) {
  const query = buildQueryString(params);
  const res = await apiClient.request(`/leave/calendar${query}`);
  return res?.data || res;
}

export async function fetchBlackoutPeriods(params = {}) {
  const query = buildQueryString(params);
  const res = await apiClient.request(`/leave/blackout${query}`);
  return res?.data || res;
}

export async function fetchBlackoutPeriodById(id) {
  const res = await apiClient.request(`/leave/blackout/${id}`);
  return res?.data || res;
}

export async function createBlackoutPeriod(payload) {
  const res = await apiClient.request('/leave/blackout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateBlackoutPeriod(id, payload) {
  const res = await apiClient.request(`/leave/blackout/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function deleteBlackoutPeriod(id) {
  const res = await apiClient.request(`/leave/blackout/${id}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// ==========================================
// LEAVE REPORTS & CSV EXPORT
// ==========================================

export async function fetchLeaveSummaryReport(params = {}) {
  const query = buildQueryString(params);
  const res = await apiClient.request(`/leave/reports/summary${query}`);
  return res?.data || res;
}

export async function exportLeaveCsv(params = {}) {
  const query = buildQueryString(params);
  const res = await apiClient.request(`/leave/reports/export-csv${query}`);
  return res?.data || res;
}
