import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  fetchOrganisations,
  fetchOrganisationDetails,
  createOrganisation,
  updateOrganisation,
  updateOrganisationStatus,
  deleteOrganisation,
  fetchMarketplaceSetting,
  updateMarketplaceSetting,
  checkOrganisationSlugAvailability,
  checkOwnerOrganisationSlugAvailability,
  fetchOwnerOrganisationSetup,
  updateOwnerOrganisationSetup,
  updateOrganisationSetup,
} from '../api/organisationApi';
import { usePermission } from '../../../hooks/usePermission';
import { useAuth } from '../../../hooks/useAuth';

/**
 * 1. State Management Hook for Organisation List Page
 */
export const useOrganisationList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canCreate, canEdit, canDelete } = usePermission();

  const canCreateOrg = canCreate('organizations');
  const canEditOrg = canEdit('organizations');
  const canDeleteOrg = canDelete('organizations');

  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    plan: 'all',
    operatingMode: 'all',
    page: 1,
    limit: 10,
  });

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    organisation: null,
    targetStatus: null,
    loading: false,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    organisation: null,
    loading: false,
  });

  // Central Marketplace Setting state
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(false);
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);
  const [marketplaceModal, setMarketplaceModal] = useState({
    isOpen: false,
    targetEnabled: false,
    loading: false,
  });

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const showToast = (message, type = 'success') => {
    if (type === 'error') {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  // Load Marketplace Setting
  const loadMarketplaceSetting = useCallback(async () => {
    try {
      setMarketplaceLoading(true);
      const res = await fetchMarketplaceSetting();
      if (res && res.data) {
        setMarketplaceEnabled(Boolean(res.data.marketplaceEnabled));
      }
    } catch (err) {
      console.error('Failed to load marketplace setting:', err);
    } finally {
      setMarketplaceLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOrganisations(filters);
      if (res && res.data) {
        setOrganisations(res.data);
        setMeta(res.meta || { page: 1, limit: 10, total: res.data.length, totalPages: 1 });
      } else if (Array.isArray(res)) {
        setOrganisations(res);
      }
    } catch (err) {
      console.error('Failed to load organisations:', err);
      showToast(err.message || 'Failed to fetch organisations', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadMarketplaceSetting();
  }, [loadMarketplaceSetting]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      plan: 'all',
      operatingMode: 'all',
      page: 1,
      limit: 10,
    });
  };

  const handlePageChange = (newPage) => {
    handleFilterChange('page', newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setFilters((prev) => ({ ...prev, limit: newSize, page: 1 }));
  };

  const handleStatusChangeClick = (org, targetStatus) => {
    setStatusModal({
      isOpen: true,
      organisation: org,
      targetStatus,
      loading: false,
    });
  };

  const handleCloseStatusModal = () => {
    setStatusModal({ isOpen: false, organisation: null, targetStatus: null, loading: false });
  };

  const handleConfirmStatusChange = async (newStatus) => {
    if (!statusModal.organisation) return;
    setStatusModal((prev) => ({ ...prev, loading: true }));

    try {
      const res = await updateOrganisationStatus(
        statusModal.organisation.id,
        newStatus,
      );
      showToast(res.message || `Organisation ${newStatus} successfully.`);
      setStatusModal({ isOpen: false, organisation: null, targetStatus: null, loading: false });
      loadData();
    } catch (err) {
      console.error('Status update failed:', err);
      showToast(err.message || 'Failed to update organisation status', 'error');
      setStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteClick = (org) => {
    setDeleteModal({
      isOpen: true,
      organisation: org,
      loading: false,
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, organisation: null, loading: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.organisation) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));

    try {
      await deleteOrganisation(deleteModal.organisation.id);
      showToast('Organisation deleted successfully.');
      setDeleteModal({ isOpen: false, organisation: null, loading: false });
      loadData();
    } catch (err) {
      console.error('Delete organisation failed:', err);
      showToast(err.message || 'Failed to delete organisation', 'error');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Marketplace Toggle Handlers
  const handleMarketplaceToggleClick = () => {
    setMarketplaceModal({
      isOpen: true,
      targetEnabled: !marketplaceEnabled,
      loading: false,
    });
  };

  const handleCloseMarketplaceModal = () => {
    setMarketplaceModal({ isOpen: false, targetEnabled: false, loading: false });
  };

  const handleConfirmMarketplaceToggle = async (targetEnabled, reason) => {
    setMarketplaceModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await updateMarketplaceSetting(targetEnabled, reason);
      setMarketplaceEnabled(targetEnabled);
      showToast(
        res.message ||
          `Central Marketplace has been ${
            targetEnabled ? 'enabled' : 'disabled'
          } successfully.`,
      );
      setMarketplaceModal({ isOpen: false, targetEnabled: false, loading: false });
    } catch (err) {
      console.error('Failed to update marketplace setting:', err);
      showToast(err.message || 'Failed to update marketplace setting', 'error');
      setMarketplaceModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCreateClick = () => {
    navigate('/super-admin/organisations/create');
  };

  return {
    organisations,
    loading,
    viewMode,
    setViewMode,
    meta,
    filters,
    statusModal,
    deleteModal,
    marketplaceEnabled,
    marketplaceLoading,
    marketplaceModal,
    canCreateOrg,
    canEditOrg,
    canDeleteOrg,
    handleFilterChange,
    handleResetFilters,
    handlePageChange,
    handlePageSizeChange,
    handleStatusChangeClick,
    handleCloseStatusModal,
    handleConfirmStatusChange,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleMarketplaceToggleClick,
    handleCloseMarketplaceModal,
    handleConfirmMarketplaceToggle,
    handleCreateClick,
    loadData,
  };
};

/**
 * 2. State Management Hook for Create Organisation Page
 */
export const useOrganisationCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setServerError(null);

    try {
      await createOrganisation(payload);
      navigate('/super-admin/organisations', {
        state: { message: 'Organisation created successfully.' },
      });
    } catch (err) {
      console.error('Failed to create organisation:', err);
      setServerError(err.message || 'Failed to create organisation');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    serverError,
    handleSubmit,
  };
};

/**
 * 3. State Management Hook for Edit Organisation Page
 */
export const useOrganisationEdit = () => {
  const navigate = useNavigate();
  const { organisationId } = useParams();

  const [organisation, setOrganisation] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      setFetchLoading(true);
      try {
        const data = await fetchOrganisationDetails(organisationId);
        setOrganisation(data);
      } catch (err) {
        console.error('Failed to load organisation details:', err);
        setServerError('Failed to load organisation data');
      } finally {
        setFetchLoading(false);
      }
    };

    if (organisationId) {
      loadDetails();
    }
  }, [organisationId]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setServerError(null);

    try {
      await updateOrganisation(organisationId, payload);
      navigate(`/super-admin/organisations/${organisationId}`, {
        state: { message: 'Organisation updated successfully.' },
      });
    } catch (err) {
      console.error('Failed to update organisation:', err);
      setServerError(err.message || 'Failed to update organisation');
    } finally {
      setLoading(false);
    }
  };

  return {
    organisationId,
    organisation,
    fetchLoading,
    loading,
    serverError,
    handleSubmit,
  };
};

/**
 * 4. State Management Hook for Organisation Details Page
 */
export const useOrganisationDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { organisationId } = useParams();
  const { canEdit, canDelete } = usePermission();

  const canEditOrg = canEdit('organizations');
  const canDeleteOrg = canDelete('organizations');

  const [organisation, setOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | branches | users

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    targetStatus: null,
    loading: false,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    loading: false,
  });

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadData = useCallback(async () => {
    if (!organisationId) return;
    setLoading(true);
    try {
      const data = await fetchOrganisationDetails(organisationId);
      setOrganisation(data);
    } catch (err) {
      console.error('Failed to fetch organisation details:', err);
      toast.error(err.message || 'Failed to fetch organisation details');
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenStatusModal = (targetStatus) => {
    setStatusModal({ isOpen: true, targetStatus, loading: false });
  };

  const handleCloseStatusModal = () => {
    setStatusModal({ isOpen: false, targetStatus: null, loading: false });
  };

  const handleConfirmStatusChange = async (newStatus) => {
    setStatusModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await updateOrganisationStatus(organisationId, newStatus);
      toast.success(res.message || `Organisation ${newStatus} successfully.`);
      setStatusModal({ isOpen: false, targetStatus: null, loading: false });
      loadData();
    } catch (err) {
      console.error('Failed status change:', err);
      toast.error(err.message || 'Failed to update status');
      setStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleOpenDeleteModal = () => {
    setDeleteModal({ isOpen: true, loading: false });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, loading: false });
  };

  const handleConfirmDelete = async () => {
    setDeleteModal({ isOpen: true, loading: true });
    try {
      await deleteOrganisation(organisationId);
      toast.success('Organisation deleted successfully.');
      setDeleteModal({ isOpen: false, loading: false });
      navigate('/super-admin/organisations');
    } catch (err) {
      console.error('Failed to delete organisation:', err);
      toast.error(err.message || 'Failed to delete organisation');
      setDeleteModal({ isOpen: false, loading: false });
    }
  };

  const handleBack = () => {
    navigate('/super-admin/organisations');
  };

  const handleEdit = () => {
    navigate(`/super-admin/organisations/${organisationId}/edit`);
  };

  const handleSetup = () => {
    navigate(`/super-admin/organisations/${organisationId}/setup`);
  };

  return {
    organisationId,
    organisation,
    loading,
    activeTab,
    setActiveTab,
    statusModal,
    setStatusModal,
    deleteModal,
    setDeleteModal,
    canEditOrg,
    canDeleteOrg,
    handleOpenStatusModal,
    handleCloseStatusModal,
    handleConfirmStatusChange,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleBack,
    handleEdit,
    handleSetup,
    loadData,
  };
};

/**
 * 5. State Management Hook for Organisation Setup Page
 */
export const useOrganisationSetup = (customOrgId, customIsOwner) => {
  const navigate = useNavigate();
  const { organisationId: routeOrgId } = useParams();
  const { user } = useAuth();
  const [saveMessage, setSaveMessage] = useState('');

  const organisationId = customOrgId !== undefined ? customOrgId : routeOrgId;
  const role = String(user?.roleSlug || user?.role || user?.roleName || '').toLowerCase().replace(/_/g, '-');
  const isOwner = customIsOwner !== undefined ? customIsOwner : (role === 'owner');
  const isSuperAdmin = role === 'super-admin';
  const overviewRoute = isOwner ? '/dashboard' : `/super-admin/organisations/${organisationId}`;

  const [organisation, setOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOwner && !organisationId) return undefined;
    let active = true;
    (isOwner ? fetchOwnerOrganisationSetup() : fetchOrganisationDetails(organisationId))
      .then((result) => {
        if (active) setOrganisation(result);
      })
      .catch((loadError) => {
        console.error('Failed to load organization setup:', loadError);
        if (active) setError(loadError.message || 'Could not load organization setup.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [organisationId, isOwner]);

  const save = async (payload) => {
    setSaving(true);
    setError('');
    try {
      const result = isOwner
        ? await updateOwnerOrganisationSetup(payload)
        : await updateOrganisationSetup(organisationId, payload);
      setOrganisation(result.organisation || result);
      return result;
    } catch (saveError) {
      console.error('Failed to save organization setup:', saveError);
      setError(saveError.message || 'Could not save organization setup.');
      throw saveError;
    } finally {
      setSaving(false);
    }
  };

  const checkSlugAvailability = useCallback(
    (slug) =>
      isOwner
        ? checkOwnerOrganisationSlugAvailability(slug)
        : checkOrganisationSlugAvailability(organisationId, slug),
    [isOwner, organisationId],
  );

  const handleSave = async (payload) => {
    await save(payload);
    if (isOwner) {
      setSaveMessage('Organization setup saved successfully.');
    } else {
      navigate(`/super-admin/organisations/${organisationId}`, {
        state: { message: 'Organization setup saved successfully.' },
      });
    }
  };

  return {
    organisationId,
    organisation,
    loading,
    saving,
    error,
    setError,
    save,
    checkSlugAvailability,
    saveMessage,
    setSaveMessage,
    handleSave,
    isOwner,
    isSuperAdmin,
    overviewRoute,
    navigate,
  };
};

export default {
  useOrganisationList,
  useOrganisationCreate,
  useOrganisationEdit,
  useOrganisationDetails,
  useOrganisationSetup,
};

