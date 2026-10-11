const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const CLEAN_BASE = RAW_API_BASE.replace(/\/+$/, '');
const BASE_URL = CLEAN_BASE.endsWith('/sms') ? CLEAN_BASE : `${CLEAN_BASE}/sms`;

// Shared promise to deduplicate concurrent token refresh attempts
let refreshPromise = null;

async function executeTokenRefresh() {
  const refreshToken = localStorage.getItem('salon_refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok || (!body?.data?.accessToken && !body?.accessToken)) {
    localStorage.removeItem('salon_jwt_token');
    localStorage.removeItem('salon_access_token');
    localStorage.removeItem('salon_refresh_token');
    throw new Error('Session expired. Please log in again.');
  }

  const data = body.data || body;
  const newAccessToken = data.accessToken;
  const newRefreshToken = data.refreshToken;

  localStorage.setItem('salon_jwt_token', newAccessToken);
  if (newRefreshToken) {
    localStorage.setItem('salon_refresh_token', newRefreshToken);
  }

  return newAccessToken;
}

export const apiClient = {
  activeRole: 'SUPER_ADMIN',

  setRole(role) {
    this.activeRole = role;
  },

  async request(endpoint, options = {}, isRetry = false) {
    const headers = {
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Role header for development / demo mode
    if (this.activeRole) {
      headers['x-user-role'] = this.activeRole;
    }

    const token =
      localStorage.getItem('salon_jwt_token') ||
      localStorage.getItem('salon_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Handle endpoints that already include /sms or are relative
    const cleanEndpoint = endpoint.startsWith('/sms/')
      ? endpoint.slice(4)
      : endpoint.startsWith('/sms')
      ? endpoint.slice(4)
      : endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

    const url = `${BASE_URL}${cleanEndpoint}`;

    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (networkErr) {
      throw new Error(`Network error: ${networkErr.message}`);
    }

    // Silent automatic token refresh on 401 Unauthorized / Token Expired
    if (response.status === 401 && !isRetry && !cleanEndpoint.includes('/auth/')) {
      const storedRefreshToken = localStorage.getItem('salon_refresh_token');
      if (storedRefreshToken) {
        try {
          if (!refreshPromise) {
            refreshPromise = executeTokenRefresh().finally(() => {
              refreshPromise = null;
            });
          }
          const newToken = await refreshPromise;

          // Retry the request with the new access token
          const retryOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          return this.request(endpoint, retryOptions, true);
        } catch (refreshErr) {
          localStorage.removeItem('salon_jwt_token');
          localStorage.removeItem('salon_access_token');
          localStorage.removeItem('salon_refresh_token');
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          throw refreshErr;
        }
      }
    }

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        body?.error?.message ||
        body?.message ||
        body?.errors ||
        'An unexpected server error occurred';
      const error = new Error(
        typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
      );
      error.status = response.status;
      error.code = body?.code || body?.error?.code;
      error.data = body;
      throw error;
    }

    // Unwrap NestJS TransformInterceptor ApiResponse { success: true, data: ... }
    if (
      body &&
      typeof body === 'object' &&
      body.success !== undefined &&
      body.data !== undefined
    ) {
      return body.data;
    }

    return body;
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

  put(endpoint, body) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

export default apiClient;
