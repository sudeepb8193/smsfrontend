import { apiClient } from './apiClient';

export const organizationApi = {
  // Task 1.1 Business Profile
  checkSlugAvailability(slug, currentOrgId) {
    let query = `?slug=${encodeURIComponent(slug)}`;
    if (currentOrgId) query += `&currentOrgId=${currentOrgId}`;
    return apiClient.get(`/organizations/slug-availability${query}`);
  },

  getOrganization(id = 1) {
    return apiClient.get(`/organizations/${id}`);
  },

  createOrganization(data) {
    return apiClient.post('/organizations', data);
  },

  updateOrganization(id = 1, data) {
    return apiClient.patch(`/organizations/${id}`, data);
  },

  // Task 1.2 Contacts
  getContacts(orgId = 1) {
    return apiClient.get(`/organizations/${orgId}/contacts`);
  },

  getContactById(orgId = 1, contactId) {
    return apiClient.get(`/organizations/${orgId}/contacts/${contactId}`);
  },

  createContact(orgId = 1, data) {
    return apiClient.post(`/organizations/${orgId}/contacts`, data);
  },

  updateContact(orgId = 1, contactId, data) {
    return apiClient.patch(`/organizations/${orgId}/contacts/${contactId}`, data);
  },

  deleteContact(orgId = 1, contactId) {
    return apiClient.request(`/organizations/${orgId}/contacts/${contactId}`, {
      method: 'DELETE',
    });
  },

  requestEmailVerification(orgId = 1, contactId) {
    return apiClient.post(`/organizations/${orgId}/contacts/${contactId}/request-email-verification`);
  },

  verifyEmail(orgId = 1, contactId, token) {
    return apiClient.post(`/organizations/${orgId}/contacts/${contactId}/verify-email`, { token });
  },

  requestPhoneVerification(orgId = 1, contactId) {
    return apiClient.post(`/organizations/${orgId}/contacts/${contactId}/request-phone-verification`);
  },

  verifyPhone(orgId = 1, contactId, token) {
    return apiClient.post(`/organizations/${orgId}/contacts/${contactId}/verify-phone`, { token });
  },

  // Task 1.3 Addresses
  getAddresses(orgId = 1) {
    return apiClient.get(`/organizations/${orgId}/addresses`);
  },

  createAddress(orgId = 1, data) {
    return apiClient.post(`/organizations/${orgId}/addresses`, data);
  },

  updateAddress(orgId = 1, addressId, data) {
    return apiClient.patch(`/organizations/${orgId}/addresses/${addressId}`, data);
  },

  deleteAddress(orgId = 1, addressId) {
    return apiClient.request(`/organizations/${orgId}/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },

  // Task 1.4 Tax Profiles
  getTaxProfiles(orgId = 1) {
    return apiClient.get(`/organizations/${orgId}/tax-profiles`);
  },

  createTaxProfile(orgId = 1, data) {
    return apiClient.post(`/organizations/${orgId}/tax-profiles`, data);
  },

  updateTaxProfile(orgId = 1, taxId, data) {
    return apiClient.patch(`/organizations/${orgId}/tax-profiles/${taxId}`, data);
  },

  submitTaxVerification(orgId = 1, taxId) {
    return apiClient.post(`/organizations/${orgId}/tax-profiles/${taxId}/submit-verification`);
  },

  verifyTaxProfile(orgId = 1, taxId) {
    return apiClient.post(`/organizations/${orgId}/tax-profiles/${taxId}/verify`);
  },

  rejectTaxProfile(orgId = 1, taxId, notes) {
    return apiClient.post(`/organizations/${orgId}/tax-profiles/${taxId}/reject`, { notes });
  },

  // Task 1.5 Currency & Regional Settings
  getSettings(orgId = 1) {
    return apiClient.get(`/organizations/${orgId}/settings`);
  },

  updateSettings(orgId = 1, data, hasTransactions = false) {
    const query = hasTransactions ? '?hasTransactions=true' : '';
    return apiClient.request(`/organizations/${orgId}/settings${query}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Task 1.6 Business Hours
  getBusinessHours(orgId = 1, branchId) {
    const query = branchId ? `?branchId=${branchId}` : '';
    return apiClient.get(`/organizations/${orgId}/business-hours${query}`);
  },

  getEffectiveBusinessHours(orgId = 1, dayOfWeek, branchId) {
    let query = `?dayOfWeek=${dayOfWeek}`;
    if (branchId) query += `&branchId=${branchId}`;
    return apiClient.get(`/organizations/${orgId}/business-hours/effective${query}`);
  },

  updateWeeklyHours(orgId = 1, data) {
    return apiClient.request(`/organizations/${orgId}/business-hours`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  copyBusinessHoursDay(orgId = 1, data) {
    return apiClient.post(`/organizations/${orgId}/business-hours/copy-day`, data);
  },

  resetBranchHoursOverride(orgId = 1, branchId) {
    return apiClient.request(`/organizations/${orgId}/business-hours/branch-override/${branchId}`, {
      method: 'DELETE',
    });
  },

  // Task 1.7 Holidays
  getHolidays(orgId = 1, branchId) {
    const query = branchId !== undefined ? `?branchId=${branchId}` : '';
    return apiClient.get(`/organizations/${orgId}/holidays${query}`);
  },

  checkHolidayDate(orgId = 1, date, branchId) {
    let query = `?date=${date}`;
    if (branchId) query += `&branchId=${branchId}`;
    return apiClient.get(`/organizations/${orgId}/holidays/check-date${query}`);
  },

  getEffectiveHolidays(orgId = 1, startDate, endDate, branchId) {
    let query = `?startDate=${startDate}&endDate=${endDate}`;
    if (branchId) query += `&branchId=${branchId}`;
    return apiClient.get(`/organizations/${orgId}/holidays/effective${query}`);
  },

  createHoliday(orgId = 1, data) {
    return apiClient.post(`/organizations/${orgId}/holidays`, data);
  },

  updateHoliday(orgId = 1, holidayId, data) {
    return apiClient.patch(`/organizations/${orgId}/holidays/${holidayId}`, data);
  },

  cancelHoliday(orgId = 1, holidayId) {
    return apiClient.post(`/organizations/${orgId}/holidays/${holidayId}/cancel`);
  },

  overrideHolidayYear(orgId = 1, holidayId, year, isCancelled = true) {
    return apiClient.post(`/organizations/${orgId}/holidays/${holidayId}/override-year`, {
      year,
      isCancelled,
    });
  },
};
