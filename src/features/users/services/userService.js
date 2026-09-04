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
};

export default userService;
