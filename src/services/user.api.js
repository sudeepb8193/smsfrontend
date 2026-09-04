import { apiClient } from './apiClient';

export const userApi = {
  getUsers(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.role) searchParams.append('role', params.role);
    if (params.status && params.status !== 'all') searchParams.append('status', params.status);
    if (params.branchId) searchParams.append('branchId', params.branchId);
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);

    const queryString = searchParams.toString();
    return apiClient.get(`/users${queryString ? `?${queryString}` : ''}`);
  },

  getUser(id) {
    return apiClient.get(`/users/${id}`);
  },

  createUser(userData) {
    return apiClient.post('/users', userData);
  },

  updateUser(id, userData) {
    return apiClient.patch(`/users/${id}`, userData);
  },

  resendInvite(id) {
    return apiClient.post(`/users/${id}/resend-invite`, {});
  },

  acceptInvite(data) {
    return apiClient.post('/users/accept-invite', data);
  },

  deactivateUser(id) {
    return apiClient.post(`/users/${id}/deactivate`, {});
  },

  reactivateUser(id) {
    return apiClient.post(`/users/${id}/reactivate`, {});
  },

  changePassword(passwordData) {
    return apiClient.patch('/users/me/password', passwordData);
  },

  get2FASettings() {
    return apiClient.get('/users/me/2fa');
  },

  toggle2FA(enable) {
    return apiClient.post('/users/me/2fa/toggle', { enable });
  },
};
