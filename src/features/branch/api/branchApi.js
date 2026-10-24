import apiClient from '../../../services/apiClient';

function request(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return apiClient.request(cleanPath, options);
}

/**
 * 1. Fetch paginated, filtered, searchable branch list
 */
export function fetchBranches(params = {}) {
  const query = new URLSearchParams();
  if (params.organizationId) query.append('organizationId', params.organizationId);
  if (params.search) query.append('search', params.search);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.branchType && params.branchType !== 'all') query.append('branchType', params.branchType);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);
  if (params.includeDeleted) query.append('includeDeleted', 'true');

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/branches${queryString}`, { method: 'GET' });
}

/**
 * 2. Fetch single branch details by ID
 */
export function fetchBranchDetails(id) {
  return request(`/branches/${id}`, { method: 'GET' });
}

/**
 * 3. Create a new branch (Draft or Active)
 */
export function createBranch(payload) {
  return request('/branches', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * 4. Update an existing branch profile
 */
export function updateBranch(id, payload) {
  return request(`/branches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * 5. Check branch code availability and get suggestion
 */
export function checkBranchCode(code, organizationId) {
  const query = new URLSearchParams({ code });
  if (organizationId) query.append('organizationId', organizationId);
  return request(`/branches/check-code?${query}`, { method: 'GET' });
}

/**
 * 6. Inspect deletion blockers
 */
export function fetchBranchBlockers(id) {
  return request(`/branches/${id}/blockers`, { method: 'GET' });
}

/**
 * 7. Soft delete branch
 */
export function deleteBranch(id) {
  return request(`/branches/${id}`, { method: 'DELETE' });
}

/**
 * 8. Copy settings from source branch (preview or execute)
 */
export function copyBranchSettings(targetBranchId, payload) {
  return request(`/branches/${targetBranchId}/copy-settings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * 9. Upload branch cover image via storage endpoint
 */
export async function uploadBranchCoverImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'branches');

  return request('/storage/upload', {
    method: 'POST',
    body: formData,
  });
}
