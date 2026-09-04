const BASE_URL = 'http://localhost:3000';

export const apiClient = {
  activeRole: 'SUPER_ADMIN',
  activeOrgId: null,

  setRole(role) {
    this.activeRole = role;
  },

  async request(endpoint, options = {}) {
    const headers = {
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Role & tenant headers for development / demo mode
    if (this.activeRole) {
      headers['x-user-role'] = this.activeRole;
    }
    if (this.activeOrgId) {
      headers['x-organization-id'] = this.activeOrgId;
    }

    const token = localStorage.getItem('salon_jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.errors || 'An unexpected server error occurred';
      const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  patch(endpoint, body) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
    });
  },
};
