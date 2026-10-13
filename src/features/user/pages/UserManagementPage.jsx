import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Search,
  RefreshCw,
  UserPlus,
  Star,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  History,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '../../../services/userService';
import UserRoleChips from '../components/UserRoleChips';
import AddRoleModal from '../components/AddRoleModal';
import RemoveRoleImpactModal from '../components/RemoveRoleImpactModal';
import BulkRoleAssignModal from '../components/BulkRoleAssignModal';
import EffectivePermissionsDrawer from '../components/EffectivePermissionsDrawer';
import RoleAssignmentHistoryLog from '../components/RoleAssignmentHistoryLog';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('effective-permissions'); // 'effective-permissions' | 'history'

  // Modals state
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isRemoveImpactOpen, setIsRemoveImpactOpen] = useState(false);
  const [roleToRemove, setRoleToRemove] = useState(null);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        userService.getUsers(),
        userService.getAvailableRoles(),
      ]);

      const userList = Array.isArray(usersData) ? usersData : usersData.data || [];
      const roleList = Array.isArray(rolesData) ? rolesData : rolesData.data || [];

      setUsers(userList);
      setAvailableRoles(roleList);

      if (userList.length > 0 && !selectedUser) {
        handleSelectUser(userList[0]);
      } else if (selectedUser) {
        // Refresh currently selected user
        const refreshed = userList.find((u) => u.id === selectedUser.id);
        if (refreshed) {
          handleSelectUser(refreshed);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setDetailsLoading(true);
    try {
      const details = await userService.getUserRoleDetails(user.id);
      setUserDetails(details);
    } catch (err) {
      toast.error(err.message || 'Failed to load user role details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleMakePrimary = async (role) => {
    if (!selectedUser) return;
    const roleId = role.roleId || role.id;
    try {
      await userService.setPrimaryRole(selectedUser.id, roleId);
      toast.success(`Set "${role.name}" as Primary Role`);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to set primary role');
    }
  };

  const handleAssignRoleSubmit = async ({ roleId, isPrimary }) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await userService.assignRole(selectedUser.id, { roleId, isPrimary });
      toast.success('Role assigned successfully');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to assign role');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRemoveModal = (role) => {
    setRoleToRemove(role);
    setIsRemoveImpactOpen(true);
  };

  const handleConfirmRoleRemoval = async (roleId) => {
    if (!selectedUser) return;
    try {
      await userService.removeRole(selectedUser.id, roleId);
      toast.success('Role assignment removed');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to remove role');
      throw err;
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesName = u.displayName?.toLowerCase().includes(q);
    const matchesEmail = u.email?.toLowerCase().includes(q);
    const matchesRole = u.activeRoles?.some((r) => r.name.toLowerCase().includes(q));
    return matchesName || matchesEmail || matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/20">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
              User Role Assignment
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Assign single/multiple roles per user, designate primary dashboard role, inspect effective permissions & audit trail
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Refresh Users List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setIsBulkAssignOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Bulk Assign Roles</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Users Directory Table */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                <Users size={16} className="text-primary-500" />
                <span>Organization Users</span>
                <span className="text-xs bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)] font-bold px-2 py-0.5 rounded-full">
                  {users.length}
                </span>
              </h2>

              <div className="relative w-48">
                <Search size={14} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:border-primary-500 text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-[var(--text-muted)]">Loading user accounts...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                No users found matching query.
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredUsers.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  const primaryRole = u.primaryRole;

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
                          ? 'border-primary-500 bg-primary-500/15 shadow-sm'
                          : 'border-[var(--border-color)] hover:border-[var(--border-hover)] bg-[var(--bg-input)] hover:bg-white/5'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                            <span>{u.displayName}</span>
                            <span
                              className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded ${u.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]'
                                }`}
                            >
                              {u.status}
                            </span>
                          </div>
                          <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                            {u.email || 'No email'}
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                          className={`text-[var(--text-muted)] transition-transform ${isSelected ? 'translate-x-1 text-primary-500' : ''
                            }`}
                        />
                      </div>

                      {/* Primary Role Indicator & Chips */}
                      <div className="mt-3 pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                          <span className="font-medium text-[11px]">Primary:</span>
                          {primaryRole ? (
                            <span className="font-bold text-primary-500 flex items-center gap-1">
                              <Star size={11} className="fill-yellow-400 text-yellow-400" />
                              {primaryRole.name}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)] italic">None</span>
                          )}
                        </div>

                        <span className="text-[11px] text-[var(--text-muted)] font-bold">
                          {u.activeRolesCount || 0} role(s) assigned
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected User Role Management & Effective Permissions Panel */}
        <div className="lg:col-span-6 space-y-4">
          {!selectedUser ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-12 text-center text-xs text-[var(--text-muted)]">
              Select a user from the directory to manage role assignments and inspect permission grants.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Account Role Header Card */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <div>
                    <h2 className="font-extrabold text-[var(--text-primary)] text-base">
                      {selectedUser.displayName}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                      {selectedUser.email}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={13} /> {selectedUser.status}
                  </span>
                </div>

                {/* Removable Role Chips Bar */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Assigned Roles (Primary highlighted filled)
                  </label>
                  {detailsLoading ? (
                    <div className="py-2 text-xs text-[var(--text-muted)]">Updating roles...</div>
                  ) : (
                    <UserRoleChips
                      roles={userDetails?.activeRoles || selectedUser.activeRoles}
                      onMakePrimary={handleMakePrimary}
                      onRemoveRole={handleOpenRemoveModal}
                      onAddRoleClick={() => setIsAddRoleOpen(true)}
                    />
                  )}
                </div>
              </div>

              {/* Navigation Tabs for Permissions Union vs Audit History */}
              <div className="flex items-center gap-2 border-b border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setActiveTab('effective-permissions')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${activeTab === 'effective-permissions'
                      ? 'border-primary-500 text-primary-500 font-extrabold'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  <Sparkles size={15} />
                  <span>Effective Permissions Union</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${activeTab === 'history'
                      ? 'border-primary-500 text-primary-500 font-extrabold'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  <History size={15} />
                  <span>Assignment Audit Log</span>
                </button>
              </div>

              {/* Tab Views */}
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
          )}
        </div>
      </div>

      {/* Modals */}
      <AddRoleModal
        isOpen={isAddRoleOpen}
        onClose={() => setIsAddRoleOpen(false)}
        onAssign={handleAssignRoleSubmit}
        userDisplayName={selectedUser?.displayName}
        assignedRoleIds={(userDetails?.activeRoles || []).map((r) => r.roleId || r.id)}
        availableRoles={availableRoles}
        loading={actionLoading}
      />

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

      <BulkRoleAssignModal
        isOpen={isBulkAssignOpen}
        onClose={() => setIsBulkAssignOpen(false)}
        users={users}
        availableRoles={availableRoles}
        onSuccess={loadData}
      />
    </div>
  );
};

export default UserManagementPage;
