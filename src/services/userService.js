import { apiClient } from './apiClient';

const API_PREFIX = '/sms';

export const userService = {
  /**
   * Get all organization users with search, filtering, and pagination
   */
  getUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.roleId) query.append('roleId', params.roleId);
    if (params.branchId) query.append('branchId', params.branchId);
    if (params.organizationId) query.append('organizationId', params.organizationId);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const queryString = query.toString();
    const url = queryString ? `${API_PREFIX}/users?${queryString}` : `${API_PREFIX}/users`;
    const res = await apiClient.get(url);
    return res?.data || res;
  },

  /**
   * Get single user details by ID
   */
  getUserById: async (userId) => {
    const res = await apiClient.get(`${API_PREFIX}/users/${userId}`);
    return res?.data || res;
  },

  /**
   * Invite a new user with single-use invitation token
   */
  inviteUser: async (userData) => {
    const res = await apiClient.post(`${API_PREFIX}/users/invite`, userData);
    return res?.data || res;
  },

  /**
   * Resend invitation with a refreshed single-use token and 7-day expiry
   */
  resendInvite: async (userId) => {
    const res = await apiClient.post(`${API_PREFIX}/users/${userId}/resend-invite`);
    return res?.data || res;
  },

  /**
   * Public: Verify invitation token before password setup
   */
  verifyInviteToken: async (token) => {
    const res = await apiClient.get(
      `${API_PREFIX}/users/verify-invite?token=${encodeURIComponent(token)}`,
    );
    return res?.data || res;
  },

  /**
   * Public: Accept invitation, establish credentials, and activate account
   */
  acceptInvite: async ({ token, password }) => {
    const res = await apiClient.post(`${API_PREFIX}/users/accept-invite`, {
      token,
      password,
    });
    return res?.data || res;
  },

  /**
   * Update user profile information
   */
  updateUser: async (userId, data) => {
    const res = await apiClient.patch(`${API_PREFIX}/users/${userId}`, data);
    return res?.data || res;
  },

  /**
   * Soft delete user account (blocked if historical records exist)
   */
  deleteUser: async (userId) => {
    const res = await apiClient.delete(`${API_PREFIX}/users/${userId}`);
    return res?.data || res;
  },

  /**
   * Change user account status (active, suspended, deactivated)
   */
  changeUserStatus: async (userId, { status, reason }) => {
    const res = await apiClient.patch(`${API_PREFIX}/users/${userId}/status`, {
      status,
      reason,
    });
    return res?.data || res;
  },

  /**
   * Get all available roles for assignment in current organization
   */
  getAvailableRoles: async (organizationId) => {
    const url = organizationId
      ? `${API_PREFIX}/users/available-roles?organizationId=${encodeURIComponent(organizationId)}`
      : `${API_PREFIX}/users/available-roles`;
    const res = await apiClient.get(url);
    return res?.data || res;
  },

  /**
   * Get role details, audit history, and effective permissions for a specific user
   */
  getUserRoleDetails: async (userId) => {
    const res = await apiClient.get(`${API_PREFIX}/users/${userId}/roles`);
    return res?.data || res;
  },

  /**
   * Assign a role to a user
   */
  assignRole: async (userId, { roleId, isPrimary = false }) => {
    const res = await apiClient.post(`${API_PREFIX}/users/${userId}/roles`, {
      roleId,
      isPrimary,
    });
    return res?.data || res;
  },

  /**
   * Set an assigned role as Primary
   */
  setPrimaryRole: async (userId, roleId) => {
    const res = await apiClient.patch(
      `${API_PREFIX}/users/${userId}/roles/${roleId}/primary`,
      {},
    );
    return res?.data || res;
  },

  /**
   * Preview permissions lost impact before removing a role
   */
  getRoleRemovalImpact: async (userId, roleId) => {
    const res = await apiClient.get(
      `${API_PREFIX}/users/${userId}/roles/${roleId}/impact`,
    );
    return res?.data || res;
  },

  /**
   * Remove a role assignment from a user (Blocked if last role)
   */
  removeRole: async (userId, roleId) => {
    const res = await apiClient.delete(
      `${API_PREFIX}/users/${userId}/roles/${roleId}`,
    );
    return res?.data || res;
  },

  /**
   * Bulk assign a role to multiple users
   */
  bulkAssignRoles: async ({ userIds, roleId, isPrimary = false }) => {
    const res = await apiClient.post(`${API_PREFIX}/users/bulk-assign-role`, {
      userIds,
      roleId,
      isPrimary,
    });
    return res?.data || res;
  },

  /**
   * Get union of effective permissions for a user
   */
  getEffectivePermissions: async (userId) => {
    const res = await apiClient.get(
      `${API_PREFIX}/users/${userId}/effective-permissions`,
    );
    return res?.data || res;
  },
};
