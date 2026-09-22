import { apiClient } from './apiClient';

const API_PREFIX = '/sms';

export const userService = {
  /**
   * Get all organization users with active roles summary
   */
  getUsers: async () => {
    const res = await apiClient.get(`${API_PREFIX}/users`);
    return res?.data || res;
  },

  /**
   * Get all available roles for assignment in current organization
   */
  getAvailableRoles: async () => {
    const res = await apiClient.get(`${API_PREFIX}/users/available-roles`);
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
