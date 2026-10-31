import React from 'react';
import {
  Building2,
  Plus,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  MapPin,
  CheckCircle2,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
} from 'lucide-react';
import BranchCard from '../components/BranchCard';
import BranchStatusBadge from '../components/BranchStatusBadge';
import BranchTypeBadge from '../components/BranchTypeBadge';
import BranchDeleteModal from '../components/BranchDeleteModal';
import CopySettingsModal from '../components/CopySettingsModal';
import Pagination from '../../../components/shared/Pagination';
import SearchInput from '../../../components/shared/SearchInput';
import CustomSelector from '../../../components/shared/CustomSelector';
import ViewToggle from '../../../components/shared/ViewToggle';
import UnauthorizedAccess from '../../../components/shared/UnauthorizedAccess';
import { useBranchList } from '../hooks/useBranch';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'temporarily_closed', label: 'Temporarily Closed' },
  { value: 'permanently_closed', label: 'Permanently Closed' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'flagship', label: 'Flagship' },
  { value: 'standard', label: 'Standard' },
  { value: 'kiosk', label: 'Kiosk' },
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest Created' },
  { value: 'name:asc', label: 'Name A-Z' },
  { value: 'code:asc', label: 'Code A-Z' },
  { value: 'launchedAt:desc', label: 'Launch Date' },
];

