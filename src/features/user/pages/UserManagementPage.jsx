import React from 'react';
import {
  Users,
  ShieldCheck,
  RefreshCw,
  UserPlus,
  Star,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  History,
  Mail,
  Phone,
  Building2,
  Clock,
  RotateCcw,
  Trash2,
  AlertTriangle,
  LayoutGrid,
  List,
  Shield,
  Key,
  ExternalLink,
  Lock,
  Pencil,
  UserX,
  UserCheck,
} from 'lucide-react';

// Shared Components
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Card from '../../../components/shared/Card';
import Modal from '../../../components/shared/Modal';
import SearchInput from '../../../components/shared/SearchInput';
import CustomSelector from '../../../components/shared/CustomSelector';
import UnderlineTabs from '../../../components/shared/UnderlineTabs';
import Loader from '../../../components/shared/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import ViewToggle from '../../../components/shared/ViewToggle';
import Pagination from '../../../components/shared/Pagination';

// Feature Components
import UserRoleChips from '../components/UserRoleChips';
import AddRoleModal from '../components/AddRoleModal';
import RemoveRoleImpactModal from '../components/RemoveRoleImpactModal';
import BulkRoleAssignModal from '../components/BulkRoleAssignModal';
import EffectivePermissionsDrawer from '../components/EffectivePermissionsDrawer';
import RoleAssignmentHistoryLog from '../components/RoleAssignmentHistoryLog';
import InviteUserModal from '../components/InviteUserModal';
import EditUserModal from '../components/EditUserModal';
import ChangeStatusModal from '../components/ChangeStatusModal';

// State Management Hook
import { useUserManagement } from '../hooks/useUser';

