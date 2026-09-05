import { userApi } from '../../../services/user.api';

export const userService = {
  getUsers: async (params) => {
    return await userApi.getUsers(params);
  },
  createUser: async (userData) => {
    return await userApi.createUser(userData);
  },
  deactivateUser: async (uuid) => {
    return await userApi.deactivateUser(uuid);
  },
  reactivateUser: async (uuid) => {
    return await userApi.reactivateUser(uuid);
  },
  resendInvite: async (uuid) => {
    return await userApi.resendInvite(uuid);
  },
  getAvailableRoles: async () => {
    return await userApi.getAvailableRoles();
  },
  getUserRoles: async (userId) => {
    return await userApi.getUserRoles(userId);
  },
  assignRole: async (userId, roleData) => {
    return await userApi.assignRole(userId, roleData);
  },
  makeRolePrimary: async (userId, roleId) => {
    return await userApi.makeRolePrimary(userId, roleId);
  },
  getRoleRemovalImpact: async (userId, roleId) => {
    return await userApi.getRoleRemovalImpact(userId, roleId);
  },
  removeRole: async (userId, roleId) => {
    return await userApi.removeRole(userId, roleId);
  },
  getEffectivePermissions: async (userId) => {
    return await userApi.getEffectivePermissions(userId);
  },
};

export default userService;
