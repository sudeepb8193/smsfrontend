const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const CLEAN_BASE = RAW_API_BASE.replace(/\/+$/, '');
const API_BASE = CLEAN_BASE.endsWith('/sms') ? CLEAN_BASE : `${CLEAN_BASE}/sms`;

async function request(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${API_BASE}${cleanPath}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = body?.error?.message || body?.message || 'Something went wrong';
    const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    error.status = res.status;
    error.code = body?.error?.code;
    error.data = body;
    throw error;
  }

  return body?.data !== undefined ? body.data : body;
}

export function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function refreshTokens(refreshToken) {
  return request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function fetchMe(accessToken) {
  return request('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
