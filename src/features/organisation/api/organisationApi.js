const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const CLEAN_BASE = RAW_API_BASE.replace(/\/+$/, '');
const API_BASE = CLEAN_BASE.endsWith('/sms') ? CLEAN_BASE : `${CLEAN_BASE}/sms`;

async function request(path, options = {}) {
  const token =
    localStorage.getItem('salon_jwt_token') ||
    localStorage.getItem('salon_access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${API_BASE}${cleanPath}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const rawDetails = body?.error?.details || body?.details;
    const detailsStr = Array.isArray(rawDetails) ? rawDetails.join(', ') : null;
    const errorMsg =
      detailsStr ||
      body?.error?.message ||
      body?.message ||
      'An unexpected server error occurred';
    const error = new Error(
      typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
    );
    error.status = res.status;
    error.code = body?.error?.code || body?.code;
    error.data = body;
    throw error;
  }

  return body?.data !== undefined ? body.data : body;
}

export function fetchOrganisations(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.plan && params.plan !== 'all') query.append('plan', params.plan);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/super-admin/organisations${queryString}`, {
    method: 'GET',
  });
}

export function fetchOrganisationDetails(id) {
  return request(`/super-admin/organisations/${id}`, {
    method: 'GET',
  });
}

export function createOrganisation(payload) {
  return request('/super-admin/organisations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateOrganisation(id, payload) {
  return request(`/super-admin/organisations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function updateOrganisationSetup(id, payload) {
  return request(`/super-admin/organisations/${id}/setup`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchOwnerOrganisationSetup() {
  return request('/owner/organisation/setup', { method: 'GET' });
}

export function updateOwnerOrganisationSetup(payload) {
  return request('/owner/organisation/setup', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function checkOwnerOrganisationSlugAvailability(slug) {
  const query = new URLSearchParams({ slug });
  return request(`/owner/organisation/setup/slug-availability?${query}`, {
    method: 'GET',
  });
}

export function checkOrganisationSlugAvailability(id, slug) {
  const query = new URLSearchParams({ slug });
  return request(`/super-admin/organisations/${id}/slug-availability?${query}`, {
    method: 'GET',
  });
}

export function fetchAddressSuggestions(input, country, sessionToken) {
  const query = new URLSearchParams({ input, country, sessionToken });
  return request(`/super-admin/organisations/address-suggestions?${query}`, {
    method: 'GET',
  });
}

export function fetchAddressDetails(placeId, sessionToken) {
  const query = new URLSearchParams({ placeId, sessionToken });
  return request(`/super-admin/organisations/address-details?${query}`, {
    method: 'GET',
  });
}

export function sendOrganisationContactVerification(organisationId, contactId) {
  return request(
    `/super-admin/organisations/${organisationId}/contacts/${contactId}/verify-email`,
    { method: 'POST' },
  );
}

export function sendOwnerContactVerification(contactId) {
  return request(`/owner/organisation/contacts/${contactId}/verify-email`, {
    method: 'POST',
  });
}

export function verifyOrganisationContactEmail(token) {
  const query = new URLSearchParams({ token });
  return request(`/organization-contact-verification?${query}`, { method: 'GET' });
}

export function updateOrganisationStatus(id, status) {
  return request(`/super-admin/organisations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteOrganisation(id) {
  return request(`/super-admin/organisations/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadImageFile(file, folder = 'organizations') {
  const token =
    localStorage.getItem('salon_jwt_token') ||
    localStorage.getItem('salon_access_token');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/storage/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg =
      body?.error?.message ||
      body?.message ||
      'Failed to upload file to cloud storage. Please try again later';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  const payload = body?.data !== undefined ? body.data : body;
  return payload?.data !== undefined ? payload.data : payload;
}
