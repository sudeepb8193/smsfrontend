import { apiClient } from '../../../services/apiClient';

const API_PREFIX = '/sms';

export const organizationApi = {
  // Task 1.1: Business Profile & Identity
  createOrganization: async (data) => {
    const res = await apiClient.post(`${API_PREFIX}/organizations`, data);
    return res?.data || res;
  },

  getProfile: async () => {
    const res = await apiClient.get(`${API_PREFIX}/organizations/me`);
    return res?.data || res;
  },

  updateProfile: async (data) => {
    const res = await apiClient.put(`${API_PREFIX}/organizations/me`, data);
    return res?.data || res;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await apiClient.post(`${API_PREFIX}/organizations/me/logo`, formData);
    return res?.data || res;
  },

  activateOrganization: async () => {
    const res = await apiClient.post(`${API_PREFIX}/organizations/me/activate`, {});
    return res?.data || res;
  },

  // Task 1.2: Contact Information
  getContacts: async () => {
    const res = await apiClient.get(`${API_PREFIX}/organizations/me/contacts`);
    return res?.data || res;
  },

  createContact: async (data) => {
    const res = await apiClient.post(`${API_PREFIX}/organizations/me/contacts`, data);
    return res?.data || res;
  },

  updateContact: async (id, data) => {
    const res = await apiClient.patch(`${API_PREFIX}/organizations/me/contacts/${id}`, data);
    return res?.data || res;
  },

  setDefaultPublicContact: async (id) => {
    const res = await apiClient.patch(`${API_PREFIX}/organizations/me/contacts/${id}/default-public`, {});
    return res?.data || res;
  },

  deleteContact: async (id) => {
    const res = await apiClient.delete(`${API_PREFIX}/organizations/me/contacts/${id}`);
    return res?.data || res;
  },

  // Task 1.3: Address Management
  getAddresses: async () => {
    const res = await apiClient.get(`${API_PREFIX}/organizations/me/addresses`);
    return res?.data || res;
  },

  createAddress: async (data) => {
    const res = await apiClient.post(`${API_PREFIX}/organizations/me/addresses`, data);
    return res?.data || res;
  },

  updateAddress: async (id, data) => {
    const res = await apiClient.patch(`${API_PREFIX}/organizations/me/addresses/${id}`, data);
    return res?.data || res;
  },

  deleteAddress: async (id) => {
    const res = await apiClient.delete(`${API_PREFIX}/organizations/me/addresses/${id}`);
    return res?.data || res;
  },

  // Task 1.4: Tax Information & Registration
  getTaxProfiles: async () => {
    try {
      const res = await apiClient.get(`${API_PREFIX}/organizations/me/tax-profiles`);
      return res?.data || res;
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  createTaxProfile: async (data) => {
    const res = await apiClient.post(`${API_PREFIX}/organizations/me/tax-profiles`, data);
    return res?.data || res;
  },

  updateTaxProfile: async (id, data) => {
    const res = await apiClient.patch(`${API_PREFIX}/organizations/me/tax-profiles/${id}`, data);
    return res?.data || res;
  },

  deleteTaxProfile: async (id) => {
    const res = await apiClient.delete(`${API_PREFIX}/organizations/me/tax-profiles/${id}`);
    return res?.data || res;
  },

  // Task 1.5: Currency & Regional Settings
  getRegionalSettings: async () => {
    try {
      const res = await apiClient.get(`${API_PREFIX}/organizations/me/settings`);
      return res?.data || res;
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  updateRegionalSettings: async (data) => {
    const res = await apiClient.put(`${API_PREFIX}/organizations/me/settings`, data);
    return res?.data || res;
  },

  // Task 1.6: Business Hours & Working Days
  getBusinessHours: async (branchId = null) => {
    const endpoint = branchId
      ? `${API_PREFIX}/organizations/me/branches/${branchId}/business-hours`
      : `${API_PREFIX}/organizations/me/business-hours`;
    const res = await apiClient.get(endpoint);
    return res?.data || res;
  },

  updateBusinessHours: async (data, branchId = null) => {
    const endpoint = branchId
      ? `${API_PREFIX}/organizations/me/branches/${branchId}/business-hours`
      : `${API_PREFIX}/organizations/me/business-hours`;
    const res = await apiClient.put(endpoint, data);
    return res?.data || res;
  },

  // Task 1.7: Holiday Calendar
  getHolidays: async (queryParams = {}) => {
    const query = new URLSearchParams();
    if (queryParams.year) query.append('year', queryParams.year);
    if (queryParams.month) query.append('month', queryParams.month);
    if (queryParams.status) query.append('status', queryParams.status);
    if (queryParams.branchId) query.append('branchId', queryParams.branchId);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.get(`${API_PREFIX}/organizations/me/holidays${queryString}`);
    return res?.data || res;
  },

  createHoliday: async (data) => {
    const endpoint = data.branchId
      ? `${API_PREFIX}/organizations/me/branches/${data.branchId}/holidays`
      : `${API_PREFIX}/organizations/me/holidays`;
    const res = await apiClient.post(endpoint, data);
    return res?.data || res;
  },

  updateHoliday: async (id, data) => {
    const res = await apiClient.patch(`${API_PREFIX}/organizations/me/holidays/${id}`, data);
    return res?.data || res;
  },

  cancelHoliday: async (id) => {
    const res = await apiClient.patch(`${API_PREFIX}/organizations/me/holidays/${id}/cancel`, {});
    return res?.data || res;
  },

  deleteHoliday: async (id) => {
    const res = await apiClient.delete(`${API_PREFIX}/organizations/me/holidays/${id}`);
    return res?.data || res;
  },
};
