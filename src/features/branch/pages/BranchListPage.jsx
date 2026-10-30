import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { fetchBranches } from '../api/branchApi';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import BranchCard from '../components/BranchCard';
import BranchStatusBadge from '../components/BranchStatusBadge';
import BranchTypeBadge from '../components/BranchTypeBadge';
import BranchDeleteModal from '../components/BranchDeleteModal';
import CopySettingsModal from '../components/CopySettingsModal';
import Pagination from '../../../components/shared/Pagination';
import SearchInput from '../../../components/shared/SearchInput';
import CustomSelector from '../../../components/shared/CustomSelector';
import ViewToggle from '../../../components/shared/ViewToggle';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canCreate, canEdit, canDelete } = usePermission();
  const { currentBranch, setCurrentBranch, refreshBranches } = useBranch();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();

  const userRole = String(
    user?.roleSlug || user?.role || user?.roleName || '',
  ).toLowerCase().replace(/_/g, '-');
  const isOwner = userRole === 'owner' || userRole === 'super-admin' || isSuperAdmin;

  const canCreateBranch = isOwner || canCreate('branches');
  const canEditBranch = isOwner || canEdit('branches');
  const canDeleteBranch = isOwner || canDelete('branches');

  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Pagination & Data State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [branchesData, setBranchesData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals State
  const [deleteModalBranch, setDeleteModalBranch] = useState(null);
  const [copyModalBranch, setCopyModalBranch] = useState(null);
  const [activeMenuBranchId, setActiveMenuBranchId] = useState(null);
  const tableMenuRef = useRef(null);

  useEffect(() => {
    if (!activeMenuBranchId) return;
    const handleOutsideClick = (e) => {
      if (tableMenuRef.current && !tableMenuRef.current.contains(e.target)) {
        setActiveMenuBranchId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeMenuBranchId]);

  const loadData = useCallback(async () => {
    if (isSuperAdmin && !effectiveOrgId) {
      setBranchesData([]);
      setMeta({ total: 0, totalPages: 1 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetchBranches({
        organizationId: effectiveOrgId,
        search,
        status: statusFilter,
        branchType: typeFilter,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res)
        ? res
        : [];
      setBranchesData(list);

      const total = res?.meta?.total ?? res?.total ?? list.length;
      const totalPages = res?.meta?.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 1);
      setMeta({
        total,
        totalPages: totalPages || 1,
        page: res?.meta?.page ?? page,
        limit: res?.meta?.limit ?? limit,
      });
    } catch (err) {
      console.error('Failed to load branches:', err);
      setError(err?.message || 'Failed to fetch salon branches');
    } finally {
      setLoading(false);
    }
  }, [effectiveOrgId, isSuperAdmin, search, statusFilter, typeFilter, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    await loadData();
    await refreshBranches();
  };

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
            onClick={() => navigate('/branches/create')}
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onClear={() => {
                setSearch('');
                setPage(1);
              }}
              placeholder="Search branches by name or code (e.g. BLR-01)..."
            />
          </div>

          {/* Quick Filters and View Modes */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="w-40 sm:w-44">
              <CustomSelector
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val || 'all');
                  setPage(1);
                }}
                options={STATUS_OPTIONS}
                isSearchable={false}
                isClearable={false}
                placeholder="Filter Status"
              />
            </div>

            {/* Branch Type Filter */}
            <div className="w-36 sm:w-40">
              <CustomSelector
                value={typeFilter}
                onChange={(val) => {
                  setTypeFilter(val || 'all');
                  setPage(1);
                }}
                options={TYPE_OPTIONS}
                isSearchable={false}
                isClearable={false}
                placeholder="Filter Type"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="w-40 sm:w-44">
              <CustomSelector
                value={`${sortBy}:${sortOrder}`}
                onChange={(val) => {
                  if (val) {
                    const [sb, so] = val.split(':');
                    setSortBy(sb);
                    setSortOrder(so);
                    setPage(1);
                  }
                }}
                options={SORT_OPTIONS}
                isSearchable={false}
                isClearable={false}
                placeholder="Sort by"
              />
            </div>

            {/* View Mode Toggle */}
            <ViewToggle
              view={viewMode}
              onChange={setViewMode}
              options={[
                { id: 'grid', label: 'Grid', icon: LayoutGrid, title: 'Grid View' },
                { id: 'table', label: 'Table', icon: List, title: 'Table View' },
              ]}
            />

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              className="h-10 px-3 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] transition-colors flex items-center justify-center cursor-pointer shadow-sm"
              title="Refresh Branches"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-[var(--text-muted)]">
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary-500" />
          <p className="text-xs font-semibold">Loading salon branches...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center text-rose-500 text-sm">
          {error}
        </div>
      ) : branchesData.length === 0 ? (
        /* Empty State */
        search || statusFilter !== 'all' || typeFilter !== 'all' ? (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/15 text-primary-500 flex items-center justify-center mx-auto mb-4">
              <Building2 size={32} />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
              No matching branches found
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              Try adjusting your search keywords or filter settings.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            {canCreateBranch ? (
              <button
                type="button"
                onClick={() => navigate('/branches/create')}
                className="group border-2 border-dashed border-[var(--border-color)] hover:border-primary-500/50 rounded-2xl p-10 max-w-md w-full flex flex-col items-center justify-center text-center bg-[var(--bg-card)]/50 hover:bg-primary-500/5 transition-all cursor-pointer shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm">
                  <Plus size={28} />
                </div>
                <h4 className="text-base font-bold text-[var(--text-primary)] group-hover:text-primary-500 transition-colors">
                  Add New Location
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-[260px]">
                  Create a new salon suite, express kiosk, or flagship studio.
                </p>
              </button>
            ) : (
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center max-w-lg mx-auto">
                <Building2 size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                  No branches added yet
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Contact an administrator or owner to create a salon branch.
                </p>
              </div>
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
                  const canEditItem = isOwner || canEditBranch || canEdit('branches', branch.id);
                  const canDeleteItem = isOwner || canDeleteBranch || canDelete('branches', branch.id);
                  const isMenuOpen = activeMenuBranchId === branch.id;
                  const isNearBottom = index >= branchesData.length - 2 && branchesData.length > 2;

                  const menuItems = [
                    {
                      label: 'View Details',
                      icon: Eye,
                      onClick: () => {
                        setActiveMenuBranchId(null);
                        navigate(`/branches/${branch.id}`);
                      },
                    },
                    ...(canEditItem
                      ? [
                          {
                            label: 'Edit Profile',
                            icon: Edit,
                            onClick: () => {
                              setActiveMenuBranchId(null);
                              navigate(`/branches/${branch.id}/edit`);
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
                          onClick={() => navigate(`/branches/${branch.id}`)}
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
          pageSizeOptions={[10, 25, 50, 100]}
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
