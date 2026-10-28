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

    const activeOrgId = localStorage.getItem('sms_active_organization_id');
    if (activeOrgId && !headers['x-organization-id']) {
      headers['x-organization-id'] = activeOrgId;
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

    // Handle 401 Unauthorized (Account Deactivated / Token Expired)
    if (response.status === 401 && !cleanEndpoint.includes('/auth/login')) {
      let errorBody = null;
      try {
        errorBody = await response.clone().json();
      } catch (e) {
        // Ignored if response is not JSON
      }

      const errCode = errorBody?.code || errorBody?.error?.code;
      const errMsg =
        errorBody?.message ||
        errorBody?.error?.message ||
        (errCode === 'ACCOUNT_DEACTIVATED'
          ? 'Your account has been deactivated. Please contact your administrator.'
          : errCode === 'ACCOUNT_SUSPENDED'
          ? 'Your account has been suspended. Please contact your administrator.'
          : 'Session expired. Please log in again.');

      // If the account itself is deactivated or suspended, do not attempt to refresh
      const isDeactivatedOrSuspended =
        errCode === 'ACCOUNT_DEACTIVATED' ||
        errCode === 'ACCOUNT_SUSPENDED' ||
        errCode === 'ACCOUNT_INACTIVE';

      if (isDeactivatedOrSuspended) {
        localStorage.removeItem('salon_jwt_token');
        localStorage.removeItem('salon_access_token');
        localStorage.removeItem('salon_refresh_token');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_error_message', errMsg);
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        const error = new Error(errMsg);
        error.status = 401;
        error.code = errCode;
        throw error;
      }

      // Silent automatic token refresh on expired access token
      if (!isRetry && !cleanEndpoint.includes('/auth/')) {
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
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(
                'auth_error_message',
                'Session expired. Please log in again.',
              );
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }
            throw refreshErr;
          }
        } else {
          localStorage.removeItem('salon_jwt_token');
          localStorage.removeItem('salon_access_token');
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(
              'auth_error_message',
              'Session expired. Please log in again.',
            );
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        }
      }
    }

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const details = body?.error?.details || body?.details;
      const detailsMsg = Array.isArray(details)
        ? details.join(', ')
        : typeof details === 'string'
        ? details
        : null;
      const baseMsg = body?.error?.message || body?.message || body?.errors;
      const errorMsg = detailsMsg
        ? `${baseMsg ? `${baseMsg}: ` : ''}${detailsMsg}`
        : baseMsg || 'An unexpected server error occurred';
      const error = new Error(
        typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg),
      );
      error.status = response.status;
      error.code = body?.code || body?.error?.code;
      error.data = body;
      error.details = details;
      error.dependencies = body?.error?.dependencies || body?.dependencies;
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
