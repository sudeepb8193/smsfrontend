import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchOrganisations,
  updateOrganisationStatus,
  deleteOrganisation,
} from '../api/organisationApi';
import OrganisationFilters from '../components/OrganisationFilters';
import OrganisationTable from '../components/OrganisationTable';
import OrganisationGrid from '../components/OrganisationGrid';
import StatusChangeModal from '../components/StatusChangeModal';
import DeleteOrganisationModal from '../components/DeleteOrganisationModal';
import Button from '../../../components/shared/Button';
import Pagination from '../../../components/shared/Pagination';

export const OrganisationListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    plan: 'all',
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      plan: 'all',
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

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            Organisations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage all registered salon organisations, owner accounts, and active subscriptions
          </p>
        </div>

        <Button
          icon={Plus}
          onClick={() => navigate('/super-admin/organisations/create')}
          className="self-start sm:self-auto"
        >
          Create Organisation
        </Button>
      </div>

      {/* Unified Card Container (Filters + View Toggle + Table/Grid) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
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
            onStatusChange={handleStatusChangeClick}
            onDeleteClick={handleDeleteClick}
          />
        ) : (
          <OrganisationGrid
            organisations={organisations}
            loading={loading}
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
    </div>
  );
};

export default OrganisationListPage;
