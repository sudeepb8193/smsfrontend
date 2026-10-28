import React, { useState, useEffect } from 'react';
import { rolePermissionApi } from '../api/rolePermissionApi';
import StaffOverrideModal from '../components/StaffOverrideModal';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Input from '../../../components/shared/Input';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import Spinner from '../../../components/shared/Spinner';
import {
  UserCheck,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { notifyPermissionUpdate } from '../../../utils/permissionUtils';
import { useAuth } from '../../../hooks/useAuth';

export const StaffOverridesPage = () => {
  const { refreshUser } = useAuth();
  const [staffIdInput, setStaffIdInput] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [overridesData, setOverridesData] = useState(null);
  const [permissionsCatalog, setPermissionsCatalog] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOverrideTarget, setDeleteOverrideTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load catalog and branches on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const [perms, brs] = await Promise.all([
          rolePermissionApi.getPermissions(),
          rolePermissionApi.getBranches(),
        ]);
        setPermissionsCatalog(perms || []);
        setBranches(brs || []);
      } catch (err) {
        console.error('Failed to prefetch metadata', err);
      }
    };
    initData();
  }, []);

  const loadStaffOverrides = async (id) => {
    if (!id?.trim()) return;
    try {
      setLoading(true);
      const [overridesRes, effRes] = await Promise.all([
        rolePermissionApi.getStaffOverrides(id.trim()),
        rolePermissionApi.getStaffEffectivePermissions(id.trim()),
      ]);

      setOverridesData({
        ...overridesRes,
        effectivePermissions: effRes.effectivePermissions || [],
      });
      setSelectedStaff({
        id: overridesRes.staffId,
        fullName: overridesRes.fullName,
        employeeCode: overridesRes.employeeCode,
        homeBranch: overridesRes.homeBranch,
      });
    } catch (err) {
      toast.error(err.message || 'Staff member not found');
      setOverridesData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOverride = async (payload) => {
    try {
      setSubmitting(true);
      await rolePermissionApi.createStaffOverride(selectedStaff.id, payload);
      toast.success('Permission exception created successfully');
      setModalOpen(false);
      notifyPermissionUpdate({ staffId: selectedStaff.id });
      await refreshUser();
      loadStaffOverrides(selectedStaff.id);
    } catch (err) {
      toast.error(err.message || 'Failed to create override');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOverride = async () => {
    if (!deleteOverrideTarget) return;
    try {
      setDeleting(true);
      await rolePermissionApi.deleteStaffOverride(selectedStaff.id, deleteOverrideTarget.id);
      toast.success('Permission override removed');
      setDeleteOverrideTarget(null);
      notifyPermissionUpdate({ staffId: selectedStaff.id });
      await refreshUser();
      loadStaffOverrides(selectedStaff.id);
    } catch (err) {
      toast.error(err.message || 'Failed to remove override');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-primary-500" />
          Staff Permission Exceptions & Overrides
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Manage individual staff Grant/Revoke access overrides, temporary elevations, and audit histories.
        </p>
      </div>

      {/* Staff Lookup Bar Card */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-4 transition-colors">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadStaffOverrides(staffIdInput);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="flex-1 w-full">
            <Input
              placeholder="Enter Staff ID or Employee Code (e.g. from Staff HR Directory)..."
              value={staffIdInput}
              onChange={(e) => setStaffIdInput(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            icon={Search}
            loading={loading}
          >
            Lookup Staff Member
          </Button>
        </form>
      </div>

      {/* Staff Overrides & Effective Permissions View */}
      {overridesData && selectedStaff ? (
        <div className="space-y-4">
          {/* Staff Info Banner */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 flex items-center justify-center font-bold text-base shrink-0">
                  {selectedStaff.fullName?.charAt(0) || 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedStaff.fullName}</h3>
                    <Badge variant="primary" size="small">
                      {selectedStaff.employeeCode}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Home Branch: <strong className="text-[var(--text-secondary)]">{selectedStaff.homeBranch?.name || 'Unassigned'}</strong>
                    {overridesData.linkedUser?.email && (
                      <span className="ml-2 font-mono">({overridesData.linkedUser.email})</span>
                    )}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setModalOpen(true)}
              >
                Add Permission Exception
              </Button>
            </div>
          </div>

          {/* Active Overrides Table Container */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-colors">
            <div className="p-4 border-b border-[var(--border-color)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Configured Permission Exceptions</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {overridesData.activeOverridesCount || 0} active exceptions applied to this staff member
              </p>
            </div>

            {overridesData.overrides?.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] italic">
                No individual permission overrides configured for this employee. Access is determined purely by assigned roles.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[var(--bg-input)] border-b border-[var(--border-color)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Permission</th>
                      <th className="py-3 px-3">Branch Scope</th>
                      <th className="py-3 px-3">Mandatory Reason</th>
                      <th className="py-3 px-3">Expires At</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] text-xs">
                    {overridesData.overrides.map((ov) => {
                      const isGrant = ov.overrideType === 'grant';
                      return (
                        <tr key={ov.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3">
                            <Badge variant={isGrant ? 'success' : 'danger'} size="small">
                              {isGrant ? 'GRANT' : 'REVOKE'}
                            </Badge>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-[var(--text-primary)]">{ov.permissionLabel}</div>
                            <div className="font-mono text-[10px] text-[var(--text-muted)]">
                              {ov.permissionKey}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[var(--text-secondary)]">
                            {ov.branchName}
                          </td>
                          <td className="py-3 px-3 text-[var(--text-secondary)] max-w-xs">
                            {ov.reason}
                          </td>
                          <td className="py-3 px-3">
                            {ov.isExpired ? (
                              <Badge variant="danger" size="small">
                                Expired
                              </Badge>
                            ) : ov.isExpiringSoon ? (
                              <Badge variant="warning" size="small">
                                Expiring Soon: {new Date(ov.expiresAt).toLocaleDateString()}
                              </Badge>
                            ) : ov.expiresAt ? (
                              <span className="text-[var(--text-secondary)]">
                                {new Date(ov.expiresAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)] font-mono">Permanent</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setDeleteOverrideTarget(ov)}
                              className="text-danger-500 hover:text-danger-600 p-1 rounded-md hover:bg-danger-500/10 transition-colors cursor-pointer"
                              title="Remove Override"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Effective Permissions Union Preview */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5 transition-colors">
            <h3 className="text-base font-bold text-[var(--text-primary)]">Calculated Effective Permissions Preview</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-4">
              Result of base role grants + staff overrides precedence calculation
            </p>

            {overridesData.effectivePermissions?.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic">No active effective permissions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                {overridesData.effectivePermissions.map((ep) => (
                  <div
                    key={ep.permissionKey}
                    className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-[var(--text-primary)] text-xs">{ep.label}</div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                        {ep.permissionKey}
                      </div>
                      <div className="text-[10px] text-primary-500 mt-1 font-medium">
                        Scope: <span className="font-bold">{ep.isAllBranches ? 'All Branches' : `${ep.allowedBranchIds?.length || 0} branches`}</span>
                      </div>
                    </div>
                    {ep.isStaffOverrideGrant && (
                      <Badge variant="success" size="small">
                        Override
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        !loading && (
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-12 text-center transition-colors">
            <UserCheck size={36} className="mx-auto text-[var(--text-muted)] mb-3" />
            <h3 className="font-bold text-[var(--text-primary)] text-base">Look up a Staff Member</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mt-1">
              Enter an employee code or ID above to view their active permission overrides, role inheritance, and grant/revoke exceptions.
            </p>
          </div>
        )
      )}

      {/* Add Override Modal */}
      {selectedStaff && (
        <StaffOverrideModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateOverride}
          staff={selectedStaff}
          permissionsCatalog={permissionsCatalog}
          branches={branches}
          loading={submitting}
        />
      )}

      {/* Delete Override Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteOverrideTarget)}
        onClose={() => setDeleteOverrideTarget(null)}
        onConfirm={handleDeleteOverride}
        title="Remove Permission Override?"
        message={`Are you sure you want to remove the ${deleteOverrideTarget?.overrideType?.toUpperCase()} override for "${deleteOverrideTarget?.permissionLabel}"? The staff member will revert to their base role permissions.`}
        confirmText="Remove Override"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default StaffOverridesPage;