export const BranchListPage = () => {
  const {
    // Data & Async
    branchesData,
    meta,
    loading,
    error,
    handleRefresh,

    // Filters & Pagination
    search,
    statusFilter,
    typeFilter,
    sortBy,
    sortOrder,
    viewMode,
    page,
    limit,
    setViewMode,
    setPage,
    setLimit,
    handleSearchChange,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handleSortChange,
    handleResetFilters,

    // Permissions & Context
    isOwner,
    canViewBranch,
    canCreateBranch,
    canEditBranch,
    canDeleteBranch,
    canEdit,
    canDelete,
    currentBranch,
    isSuperAdmin,
    effectiveOrgId,

    // Modals & Menu
    deleteModalBranch,
    setDeleteModalBranch,
    copyModalBranch,
    setCopyModalBranch,
    activeMenuBranchId,
    setActiveMenuBranchId,
    tableMenuRef,

    // Navigation
    handleCreateBranchNavigate,
    handleBranchDetailsNavigate,
    handleBranchEditNavigate,
  } = useBranchList();

  if (!canViewBranch) {
    return (
      <UnauthorizedAccess
        title="Access Restricted"
        message="You do not have the necessary permissions required to view or access salon branches in this organization."
        requiredPermission="branches.view"
        resourceName="Branch Management"
      />
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Branch Management
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage your salon chain locations, operational units, facilities, and working scopes.
          </p>
        </div>

        {canCreateBranch && (
          <button
            type="button"
            id="add-branch-btn"
            onClick={handleCreateBranchNavigate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Add New Branch</span>
          </button>
        )}
      </div>

      {/* Search and Filters Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex-1 min-w-[240px]">
            <SearchInput
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onClear={() => handleSearchChange('')}
              placeholder="Search branches by name or code (e.g. BLR-01)..."
            />
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Status Filter */}
            <div className="w-36">
              <CustomSelector
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={handleStatusFilterChange}
                placeholder="Status"
                isSearchable={false}
                isClearable={false}
              />
            </div>

            {/* Type Filter */}
            <div className="w-36">
              <CustomSelector
                options={TYPE_OPTIONS}
                value={typeFilter}
                onChange={handleTypeFilterChange}
                placeholder="Type"
                isSearchable={false}
                isClearable={false}
              />
            </div>

            {/* Sort Selector */}
            <div className="w-44">
              <CustomSelector
                options={SORT_OPTIONS}
                value={`${sortBy}:${sortOrder}`}
                onChange={handleSortChange}
                placeholder="Sort by"
                isSearchable={false}
                isClearable={false}
              />
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
              title="Refresh branches list"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Bottom Filter Info / Active Filters Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[var(--text-primary)]">{branchesData.length}</strong> of{' '}
              <strong className="text-[var(--text-primary)]">{meta.total}</strong> locations
            </span>

            {(statusFilter !== 'all' || typeFilter !== 'all' || search) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-primary-500 hover:underline font-semibold ml-2"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="ml-auto">
            <ViewToggle
              view={viewMode}
              value={viewMode}
              onChange={setViewMode}
              options={[
                { id: 'grid', label: 'Grid', icon: LayoutGrid, title: 'Grid View' },
                { id: 'table', label: 'Table', icon: List, title: 'Table View' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Super Admin Organization Hint */}
      {isSuperAdmin && !effectiveOrgId && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center gap-2">
          <Building2 size={16} className="shrink-0" />
          <span>
            Please select an organization in the top navigation bar to view its specific branch locations.
          </span>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[var(--text-muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-2" />
          <p className="text-xs font-semibold">Loading branch network...</p>
        </div>
      ) : error ? (
        String(error).toLowerCase().includes('permission') ||
        String(error).toLowerCase().includes('forbidden') ||
        String(error).toLowerCase().includes('403') ? (
          <UnauthorizedAccess
            title="Access Restricted"
            message={error}
            requiredPermission="branches.view"
            resourceName="Branch Management"
            onRetry={handleRefresh}
          />
        ) : (
          <div className="p-8 text-center rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-500">
            <p className="font-semibold text-sm">{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-3 px-4 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition"
            >
              Retry
            </button>
          </div>
        )
      ) : branchesData.length === 0 ? (
        /* EMPTY STATE */
        search || statusFilter !== 'all' || typeFilter !== 'all' ? (
          <div className="p-12 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
            <Filter className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">No matching branches found</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
              No branch matches your active filter criteria. Try clearing search keywords or resetting filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-white/5 border border-[var(--border-color)] text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
            <Building2 className="w-12 h-12 text-primary-500/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">No branches created yet</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
              Your organization doesn't have any operational salon branches set up. Add your first flagship or standard salon location to begin.
            </p>
            {canCreateBranch ? (
              <button
                type="button"
                onClick={handleCreateBranchNavigate}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition hover:scale-105 active:scale-95"
              >
                <Plus size={16} />
                <span>Create First Branch</span>
              </button>
            ) : (
              <p className="text-xs text-amber-500 mt-3">
                Contact an administrator or owner to create a salon branch.
              </p>
            )}
          </div>
        )
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (Only real branches) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {branchesData.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onOpenDeleteModal={setDeleteModalBranch}
              onOpenCopyModal={setCopyModalBranch}
              canManage={canEditBranch || canDeleteBranch}
            />
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
          <div className="overflow-x-auto min-h-[320px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] uppercase tracking-wider text-[11px] font-semibold border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Branch Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">City / Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                {branchesData.map((branch, index) => {
                  const isCurrentActive = currentBranch?.id === branch.id;
                  const canEditItem = isSuperAdmin || canEditBranch || canEdit('branches', branch.id);
                  const canDeleteItem = isSuperAdmin || canDeleteBranch || canDelete('branches', branch.id);
                  const isMenuOpen = activeMenuBranchId === branch.id;
                  const isNearBottom = index >= branchesData.length - 2 && branchesData.length > 2;

                  const menuItems = [
                    {
                      label: 'View Details',
                      icon: Eye,
                      onClick: () => {
                        setActiveMenuBranchId(null);
                        handleBranchDetailsNavigate(branch.id);
                      },
                    },
                    ...(canEditItem
                      ? [
                          {
                            label: 'Edit Profile',
                            icon: Edit,
                            onClick: () => {
                              setActiveMenuBranchId(null);
                              handleBranchEditNavigate(branch.id);
                            },
                          },
                          {
                            label: 'Copy Settings From...',
                            icon: Copy,
                            onClick: () => {
                              setActiveMenuBranchId(null);
                              setCopyModalBranch(branch);
                            },
                          },
                        ]
                      : []),
                    ...(canDeleteItem
                      ? [
                          {
                            label: 'Delete or Close Branch',
                            icon: Trash2,
                            danger: true,
                            onClick: () => {
                              setActiveMenuBranchId(null);
                              setDeleteModalBranch(branch);
                            },
                          },
                        ]
                      : []),
                  ];

                  return (
                    <tr
                      key={branch.id}
                      className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                        isCurrentActive ? 'bg-primary-500/5' : ''
                      } ${isMenuOpen ? 'relative z-30' : ''}`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-primary-500">
                        {branch.code}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        <button
                          type="button"
                          onClick={() => handleBranchDetailsNavigate(branch.id)}
                          className="hover:text-primary-500 transition-colors text-left"
                        >
                          {branch.name}
                        </button>
                        {isCurrentActive && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <BranchTypeBadge type={branch.branchType} />
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {branch.branchAddress?.city || 'Not set'}
                      </td>
                      <td className="px-4 py-3">
                        <BranchStatusBadge status={branch.status} />
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {branch._count?.staff || 0} staff
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div
                          className="relative inline-block text-left"
                          ref={isMenuOpen ? tableMenuRef : null}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuBranchId(isMenuOpen ? null : branch.id);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                              isMenuOpen
                                ? 'bg-primary-500/15 text-primary-500 ring-2 ring-primary-500/30'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10'
                            }`}
                            aria-label={`Branch actions for ${branch.name}`}
                            aria-expanded={isMenuOpen}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute right-0 ${
                                isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                              } w-48 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left`}
                            >
                              {menuItems.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      item.onClick();
                                    }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                                      item.danger
                                        ? 'text-rose-500 hover:bg-rose-500/10'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                                    }`}
                                  >
                                    {Icon && (
                                      <Icon
                                        size={14}
                                        className={item.danger ? 'text-rose-500' : 'text-primary-500'}
                                      />
                                    )}
                                    <span>{item.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta.total > 0 && !loading && (
        <Pagination
          currentPage={page}
          totalPages={meta.totalPages || 1}
          totalItems={meta.total}
          pageSize={limit}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setLimit(newSize);
            setPage(1);
          }}
          pageSizeOptions={[6, 9, 12, 18, 24]}
        />
      )}

      {/* Modals */}
      {deleteModalBranch && (
        <BranchDeleteModal
          isOpen={Boolean(deleteModalBranch)}
          onClose={() => setDeleteModalBranch(null)}
          branch={deleteModalBranch}
          onSuccess={handleRefresh}
        />
      )}

      {copyModalBranch && (
        <CopySettingsModal
          isOpen={Boolean(copyModalBranch)}
          onClose={() => setCopyModalBranch(null)}
          targetBranch={copyModalBranch}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default BranchListPage;
