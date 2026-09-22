import { useState, useEffect, useCallback } from 'react';
import { organizationApi } from '../services/organizationApi';

export const useOrganization = () => {
  const [profile, setProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [taxProfiles, setTaxProfiles] = useState([]);
  const [settings, setSettings] = useState(null);
  const [businessHours, setBusinessHours] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Pagination & view state for tables / grid
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const clearToast = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        profileRes,
        contactsRes,
        addressesRes,
        taxRes,
        settingsRes,
        hoursRes,
        holidaysRes,
      ] = await Promise.allSettled([
        organizationApi.getProfile(),
        organizationApi.getContacts(),
        organizationApi.getAddresses(),
        organizationApi.getTaxProfiles(),
        organizationApi.getRegionalSettings(),
        organizationApi.getBusinessHours(),
        organizationApi.getHolidays(),
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (contactsRes.status === 'fulfilled') setContacts(Array.isArray(contactsRes.value) ? contactsRes.value : []);
      if (addressesRes.status === 'fulfilled') setAddresses(Array.isArray(addressesRes.value) ? addressesRes.value : []);
      if (taxRes.status === 'fulfilled') setTaxProfiles(Array.isArray(taxRes.value) ? taxRes.value : []);
      if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value);
      if (hoursRes.status === 'fulfilled') setBusinessHours(hoursRes.value?.days || []);
      if (holidaysRes.status === 'fulfilled') setHolidays(Array.isArray(holidaysRes.value) ? holidaysRes.value : []);
    } catch (err) {
      setError(err.message || 'Failed to load organization data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const updateProfile = async (data) => {
    setSaving(true);
    clearToast();
    try {
      const updated = await organizationApi.updateProfile(data);
      setProfile(updated);
      setSuccessMessage('Business profile updated successfully!');
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file) => {
    setSaving(true);
    clearToast();
    try {
      const updated = await organizationApi.uploadLogo(file);
      setProfile(updated);
      setSuccessMessage('Organization logo uploaded successfully!');
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to upload logo');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const activateOrganization = async () => {
    setSaving(true);
    clearToast();
    try {
      const updated = await organizationApi.activateOrganization();
      setProfile(updated);
      setSuccessMessage('Organization activated successfully!');
      return updated;
    } catch (err) {
      setError(err.message || 'Activation failed');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Contact actions
  const createContact = async (data) => {
    setSaving(true);
    clearToast();
    try {
      const newContact = await organizationApi.createContact(data);
      setContacts((prev) => [newContact, ...prev]);
      setSuccessMessage('Contact created successfully!');
      return newContact;
    } catch (err) {
      setError(err.message || 'Failed to create contact');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateContact = async (id, data) => {
    setSaving(true);
    clearToast();
    try {
      const updated = await organizationApi.updateContact(id, data);
      setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setSuccessMessage('Contact updated successfully!');
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update contact');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async (id) => {
    setSaving(true);
    clearToast();
    try {
      await organizationApi.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setSuccessMessage('Contact deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete contact');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Address actions
  const createAddress = async (data) => {
    setSaving(true);
    clearToast();
    try {
      const newAddr = await organizationApi.createAddress(data);
      setAddresses((prev) => [newAddr, ...prev]);
      setSuccessMessage('Address added successfully!');
      return newAddr;
    } catch (err) {
      setError(err.message || 'Failed to add address');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateAddress = async (id, data) => {
    setSaving(true);
    clearToast();
    try {
      const updated = await organizationApi.updateAddress(id, data);
      setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setSuccessMessage('Address updated successfully!');
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update address');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id) => {
    setSaving(true);
    clearToast();
    try {
      await organizationApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setSuccessMessage('Address deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete address');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Tax actions
  const createTaxProfile = async (data) => {
    setSaving(true);
    clearToast();
    try {
      const newTax = await organizationApi.createTaxProfile(data);
      setTaxProfiles((prev) => [newTax, ...prev]);
      setSuccessMessage('Tax profile added successfully!');
      return newTax;
    } catch (err) {
      setError(err.message || 'Failed to add tax profile');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateTaxProfile = async (id, data) => {
    setSaving(true);
    clearToast();
    try {
      const updated = await organizationApi.updateTaxProfile(id, data);
      setTaxProfiles((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setSuccessMessage('Tax profile updated successfully!');
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update tax profile');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteTaxProfile = async (id) => {
    setSaving(true);
    clearToast();
    try {
      await organizationApi.deleteTaxProfile(id);
      setTaxProfiles((prev) => prev.filter((t) => t.id !== id));
      setSuccessMessage('Tax profile deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete tax profile');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Settings actions
  const updateSettings = async (data) => {
    setSaving(true);
    clearToast();
    try {
      const updated = await organizationApi.updateRegionalSettings(data);
      setSettings(updated);
      setSuccessMessage('Regional settings saved successfully!');
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update regional settings');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Business hours actions
  const updateHours = async (days, branchId = null) => {
    setSaving(true);
    clearToast();
    try {
      const res = await organizationApi.updateBusinessHours({ days }, branchId);
      setBusinessHours(res?.days || []);
      setSuccessMessage('Business hours saved successfully!');
      return res;
    } catch (err) {
      setError(err.message || 'Failed to save business hours');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Holiday actions
  const createHoliday = async (data) => {
    setSaving(true);
    clearToast();
    try {
      const newHol = await organizationApi.createHoliday(data);
      setHolidays((prev) => [newHol, ...prev]);
      setSuccessMessage('Holiday added to calendar!');
      return newHol;
    } catch (err) {
      setError(err.message || 'Failed to add holiday');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateHoliday = async (id, data) => {
    setSaving(true);
    clearToast();
    try {
      const updated = await organizationApi.updateHoliday(id, data);
      setHolidays((prev) => prev.map((h) => (h.id === id ? updated : h)));
      setSuccessMessage('Holiday updated successfully!');
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update holiday');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const cancelHoliday = async (id) => {
    setSaving(true);
    clearToast();
    try {
      const updated = await organizationApi.cancelHoliday(id);
      setHolidays((prev) => prev.map((h) => (h.id === id ? updated : h)));
      setSuccessMessage('Holiday cancelled!');
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to cancel holiday');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteHoliday = async (id) => {
    setSaving(true);
    clearToast();
    try {
      await organizationApi.deleteHoliday(id);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      setSuccessMessage('Holiday deleted!');
    } catch (err) {
      setError(err.message || 'Failed to delete holiday');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    contacts,
    addresses,
    taxProfiles,
    settings,
    businessHours,
    holidays,
    loading,
    saving,
    error,
    successMessage,
    clearToast,
    refetchAll: fetchAllData,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,

    // Actions
    updateProfile,
    uploadLogo,
    activateOrganization,
    createContact,
    updateContact,
    deleteContact,
    createAddress,
    updateAddress,
    deleteAddress,
    createTaxProfile,
    updateTaxProfile,
    deleteTaxProfile,
    updateSettings,
    updateHours,
    createHoliday,
    updateHoliday,
    cancelHoliday,
    deleteHoliday,
  };
};
