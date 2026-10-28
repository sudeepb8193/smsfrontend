import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Building2, Store, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchOrganisations,
  updateOrganisationStatus,
  deleteOrganisation,
  fetchMarketplaceSetting,
  updateMarketplaceSetting,
} from '../api/organisationApi';
import OrganisationFilters from '../components/OrganisationFilters';
import OrganisationTable from '../components/OrganisationTable';
import OrganisationGrid from '../components/OrganisationGrid';
import StatusChangeModal from '../components/StatusChangeModal';
import DeleteOrganisationModal from '../components/DeleteOrganisationModal';
import MarketplaceToggleModal from '../components/MarketplaceToggleModal';
import Button from '../../../components/shared/Button';
import Pagination from '../../../components/shared/Pagination';
import { usePermission } from '../../../hooks/usePermission';

export const OrganisationListPage = () => {
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

  const handleStatusChangeClick = (org, targetStatus) => {
    setStatusModal({
      isOpen: true,
      organisation: org,
      targetStatus,
      loading: false,
    });
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

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary-500" />
            Organisations
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage all registered salon organisations, owner accounts, operating modes, and active subscriptions
          </p>
        </div>

        {canCreateOrg && (
          <Button
            icon={Plus}
            onClick={() => navigate('/super-admin/organisations/create')}
            className="self-start sm:self-auto"
          >
            Create Organisation
          </Button>
        )}
      </div>

      {/* Global Central Marketplace Availability Banner */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-5 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl border shrink-0 transition-colors ${
                marketplaceEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              <Store className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Central Marketplace Availability
                </h2>
                {marketplaceLoading ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-500/10 text-[var(--text-muted)]">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Checking...
                  </span>
                ) : marketplaceEnabled ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Marketplace Active (Discoverable)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Marketplace Disabled
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                When active, organisations configured with <span className="text-[var(--text-primary)] font-medium">Central Marketplace</span> mode and published status are discoverable to public consumers on the marketplace portal.
                Direct website bookings on individual salon domains remain available regardless of this setting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={handleMarketplaceToggleClick}
              disabled={marketplaceLoading}
              aria-label="Toggle Central Marketplace Availability"
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                marketplaceEnabled ? 'bg-emerald-500' : 'bg-neutral-600'
              } ${marketplaceLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  marketplaceEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] w-14">
              {marketplaceEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Unified Card Container (Filters + View Toggle + Table/Grid) */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-md overflow-hidden transition-colors">
        <OrganisationFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {viewMode === 'list' ? (
          <OrganisationTable
            organisations={organisations}
            loading={loading}
            canEdit={canEditOrg}
            canDelete={canDeleteOrg}
            onStatusChange={handleStatusChangeClick}
            onDeleteClick={handleDeleteClick}
          />
        ) : (
          <OrganisationGrid
            organisations={organisations}
            loading={loading}
            canEdit={canEditOrg}
            canDelete={canDeleteOrg}
            onStatusChange={handleStatusChangeClick}
            onDeleteClick={handleDeleteClick}
          />
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        pageSize={filters.limit}
        onPageChange={(newPage) => handleFilterChange('page', newPage)}
        onPageSizeChange={(newSize) => {
          setFilters((prev) => ({ ...prev, limit: newSize, page: 1 }));
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, organisation: null, targetStatus: null, loading: false })}
        onConfirm={handleConfirmStatusChange}
        organisation={statusModal.organisation}
        targetStatus={statusModal.targetStatus}
        loading={statusModal.loading}
      />

      {/* Delete Modal */}
      <DeleteOrganisationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, organisation: null, loading: false })}
        onConfirm={handleConfirmDelete}
        organisation={deleteModal.organisation}
        loading={deleteModal.loading}
      />

      {/* Marketplace Toggle Modal */}
      <MarketplaceToggleModal
        isOpen={marketplaceModal.isOpen}
        onClose={() => setMarketplaceModal({ isOpen: false, targetEnabled: false, loading: false })}
        onConfirm={handleConfirmMarketplaceToggle}
        targetEnabled={marketplaceModal.targetEnabled}
        loading={marketplaceModal.loading}
      />
    </div>
  );
};

export default OrganisationListPage;

