import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import SearchInput from '../../../components/shared/SearchInput';
import Badge from '../../../components/shared/Badge';
import EmptyState from '../../../components/shared/EmptyState';
import Loader from '../../../components/shared/Loader';
import Pagination from '../../../components/shared/Pagination';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import ViewToggle from '../../../components/shared/ViewToggle';
import StaffCard from '../components/StaffCard';
import StaffStatusBadge from '../components/StaffStatusBadge';
import StatusChangeModal from '../components/modals/StatusChangeModal';
import LinkUserModal from '../components/modals/LinkUserModal';
import { useStaff } from '../hooks/useStaff';
import { usePermission } from '../../../hooks/usePermission';
import { useAuth } from '../../../hooks/useAuth';
import {
  Users,
  UserPlus,
  Building2,
  AlertTriangle,
  Eye,
  UserCheck,
  Shield,
  Trash2,
  Edit,
  Link,
  Phone,
  Mail,
  User,
  LayoutGrid,
  List,
  MoreVertical,
} from 'lucide-react';

export function StaffListPage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const rawRole =
    role ||
    user?.role ||
    user?.roleSlug ||
    user?.roleName ||
    (Array.isArray(user?.roles) ? user.roles[0] : '') ||
    '';
  const normRole = String(rawRole).toUpperCase().replace(/[\s_-]+/g, '_');
  const allRoles = (user?.roles || []).map((r) => String(r).toUpperCase().replace(/[\s_-]+/g, '_'));
  const isManagement = ['SUPER_ADMIN', 'OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT', 'FRONT_DESK'].some(
    (m) => normRole === m || allRoles.includes(m),
  );
  const isServiceStaff =
    (normRole === 'SERVICE_STAFF' ||
      normRole === 'STAFF' ||
      allRoles.includes('SERVICE_STAFF') ||
      allRoles.includes('STAFF')) &&
    !isManagement;

  useEffect(() => {
    if (isServiceStaff) {
      navigate('/staff/me', { replace: true });
    }
  }, [isServiceStaff, navigate]);

  const {
    staffList,
    total,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    loading,
    error,
    filters,
    updateFilters,
    updateStatus,
    linkUser,
    removeStaff,
    currentBranch,
  } = useStaff();
  const { can } = usePermission();

  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem('sms_staff_view_mode') || 'table',
  );
  const [activeModalStaff, setActiveModalStaff] = useState(null);
  const [modalType, setModalType] = useState(null); // 'status' | 'link' | 'delete'
  const [actionLoading, setActionLoading] = useState(false);

  // Table action menu dropdown state
  const [activeMenuStaffId, setActiveMenuStaffId] = useState(null);
  const tableMenuRef = useRef(null);

  // Close active row action menu when clicking outside
  useEffect(() => {
    if (!activeMenuStaffId) return;
    const handleClickOutside = (e) => {
      if (tableMenuRef.current && !tableMenuRef.current.contains(e.target)) {
        setActiveMenuStaffId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuStaffId]);

  if (isServiceStaff) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" message="Loading your profile..." />
      </div>
    );
  }

  const statusTabs = [
    { label: 'All Staff', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'On Leave', value: 'on_leave' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Terminated', value: 'terminated' },
  ];

  const handleStatusChangeConfirm = async (newStatus, reason) => {
    if (!activeModalStaff) return;
    try {
      setActionLoading(true);
      await updateStatus(activeModalStaff.id, newStatus, reason);
      setActiveModalStaff(null);
      setModalType(null);
    } catch (err) {
      console.error('Failed to change status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLinkUserConfirm = async (userId) => {
    if (!activeModalStaff) return;
    try {
      setActionLoading(true);
      await linkUser(activeModalStaff.id, userId);
      setActiveModalStaff(null);
      setModalType(null);
    } catch (err) {
      console.error('Failed to link user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeModalStaff) return;
    try {
      setActionLoading(true);
      await removeStaff(activeModalStaff.id);
      setActiveModalStaff(null);
      setModalType(null);
    } catch (err) {
      console.error('Failed to delete staff:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Top Header matching BranchListPage */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Staff Management
            </h1>
            {currentBranch && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary-500 bg-primary-500/10 px-2.5 py-0.5 rounded-full border border-primary-500/20">
                <Building2 size={12} />
                {currentBranch.name}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage salon employees, stylists, HR profiles, branch assignments, and credentials.
          </p>
        </div>

        {can('staff.create') && (
          <button
            type="button"
            id="add-staff-btn"
            onClick={() => navigate('/staff/create')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
          >
            <UserPlus size={16} />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* Search and Filters Toolbar (Branch filter removed as topbar controls active branch) */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex-1 min-w-[240px]">
            <SearchInput
              value={filters.search}
              onChange={(val) => updateFilters({ search: val })}
              onClear={() => updateFilters({ search: '' })}
              placeholder="Search staff by name, code, phone, or email..."
            />
          </div>

          {/* Status Tabs and View Toggle */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 justify-between lg:justify-end w-full lg:w-auto">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-color)]">
              {statusTabs.map((tab) => {
                const isSelected = filters.employmentStatus === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => updateFilters({ employmentStatus: tab.value })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* View Toggle (Grid / Table) */}
            <div className="shrink-0 ml-auto lg:ml-2">
              <ViewToggle
                view={viewMode}
                value={viewMode}
                onChange={(mode) => {
                  setViewMode(mode);
                  localStorage.setItem('sms_staff_view_mode', mode);
                }}
                options={[
                  { id: 'grid', label: 'Grid', icon: LayoutGrid, title: 'Grid View' },
                  { id: 'table', label: 'Table', icon: List, title: 'Table View' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Directory: Grid or Table View */}
      {loading ? (
        <Card>
          <div className="py-16 flex justify-center">
            <Loader text="Loading staff records..." />
          </div>
        </Card>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-center text-sm">
          {error}
        </div>
      ) : staffList.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No employees found"
            description={
              filters.search || filters.employmentStatus
                ? 'Try adjusting your search criteria or status filter.'
                : currentBranch
                ? `No staff members found assigned to ${currentBranch.name}. Add your first employee.`
                : 'Get started by creating your first salon employee.'
            }
            action={
              <button
                type="button"
                onClick={() => navigate('/staff/create')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <UserPlus size={15} />
                <span>Add Employee</span>
              </button>
            }
          />
        </Card>
      ) : viewMode === 'grid' ? (
        /* ─── GRID VIEW ─── */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
            {staffList.map((staff) => (
              <StaffCard
                key={staff.id}
                staff={staff}
                onOpenStatusModal={(s) => {
                  setActiveModalStaff(s);
                  setModalType('status');
                }}
                onOpenLinkModal={(s) => {
                  setActiveModalStaff(s);
                  setModalType('link');
                }}
                onOpenDeleteModal={(s) => {
                  setActiveModalStaff(s);
                  setModalType('delete');
                }}
              />
            ))}
          </div>

          {/* Grid View Pagination */}
          {total > 0 && (
            <div className="p-3.5 sm:p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
              <Pagination
                currentPage={page}
                totalPages={totalPages || 1}
                totalItems={total}
                pageSize={limit}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newSize) => {
                  setLimit(newSize);
                  setPage(1);
                }}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            </div>
          )}
        </div>
      ) : (
        /* ─── TABLE VIEW (Matching BranchListPage Table Style) ─── */
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto min-h-[320px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] uppercase tracking-wider text-[11px] font-semibold border-b border-[var(--border-color)]">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Designation & Dept</th>
                    <th className="px-4 py-3">Home Branch</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Account Link</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                  {staffList.map((staff, index) => {
                    const isMenuOpen = activeMenuStaffId === staff.id;
                    const isNearBottom =
                      index >= staffList.length - 2 && staffList.length > 2;

                    const canViewDetails = can('staff.view', staff.homeBranchId);
                    const canManageStatus =
                      can('staff.manage', staff.homeBranchId) ||
                      can('staff.manage_status', staff.homeBranchId) ||
                      can('staff.update', staff.homeBranchId);
                    const canLinkAccount =
                      can('staff.manage', staff.homeBranchId) ||
                      can('staff.link_user', staff.homeBranchId);
                    const canTerminate =
                      can('staff.manage', staff.homeBranchId) ||
                      can('staff.delete', staff.homeBranchId) ||
                      can('staff.terminate', staff.homeBranchId);

                    const menuItems = [
                      ...(canViewDetails
                        ? [
                            {
                              label: 'View Details',
                              icon: Eye,
                              onClick: () => {
                                setActiveMenuStaffId(null);
                                navigate(`/staff/${staff.id}`);
                              },
                            },
                          ]
                        : []),
                      ...(canManageStatus
                        ? [
                            {
                              label: 'Change Status',
                              icon: Edit,
                              onClick: () => {
                                setActiveMenuStaffId(null);
                                setActiveModalStaff(staff);
                                setModalType('status');
                              },
                            },
                          ]
                        : []),
                      ...(!staff.user && canLinkAccount
                        ? [
                            {
                              label: 'Link Login Account',
                              icon: Link,
                              onClick: () => {
                                setActiveMenuStaffId(null);
                                setActiveModalStaff(staff);
                                setModalType('link');
                              },
                            },
                          ]
                        : []),
                      ...(canTerminate
                        ? [
                            {
                              label: 'Terminate Employee',
                              icon: Trash2,
                              danger: true,
                              onClick: () => {
                                setActiveMenuStaffId(null);
                                setActiveModalStaff(staff);
                                setModalType('delete');
                              },
                            },
                          ]
                        : []),
                    ];

                    return (
                      <tr
                        key={staff.id}
                        className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                          isMenuOpen ? 'relative z-30' : ''
                        }`}
                        onClick={() => navigate(`/staff/${staff.id}`)}
                      >
                        {/* Employee Avatar & Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            {staff.profilePhotoUrl ? (
                              <img
                                src={staff.profilePhotoUrl}
                                alt={staff.fullName}
                                className="w-9 h-9 rounded-xl object-cover border border-[var(--border-color)] shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-primary-500/15 text-primary-500 font-bold flex items-center justify-center text-xs shrink-0 border border-primary-500/20">
                                {staff.fullName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-semibold text-sm text-[var(--text-primary)] hover:text-primary-500 transition-colors truncate">
                                  {staff.fullName}
                                </span>
                                {staff.hasMissingEmergencyContact && (
                                  <span
                                    title="Missing Emergency Contact"
                                    className="text-amber-500 inline-flex items-center shrink-0"
                                  >
                                    <AlertTriangle size={13} />
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[var(--text-muted)] block truncate">
                                {staff.contacts?.personalPhone ||
                                  staff.contacts?.personalEmail ||
                                  staff.gender ||
                                  'Employee'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Employee Code */}
                        <td className="px-4 py-3 font-mono font-bold text-primary-500">
                          {staff.employeeCode}
                        </td>

                        {/* Designation & Dept */}
                        <td className="px-4 py-3 text-xs">
                          <p className="font-medium text-[var(--text-primary)] truncate">
                            {staff.currentEmployment?.designation || 'Staff Member'}
                          </p>
                          <p className="text-[var(--text-muted)] text-[11px] truncate">
                            {staff.currentEmployment?.department || 'Operations'}
                          </p>
                        </td>

                        {/* Home Branch */}
                        <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                          <div className="flex items-center space-x-1.5">
                            <Building2 size={13} className="text-primary-500 shrink-0" />
                            <span className="truncate">{staff.homeBranch?.name}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StaffStatusBadge status={staff.employmentStatus} />
                        </td>

                        {/* Linked User Account */}
                        <td className="px-4 py-3">
                          {staff.user ? (
                            <Badge variant="success" size="small">
                              <UserCheck size={11} className="mr-1 inline" />
                              Linked
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="small">
                              No Account
                            </Badge>
                          )}
                        </td>

                        {/* 3-dots Action Menu (Matching BranchListPage) */}
                        <td
                          className="px-4 py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {menuItems.length > 0 ? (
                            <div
                              className="relative inline-block text-left"
                              ref={isMenuOpen ? tableMenuRef : null}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuStaffId(isMenuOpen ? null : staff.id);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                  isMenuOpen
                                    ? 'bg-primary-500/15 text-primary-500 ring-2 ring-primary-500/30'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10'
                                }`}
                                aria-label={`Actions for ${staff.fullName}`}
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
                                            className={
                                              item.danger ? 'text-rose-500' : 'text-primary-500'
                                            }
                                          />
                                        )}
                                        <span>{item.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--text-muted)] opacity-40 select-none">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table View Pagination matching BranchListPage */}
          {total > 0 && (
            <div className="p-3.5 sm:p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
              <Pagination
                currentPage={page}
                totalPages={totalPages || 1}
                totalItems={total}
                pageSize={limit}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newSize) => {
                  setLimit(newSize);
                  setPage(1);
                }}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            </div>
          )}
        </div>
      )}

      {/* Status Change Modal */}
      {modalType === 'status' && activeModalStaff && (
        <StatusChangeModal
          isOpen={true}
          onClose={() => {
            setActiveModalStaff(null);
            setModalType(null);
          }}
          staff={activeModalStaff}
          onConfirm={handleStatusChangeConfirm}
          loading={actionLoading}
        />
      )}

      {/* Link User Account Modal */}
      {modalType === 'link' && activeModalStaff && (
        <LinkUserModal
          isOpen={true}
          onClose={() => {
            setActiveModalStaff(null);
            setModalType(null);
          }}
          staff={activeModalStaff}
          existingStaffList={staffList}
          onLink={handleLinkUserConfirm}
          loading={actionLoading}
        />
      )}

      {/* Terminate / Delete Confirm Dialog */}
      {modalType === 'delete' && activeModalStaff && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => {
            setActiveModalStaff(null);
            setModalType(null);
          }}
          onConfirm={handleDeleteConfirm}
          title={`Terminate Employee – ${activeModalStaff.fullName}`}
          message={`Are you sure you want to terminate ${activeModalStaff.fullName} (${activeModalStaff.employeeCode})? If historical attendance, commissions, or appointments exist, the profile will be safely archived and marked as Terminated without losing historical records.`}
          confirmText="Confirm Termination"
          cancelText="Cancel"
          variant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
}

export default StaffListPage;