// Helper for Initials
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const UserManagementPage = () => {
  const {
    user,
    canCreateUser,
    canEditUser,
    canDeleteUser,
    canManageRoles,
    isBranchManager,
    isOwner,
    isSuperAdmin,
    effectiveOrgId,
    effectiveOrgName,
    users,
    availableRoles,
    availableBranches,
    loading,
    loadData,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    branchFilter,
    setBranchFilter,
    statusFilterOptions,
    roleFilterOptions,
    branchFilterOptions,
    page,
    setPage,
    limit,
    setLimit,
    selectedUser,
    setSelectedUser,
    userDetails,
    detailsLoading,
    activeTab,
    setActiveTab,
    handleSelectUser,
    isInviteModalOpen,
    setIsInviteModalOpen,
    isEditUserOpen,
    setIsEditUserOpen,
    userToEdit,
    setUserToEdit,
    isAddRoleOpen,
    setIsAddRoleOpen,
    isRemoveImpactOpen,
    setIsRemoveImpactOpen,
    roleToRemove,
    setRoleToRemove,
    isBulkAssignOpen,
    setIsBulkAssignOpen,
    actionLoading,
    resendingId,
    userToDelete,
    setUserToDelete,
    deleteBlockerInfo,
    setDeleteBlockerInfo,
    deleting,
    statusModalUser,
    setStatusModalUser,
    filteredUsers,
    paginatedTableUsers,
    activeCount,
    pendingCount,
    expiredCount,
    handleResetFilters,
    handleInviteSuccess,
    handleResendInvite,
    handleOpenEditUser,
    handleUserUpdated,
    handleConfirmDelete,
    handleMakePrimary,
    handleAssignRoleSubmit,
    handleOpenRemoveModal,
    handleConfirmRoleRemoval,
  } = useUserManagement();

  const navigationTabs = [
    {
      id: 'effective-permissions',
      label: 'Effective Permissions Union',
      icon: Sparkles,
      count: userDetails?.effectivePermissions?.length,
    },
    {
      id: 'history',
      label: 'Assignment Audit Log',
      icon: History,
      count:
        (userDetails?.activeRoles?.length || 0) +
        (userDetails?.historicalRoles?.length || 0),
    },
  ];

  const deleteModalFooter = (
    <div className="flex items-center justify-end gap-2.5 w-full">
      <Button
        variant="secondary"
        size="medium"
        onClick={() => {
          setUserToDelete(null);
          setDeleteBlockerInfo(null);
        }}
      >
        Cancel
      </Button>
      {deleteBlockerInfo ? (
        <Button
          variant="primary"
          size="medium"
          onClick={() => {
            const target = userToDelete;
            setUserToDelete(null);
            setDeleteBlockerInfo(null);
            setStatusModalUser(target);
          }}
        >
          Deactivate Account Instead
        </Button>
      ) : (
        <Button
          variant="danger"
          size="medium"
          disabled={deleting}
          loading={deleting}
          onClick={handleConfirmDelete}
        >
          Delete User
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4 pb-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Following Standard Clean SMS Page Header)                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              User Management & Access Control
            </h1>
            {effectiveOrgName && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/30">
                {effectiveOrgName}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Create and invite logins, manage primary roles, branch assignments, and secure account credentials.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="h-10 px-3.5 text-xs font-semibold rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            title="Refresh Users List"
            aria-label="Refresh Users List"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {canManageRoles && (
            <button
              type="button"
              onClick={() => setIsBulkAssignOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99]"
            >
              <ShieldCheck size={16} className="text-primary-500" />
              <span>Bulk Assign</span>
            </button>
          )}

          {canCreateUser && (
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus size={16} />
              <span>+ Invite User</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUMMARY KPI METRICS ROW                                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold mb-1">
            <span>Total Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {users.length}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            Registered directory logins
          </div>
        </div>

        {/* Active Accounts */}
        <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold mb-1">
            <span>Active Logins</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {activeCount}
          </div>
          <div className="text-[11px] text-emerald-500 font-medium mt-0.5">
            Authorized & active credentials
          </div>
        </div>

        {/* Pending Invitations */}
        <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold mb-1">
            <span>Pending Invites</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {pendingCount}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            {expiredCount > 0 ? (
              <span className="text-rose-500 font-semibold">{expiredCount} invite link(s) expired</span>
            ) : (
              'Awaiting password setup'
            )}
          </div>
        </div>

        {/* Available Roles */}
        <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-semibold mb-1">
            <span>Defined Roles</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Shield size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {availableRoles.length}
          </div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            Across {availableBranches.length} branch location{availableBranches.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SEARCH & FILTERS TOOLBAR                                               */}
      {/* ========================================================================= */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex-1 min-w-[240px]">
            <SearchInput
              placeholder="Search by name, email, phone, or role..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              onClear={() => {
                setSearchQuery('');
                setPage(1);
              }}
            />
          </div>

          {/* Quick Filters and View Modes */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="w-36 sm:w-40">
              <CustomSelector
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val || 'all');
                  setPage(1);
                }}
                options={statusFilterOptions}
                placeholder="All Statuses"
                isSearchable={false}
                isClearable={false}
              />
            </div>

            {/* Role Filter */}
            <div className="w-40 sm:w-44">
              <CustomSelector
                value={roleFilter}
                onChange={(val) => {
                  setRoleFilter(val || '');
                  setPage(1);
                }}
                options={roleFilterOptions}
                placeholder="All Roles"
                searchPlaceholder="Search roles..."
                isSearchable={true}
                isClearable={true}
              />
            </div>

            {/* Branch Filter */}
            <div className="w-40 sm:w-44">
              <CustomSelector
                value={branchFilter}
                onChange={(val) => {
                  setBranchFilter(val || '');
                  setPage(1);
                }}
                options={branchFilterOptions}
                placeholder="All Branches"
                searchPlaceholder="Search branches..."
                isSearchable={true}
                isClearable={true}
              />
            </div>

            {/* View Mode Toggle */}
            <ViewToggle
              view={viewMode}
              onChange={setViewMode}
              options={[
                { id: 'split', label: 'Split', icon: LayoutGrid, title: 'Master-Detail View' },
                { id: 'table', label: 'Table', icon: List, title: 'Full Table View' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT AREA (Split View or Table View)                           */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-16 text-center">
          <Loader text="Loading salon user accounts and permissions..." size="medium" />
        </div>
      ) : filteredUsers.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/15 text-primary-500 flex items-center justify-center mx-auto mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
            No matching users found
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-5">
            Try adjusting your search terms or clearing your status, role, or branch filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-all shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ======================================================================= */
        /* FULL DIRECTORY TABLE VIEW (Matching BranchListPage Pattern)             */
        /* ======================================================================= */
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-input)] text-[var(--text-secondary)] uppercase tracking-wider text-[11px] font-semibold border-b border-[var(--border-color)]">
                  <tr>
                    <th className="px-4 py-3">User Profile</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Primary Role</th>
                    <th className="px-4 py-3">Home Branch Scope</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Login</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                  {paginatedTableUsers.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    const primaryRole = u.primaryRole;
                    const isExpired = u.isInviteExpired;

                    return (
                      <tr
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary-500/5' : ''
                        }`}
                      >
                        {/* User Profile */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 font-bold text-xs flex items-center justify-center shrink-0">
                              {getInitials(u.displayName)}
                            </div>
                            <div>
                              <span className="font-bold text-[var(--text-primary)] block hover:text-primary-500 transition-colors">
                                {u.displayName}
                              </span>
                              <span className="text-[11px] text-[var(--text-secondary)]">
                                {u.email || 'No email registered'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">
                          {u.phoneNumber ? (
                            <span className="inline-flex items-center gap-1">
                              <Phone size={12} className="text-[var(--text-muted)]" />
                              {u.phoneCountryCode ? `${u.phoneCountryCode} ` : ''}
                              {u.phoneNumber}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>

                        {/* Primary Role */}
                        <td className="px-4 py-3">
                          {primaryRole ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20">
                              <Star size={11} className="fill-primary-500 text-primary-500" />
                              {primaryRole.name}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[var(--text-muted)] italic">
                              No Role Assigned
                            </span>
                          )}
                        </td>

                        {/* Home Branch */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                            <Building2 size={13} className="text-primary-500" />
                            {u.homeBranch?.name || 'All Branches Scope'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {u.status === 'active' && (
                            <Badge variant="success" size="small">
                              <CheckCircle2 size={11} /> Active
                            </Badge>
                          )}
                          {u.status === 'pending_invite' && !isExpired && (
                            <Badge variant="warning" size="small">
                              <Clock size={11} /> Invite Sent
                            </Badge>
                          )}
                          {u.status === 'pending_invite' && isExpired && (
                            <Badge variant="danger" size="small">
                              <AlertCircle size={11} /> Expired
                            </Badge>
                          )}
                          {u.status === 'suspended' && (
                            <Badge variant="warning" size="small">
                              Suspended
                            </Badge>
                          )}
                          {u.status === 'deactivated' && (
                            <Badge variant="neutral" size="small">
                              Deactivated
                            </Badge>
                          )}
                        </td>

                        {/* Last Login */}
                        <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)] font-mono">
                          {u.lastLoginAt
                            ? new Date(u.lastLoginAt).toLocaleString(undefined, {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : 'Never logged in'}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectUser(u);
                                setViewMode('split');
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-color)] transition-all flex items-center gap-1 cursor-pointer"
                              title="Inspect Details and Roles"
                            >
                              <span>Manage</span>
                              <ChevronRight size={12} />
                            </button>

                            {u.status === 'pending_invite' && (
                              <button
                                type="button"
                                onClick={(e) => handleResendInvite(u.id, e)}
                                disabled={resendingId === u.id}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white border border-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
                                title="Resend Invite Link"
                              >
                                <RotateCcw size={11} className={resendingId === u.id ? 'animate-spin' : ''} />
                                <span>Resend</span>
                              </button>
                            )}

                            {u.status === 'active' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStatusModalUser(u);
                                }}
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                                title="Deactivate or suspend user"
                                aria-label="Deactivate or suspend user"
                              >
                                <UserX size={14} />
                              </button>
                            )}

                            {(u.status === 'deactivated' || u.status === 'suspended') && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStatusModalUser(u);
                                }}
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                title="Reactivate user account"
                                aria-label="Reactivate user account"
                              >
                                <UserCheck size={14} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleOpenEditUser(u, e)}
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-primary-500 hover:bg-primary-500/10 transition-colors cursor-pointer"
                              title="Edit user details"
                              aria-label="Edit user details"
                            >
                              <Pencil size={13} />
                            </button>

                            {canDeleteUser && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUserToDelete(u);
                                  setDeleteBlockerInfo(null);
                                }}
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Delete user"
                                aria-label="Delete user"
                              >
                                <Trash2 size={14} />
                              </button>
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

          {/* Table Pagination */}
          {filteredUsers.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(filteredUsers.length / limit) || 1}
              totalItems={filteredUsers.length}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setLimit(newSize);
                setPage(1);
              }}
            />
          )}
        </div>
      ) : (
        /* ======================================================================= */
        /* MASTER-DETAIL SPLIT VIEW (Refined 4:8 Balance, Sleek Polish)            */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ===================================================================== */}
          {/* LEFT COLUMN: User Directory Master Panel (4 cols on lg/xl)            */}
          {/* ===================================================================== */}
          <div className="lg:col-span-5 xl:col-span-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col transition-colors">
            {/* Directory Header */}
            <div className="p-3.5 sm:p-4 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-[var(--text-primary)]">User Directory</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500">
                  {filteredUsers.length} of {users.length}
                </span>
              </div>
              {(searchQuery || statusFilter !== 'all' || roleFilter || branchFilter) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-primary-500 hover:underline font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* User List */}
            <div className="p-2 space-y-2 max-h-[calc(100vh-14rem)] min-h-[420px] overflow-y-auto">
              {filteredUsers.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                const primaryRole = u.primaryRole;
                const isExpired = u.isInviteExpired;

                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/[0.08] ring-1 ring-primary-500/30 shadow-sm'
                        : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:border-[var(--border-hover)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Initials Avatar */}
                        <div
                          className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'bg-primary-500/10 text-primary-500 border border-primary-500/20'
                          }`}
                        >
                          {getInitials(u.displayName)}
                        </div>

                        {/* Information */}
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[var(--text-primary)] truncate">
                              {u.displayName}
                            </span>

                            {/* Status Badge */}
                            {u.status === 'active' && (
                              <Badge variant="success" size="small">
                                Active
                              </Badge>
                            )}
                            {u.status === 'pending_invite' && !isExpired && (
                              <Badge variant="warning" size="small">
                                <Clock size={10} /> Pending
                              </Badge>
                            )}
                            {u.status === 'pending_invite' && isExpired && (
                              <Badge variant="danger" size="small">
                                <AlertCircle size={10} /> Expired
                              </Badge>
                            )}
                            {u.status === 'suspended' && (
                              <Badge variant="warning" size="small">
                                Suspended
                              </Badge>
                            )}
                            {u.status === 'deactivated' && (
                              <Badge variant="neutral" size="small">
                                Deactivated
                              </Badge>
                            )}
                          </div>

                          {/* Email & Phone */}
                          <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
                            {u.email && (
                              <div className="flex items-center gap-1.5 truncate">
                                <Mail size={12} className="text-[var(--text-muted)] shrink-0" />
                                <span className="truncate">{u.email}</span>
                              </div>
                            )}
                            {u.phoneNumber && (
                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)]">
                                <Phone size={11} className="shrink-0" />
                                <span>{u.phoneCountryCode ? `${u.phoneCountryCode} ` : ''}{u.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        size={16}
                        className={`text-[var(--text-muted)] transition-transform shrink-0 mt-1 ${
                          isSelected ? 'translate-x-1 text-primary-500' : ''
                        }`}
                      />
                    </div>

                    {/* Bottom Metadata & Quick Actions */}
                    <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {primaryRole ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary-500/10 text-primary-500">
                            <Star size={10} className="fill-primary-500 text-primary-500" />
                            {primaryRole.name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--text-muted)] italic">
                            No Role
                          </span>
                        )}

                        {u.homeBranch && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                            <Building2 size={10} className="text-primary-500" />
                            {u.homeBranch.name}
                          </span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {u.status === 'pending_invite' && (
                          <button
                            type="button"
                            onClick={(e) => handleResendInvite(u.id, e)}
                            disabled={resendingId === u.id}
                            className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white border border-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
                            title="Resend invitation link"
                          >
                            <RotateCcw size={10} className={resendingId === u.id ? 'animate-spin' : ''} />
                            <span>Resend</span>
                          </button>
                        )}

                        {u.status === 'active' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatusModalUser(u);
                            }}
                            className="p-1 rounded-md text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            title="Deactivate or suspend user"
                            aria-label="Deactivate or suspend user"
                          >
                            <UserX size={12} />
                          </button>
                        )}

                        {(u.status === 'deactivated' || u.status === 'suspended') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatusModalUser(u);
                            }}
                            className="p-1 rounded-md text-[var(--text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            title="Reactivate user account"
                            aria-label="Reactivate user account"
                          >
                            <UserCheck size={12} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleOpenEditUser(u, e)}
                          className="p-1 rounded-md text-[var(--text-muted)] hover:text-primary-500 hover:bg-primary-500/10 transition-colors cursor-pointer"
                          title="Edit user details"
                          aria-label="Edit user details"
                        >
                          <Pencil size={12} />
                        </button>

                        {canDeleteUser && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserToDelete(u);
                              setDeleteBlockerInfo(null);
                            }}
                            className="p-1 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete user"
                            aria-label="Delete user"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: Selected User Profile & Access Control (8 cols on lg/xl) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {!selectedUser ? (
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center shadow-sm">
                <EmptyState
                  title="No User Selected"
                  description="Select a team member or login account from the directory list to inspect assigned roles, home branch scope, and effective permissions."
                  className="bg-transparent border-none p-0"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Account Details Hero Card */}
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/30 border border-primary-500/30 text-primary-500 text-xl font-bold flex items-center justify-center shrink-0 shadow-sm">
                        {getInitials(selectedUser.displayName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg font-bold text-[var(--text-primary)]">
                            {selectedUser.displayName}
                          </h2>
                          <Badge
                            variant={
                              selectedUser.status === 'active'
                                ? 'success'
                                : selectedUser.status === 'pending_invite'
                                ? 'warning'
                                : 'neutral'
                            }
                            size="medium"
                          >
                            {selectedUser.status === 'active' ? (
                              <CheckCircle2 size={13} />
                            ) : (
                              <Clock size={13} />
                            )}
                            <span className="capitalize">{selectedUser.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-mono">
                            <Mail size={12} className="text-[var(--text-muted)]" />
                            {selectedUser.email || 'No email registered'}
                          </span>
                          {selectedUser.phoneNumber && (
                            <span className="flex items-center gap-1 font-mono text-[var(--text-muted)]">
                              • <Phone size={12} />
                              {selectedUser.phoneCountryCode ? `${selectedUser.phoneCountryCode} ` : ''}
                              {selectedUser.phoneNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Header Actions */}
                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEditUser(selectedUser)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] transition-all shadow-sm cursor-pointer"
                        title="Edit User Profile"
                      >
                        <Pencil size={13} />
                        <span>Edit Profile</span>
                      </button>

                      {canManageRoles && (
                        <button
                          type="button"
                          onClick={() => setIsAddRoleOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-all shadow-sm cursor-pointer"
                        >
                          <ShieldCheck size={14} />
                          <span>Assign Role</span>
                        </button>
                      )}

                      {selectedUser.status === 'pending_invite' && (
                        <button
                          type="button"
                          onClick={(e) => handleResendInvite(selectedUser.id, e)}
                          disabled={resendingId === selectedUser.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white border border-amber-500/20 transition-all cursor-pointer"
                        >
                          <RotateCcw size={13} className={resendingId === selectedUser.id ? 'animate-spin' : ''} />
                          <span>Resend Invite</span>
                        </button>
                      )}

                      {selectedUser.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => setStatusModalUser(selectedUser)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white border border-amber-500/20 transition-all cursor-pointer shadow-sm"
                          title="Deactivate or suspend user"
                        >
                          <UserX size={13} />
                          <span>Deactivate</span>
                        </button>
                      )}

                      {(selectedUser.status === 'deactivated' || selectedUser.status === 'suspended') && (
                        <button
                          type="button"
                          onClick={() => setStatusModalUser(selectedUser)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white border border-emerald-500/20 transition-all cursor-pointer shadow-sm"
                          title="Reactivate user account"
                        >
                          <UserCheck size={13} />
                          <span>Reactivate</span>
                        </button>
                      )}

                      {canDeleteUser && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserToDelete(selectedUser);
                            setDeleteBlockerInfo(null);
                          }}
                          className="p-2 text-xs font-semibold rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-colors"
                          title="Delete User Account"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Account Security & Metadata 4-Tiles Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {/* Last Login */}
                    <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-1">
                      <span className="text-[11px] text-[var(--text-muted)] block flex items-center gap-1">
                        <Clock size={12} className="text-primary-500" /> Last Login
                      </span>
                      <span className="font-bold text-[var(--text-primary)] block truncate">
                        {selectedUser.lastLoginAt
                          ? new Date(selectedUser.lastLoginAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Never logged in'}
                      </span>
                    </div>

                    {/* Home Branch */}
                    <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-1">
                      <span className="text-[11px] text-[var(--text-muted)] block flex items-center gap-1">
                        <Building2 size={12} className="text-primary-500" /> Home Branch
                      </span>
                      <span className="font-bold text-[var(--text-primary)] block truncate">
                        {selectedUser.homeBranch?.name || 'All Branches'}
                      </span>
                    </div>

                    {/* Active Roles Count */}
                    <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-1">
                      <span className="text-[11px] text-[var(--text-muted)] block flex items-center gap-1">
                        <Shield size={12} className="text-primary-500" /> Active Roles
                      </span>
                      <span className="font-bold text-[var(--text-primary)] block">
                        {(userDetails?.activeRoles || selectedUser.activeRoles || []).length} Assigned
                      </span>
                    </div>

                    {/* Account Verification */}
                    <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-1">
                      <span className="text-[11px] text-[var(--text-muted)] block flex items-center gap-1">
                        <Key size={12} className="text-primary-500" /> Access Status
                      </span>
                      <span className="font-bold text-emerald-500 block truncate capitalize">
                        {selectedUser.status === 'active' ? 'Active & Ready' : selectedUser.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Removable Role Chips Bar */}
                  <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        Assigned Roles (Primary highlighted filled)
                      </label>
                      {canManageRoles && (
                        <button
                          type="button"
                          onClick={() => setIsAddRoleOpen(true)}
                          className="text-xs font-bold text-primary-500 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          + Add Role
                        </button>
                      )}
                    </div>

                    {detailsLoading ? (
                      <Loader text="Updating role configurations..." size="small" />
                    ) : (
                      <UserRoleChips
                        roles={userDetails?.activeRoles || selectedUser.activeRoles}
                        onMakePrimary={handleMakePrimary}
                        onRemoveRole={handleOpenRemoveModal}
                        onAddRoleClick={canManageRoles ? () => setIsAddRoleOpen(true) : undefined}
                        readOnly={!canManageRoles}
                      />
                    )}
                  </div>
                </div>

                {/* Navigation Tabs for Permissions Union vs Audit History */}
                <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-4 space-y-4">
                  <UnderlineTabs
                    tabs={navigationTabs}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    showBorder
                  />

                  {/* Tab Content */}
                  {activeTab === 'effective-permissions' ? (
                    <EffectivePermissionsDrawer
                      effectivePermissions={userDetails?.effectivePermissions || []}
                      userDisplayName={selectedUser.displayName}
                    />
                  ) : (
                    <RoleAssignmentHistoryLog
                      activeRoles={userDetails?.activeRoles || []}
                      historicalRoles={userDetails?.historicalRoles || []}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL DIALOGS                                                          */}
      {/* ========================================================================= */}
      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteSuccess={handleInviteSuccess}
        availableRoles={availableRoles}
        availableBranches={availableBranches}
        targetOrganisationName={effectiveOrgName}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserOpen}
        onClose={() => {
          setIsEditUserOpen(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
        onUserUpdated={handleUserUpdated}
      />

      {/* Add Role Modal */}
      <AddRoleModal
        isOpen={isAddRoleOpen}
        onClose={() => setIsAddRoleOpen(false)}
        onAssign={handleAssignRoleSubmit}
        userDisplayName={selectedUser?.displayName}
        assignedRoleIds={(userDetails?.activeRoles || []).map(
          (r) => r.roleId || r.id,
        )}
        availableRoles={availableRoles}
        loading={actionLoading}
      />

      {/* Remove Role Impact Modal */}
      <RemoveRoleImpactModal
        isOpen={isRemoveImpactOpen}
        onClose={() => {
          setIsRemoveImpactOpen(false);
          setRoleToRemove(null);
        }}
        onConfirmRemove={handleConfirmRoleRemoval}
        userId={selectedUser?.id}
        userDisplayName={selectedUser?.displayName}
        roleToRemove={roleToRemove}
      />

      {/* Bulk Assign Modal */}
      <BulkRoleAssignModal
        isOpen={isBulkAssignOpen}
        onClose={() => setIsBulkAssignOpen(false)}
        users={users}
        availableRoles={availableRoles}
        onSuccess={loadData}
      />

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => {
          setUserToDelete(null);
          setDeleteBlockerInfo(null);
        }}
        title="Delete User Account"
        size="small"
        footer={deleteModalFooter}
      >
        {userToDelete && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-rose-400 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle size={22} className="shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-[var(--text-primary)]">
                  {userToDelete.displayName}
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  {userToDelete.email || userToDelete.phoneNumber}
                </p>
              </div>
            </div>

            {deleteBlockerInfo ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle size={15} />
                  <span>Historical Records Blocker</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  This user cannot be deleted because historical business transactions, audit logs, or created resources are linked to their account. Deleting would corrupt audit history.
                </p>
                <div className="p-2 rounded-lg bg-[var(--bg-input)] font-mono text-[10px] text-[var(--text-primary)] space-y-0.5">
                  {Object.entries(deleteBlockerInfo)
                    .filter(([_, v]) => (typeof v === 'number' ? v > 0 : typeof v === 'string'))
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <strong>{String(v)}</strong>
                      </div>
                    ))}
                </div>
                <p className="text-[11px] font-bold text-amber-300">
                  Recommendation: Please deactivate the user account instead of deleting it.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Are you sure you want to delete this user? If this user has no attached audit history or business records, the account will be soft-deleted.
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Change User Status Modal (Deactivate / Suspend / Reactivate) */}
      <ChangeStatusModal
        isOpen={Boolean(statusModalUser)}
        onClose={() => setStatusModalUser(null)}
        targetUser={statusModalUser}
        currentUser={user}
        onStatusChanged={async (updatedTarget) => {
          if (selectedUser?.id === updatedTarget?.id) {
            setSelectedUser((prev) => ({ ...prev, status: updatedTarget.status }));
          }
          await loadData();
        }}
      />
    </div>
  );
};

export default UserManagementPage;
