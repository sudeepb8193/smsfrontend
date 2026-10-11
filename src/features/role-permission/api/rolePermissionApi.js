import { apiClient } from '../../../services/apiClient';

export const rolePermissionApi = {
  // Roles
  getRoles: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.roleType) query.append('roleType', params.roleType);
    if (params.status) query.append('status', params.status);
    if (params.organizationId) query.append('organizationId', params.organizationId);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/api/roles${queryString}`);
  },

  getBranches: (orgId) => {
    return apiClient.get(orgId ? `/api/roles/meta/branches?organizationId=${orgId}` : '/api/roles/meta/branches');
  },

  getRole: (roleId) => {
    return apiClient.get(`/api/roles/${roleId}`);
  },

  createRole: (data) => {
    return apiClient.post('/api/roles', data);
  },

  updateRole: (roleId, data) => {
    return apiClient.put(`/api/roles/${roleId}`, data);
  },

  deleteRole: (roleId) => {
    return apiClient.delete(`/api/roles/${roleId}`);
  },

  getAffectedUsers: (roleId) => {
    return apiClient.get(`/api/roles/${roleId}/affected-users`);
  },

  getRolePermissions: (roleId) => {
    return apiClient.get(`/api/roles/${roleId}/permissions`);
  },

  updateRolePermissions: (roleId, data) => {
    return apiClient.put(`/api/roles/${roleId}/permissions`, data);
  },

  // Permissions Catalog
  getPermissions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.moduleCode) query.append('moduleCode', params.moduleCode);
    if (params.search) query.append('search', params.search);
    if (params.action) query.append('action', params.action);
    if (params.includeLegacy !== undefined) query.append('includeLegacy', params.includeLegacy);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/api/permissions${queryString}`);
  },

  getMatrixTemplate: () => {
    return apiClient.get('/api/permissions/matrix-template');
  },

  createModulePermissions: (data) => {
    return apiClient.post('/api/permissions/modules', data);
  },

  updateModulePermissions: (moduleCode, data) => {
    return apiClient.put(`/api/permissions/modules/${moduleCode}`, data);
  },

  deleteModule: (moduleCode) => {
    return apiClient.delete(`/api/permissions/modules/${moduleCode}`);
  },

  // Staff Overrides
  getStaffOverrides: (staffId) => {
    return apiClient.get(`/api/staff/${staffId}/overrides`);
  },

  createStaffOverride: (staffId, data) => {
    return apiClient.post(`/api/staff/${staffId}/overrides`, data);
  },

  deleteStaffOverride: (staffId, overrideId) => {
    return apiClient.delete(`/api/staff/${staffId}/overrides/${overrideId}`);
  },

  getStaffEffectivePermissions: (staffId) => {
    return apiClient.get(`/api/staff/${staffId}/effective-permissions`);
  },

  // Super Admin specific endpoints
  getSuperAdminRoles: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.roleType) query.append('roleType', params.roleType);
    if (params.status) query.append('status', params.status);
    if (params.organizationId) query.append('organizationId', params.organizationId);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get(`/api/super-admin/roles${queryString}`);
  },

  createSuperAdminRole: (data) => {
    return apiClient.post('/api/super-admin/roles', data);
  },



  getOrganizations: () => {
    return apiClient.get('/api/super-admin/organisations');
  },
};
