import React from 'react';
import { Plus, Building2, Store, RefreshCw } from 'lucide-react';
import OrganisationFilters from '../components/OrganisationFilters';
import OrganisationTable from '../components/OrganisationTable';
import OrganisationGrid from '../components/OrganisationGrid';
import StatusChangeModal from '../components/StatusChangeModal';
import DeleteOrganisationModal from '../components/DeleteOrganisationModal';
import MarketplaceToggleModal from '../components/MarketplaceToggleModal';
import Button from '../../../components/shared/Button';
import Pagination from '../../../components/shared/Pagination';
import { useOrganisationList } from '../hooks/useOrganisation';

export const OrganisationListPage = () => {
  const {
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
  } = useOrganisationList();

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
            onClick={handleCreateClick}
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
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={statusModal.isOpen}
        onClose={handleCloseStatusModal}
        onConfirm={handleConfirmStatusChange}
        organisation={statusModal.organisation}
        targetStatus={statusModal.targetStatus}
        loading={statusModal.loading}
      />

      {/* Delete Modal */}
      <DeleteOrganisationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        organisation={deleteModal.organisation}
        loading={deleteModal.loading}
      />

      {/* Marketplace Toggle Modal */}
      <MarketplaceToggleModal
        isOpen={marketplaceModal.isOpen}
        onClose={handleCloseMarketplaceModal}
        onConfirm={handleConfirmMarketplaceToggle}
        targetEnabled={marketplaceModal.targetEnabled}
        loading={marketplaceModal.loading}
      />
    </div>
  );
};

export default OrganisationListPage;
