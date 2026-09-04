import { apiClient } from './apiClient';

export const authApi = {
  async login(credentials) {
    const data = await apiClient.post('/auth/login', credentials);
    if (data?.accessToken) {
      localStorage.setItem('salon_jwt_token', data.accessToken);
      if (data.user?.role) {
        apiClient.setRole(data.user.role);
      }
      if (data.user?.organizationId) {
        apiClient.activeOrgId = data.user.organizationId;
      }
    }
    return data;
  },

  async seedDemo() {
    const data = await apiClient.post('/auth/seed-demo', {});
    if (data?.accessToken) {
      localStorage.setItem('salon_jwt_token', data.accessToken);
      if (data.user?.role) {
        apiClient.setRole(data.user.role);
      }
    }
    return data;
  },

  async getProfile() {
    return apiClient.get('/auth/me');
  },

  logout() {
    localStorage.removeItem('salon_jwt_token');
    apiClient.activeRole = 'SUPER_ADMIN';
    apiClient.activeOrgId = null;
  },
};
