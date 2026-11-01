import { apiClient } from '../../../services/apiClient';

/**
 * Staff / Employee Management API Service (Module 05)
 */

// TASK 5.1: Profile & Identity
export async function fetchStaffList(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.search) query.append('search', params.search);
  if (params.branchId) query.append('branchId', params.branchId);
  if (params.employmentStatus) query.append('employmentStatus', params.employmentStatus);
  if (params.designation) query.append('designation', params.designation);
  if (params.department) query.append('department', params.department);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);
  if (params.organizationId) query.append('organizationId', params.organizationId);

  const endpoint = `/staff?${query.toString()}`;
  const res = await apiClient.request(endpoint);
  return res?.data || res;
}

export async function fetchStaffById(id, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}${query}`);
  return res?.data || res;
}

export async function fetchMyProfile(organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/me${query}`);
  return res?.data || res;
}

export async function updateMyProfile(payload, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/me${query}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function suggestEmployeeCode(prefix = 'EMP', organizationId) {
  const query = new URLSearchParams();
  if (prefix) query.append('prefix', prefix);
  if (organizationId) query.append('organizationId', organizationId);
  const res = await apiClient.request(`/staff/suggest-code?${query.toString()}`);
  return res?.data || res;
}

export async function createStaff(payload, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff${query}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateStaff(id, payload, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}${query}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateStaffStatus(id, status, reason, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/status${query}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
  return res?.data || res;
}

export async function linkStaffUser(id, userId, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/link-user${query}`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
  return res?.data || res;
}

export async function unlinkStaffUser(id, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/unlink-user${query}`, {
    method: 'POST',
  });
  return res?.data || res;
}

export async function deleteStaff(id, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}${query}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// TASK 5.2: Personal Details & Contacts
export async function fetchStaffContacts(id, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/contacts${query}`);
  return res?.data || res;
}

export async function upsertStaffContacts(id, payload, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/contacts${query}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function revealNationalId(id, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/contacts/reveal-national-id${query}`, {
    method: 'POST',
  });
  return res?.data || res;
}

// TASK 5.3: Emergency Contacts
export async function fetchEmergencyContacts(id, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/emergency-contacts${query}`);
  return res?.data || res;
}

export async function createEmergencyContact(id, payload, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/emergency-contacts${query}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateEmergencyContact(id, contactId, payload, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/emergency-contacts/${contactId}${query}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function deleteEmergencyContact(id, contactId, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/emergency-contacts/${contactId}${query}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// TASK 5.4: Employment History
export async function fetchEmploymentHistory(id, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/employment-history${query}`);
  return res?.data || res;
}

export async function createEmploymentHistory(id, payload, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/employment-history${query}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

// TASK 5.5: Skills & Qualifications
export async function fetchQualifications(id, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/qualifications${query}`);
  return res?.data || res;
}

export async function createQualification(id, payload, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/qualifications${query}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateQualification(id, qualificationId, payload, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/qualifications/${qualificationId}${query}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function deleteQualification(id, qualificationId, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/qualifications/${qualificationId}${query}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// TASK 5.6: Document Management
export async function fetchStaffDocuments(id, filters = {}, organizationId) {
  const query = new URLSearchParams();
  if (filters.category) query.append('category', filters.category);
  if (filters.status) query.append('status', filters.status);
  if (organizationId) query.append('organizationId', organizationId);

  const res = await apiClient.request(`/staff/${id}/documents?${query.toString()}`);
  return res?.data || res;
}

export async function createStaffDocument(id, payload, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/documents${query}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function fetchDocumentById(id, documentId, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/documents/${documentId}${query}`);
  return res?.data || res;
}

export async function deleteStaffDocument(id, documentId, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/documents/${documentId}${query}`, {
    method: 'DELETE',
  });
  return res?.data || res;
}

// TASK 5.7: Branch Assignments
export async function fetchBranchAssignments(id, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/branch-assignments${query}`);
  return res?.data || res;
}

export async function addSecondaryBranch(id, payload, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/branch-assignments${query}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function endSecondaryBranch(id, assignmentId, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/branch-assignments/${assignmentId}/end${query}`, {
    method: 'PATCH',
  });
  return res?.data || res;
}

export async function transferHomeBranch(id, payload, organizationId) {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  const res = await apiClient.request(`/staff/${id}/branch-assignments/transfer-home${query}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

