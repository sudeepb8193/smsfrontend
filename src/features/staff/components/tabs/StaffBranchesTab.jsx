import React, { useState } from 'react';
import Card from '../../../../components/shared/Card';
import Button from '../../../../components/shared/Button';
import Badge from '../../../../components/shared/Badge';
import { usePermission } from '../../../../hooks/usePermission';
import { AddBranchAssignmentModal } from '../modals/AddBranchAssignmentModal';
import { TransferHomeBranchModal } from '../modals/TransferHomeBranchModal';
import {
  Building2,
  Home,
  Plus,
  ArrowRightLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Ban,
} from 'lucide-react';

export function StaffBranchesTab({
  staff,
  branchAssignments = {},
  branches = [],
  onAddSecondaryBranch,
  onEndSecondaryBranch,
  onTransferHomeBranch,
  loading,
}) {
  const { can } = usePermission();
  const [isAddSecondaryModalOpen, setIsAddSecondaryModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const homeBranch = staff.homeBranch || branchAssignments.homeBranch;
  const secondaryAssignments = branchAssignments.secondaryAssignments || [];
  const futureTransfers = branchAssignments.futureTransfers || [];

  return (
    <div className="space-y-6">
      {/* Future Transfer Alert if scheduled */}
      {futureTransfers.length > 0 && (
        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="text-purple-600 dark:text-purple-400 shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-purple-900 dark:text-purple-200">
                Scheduled Home Branch Transfer
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Transfer to{' '}
                <strong>{futureTransfers[0]?.branch?.name}</strong> is scheduled to take effect on{' '}
                <strong>{new Date(futureTransfers[0]?.effectiveFrom).toLocaleDateString()}</strong>.
              </p>
            </div>
          </div>
          <Badge variant="primary" size="xs">
            Scheduled
          </Badge>
        </div>
      )}

      {/* Designated Home Branch Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <Home size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Designated Home Branch
                </h3>
                <Badge variant="primary">Primary</Badge>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                The primary base salon location for operational reporting, payroll, and scheduling.
              </p>
            </div>
          </div>

          {(can('staff_branch.manage') || can('staff_branch.transfer')) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsTransferModalOpen(true)}
            >
              <ArrowRightLeft size={14} className="mr-1.5" />
              Transfer Home Branch
            </Button>
          )}
        </div>

        {homeBranch ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
            <div>
              <span className="text-xs text-[var(--text-muted)] block mb-1">Branch Name</span>
              <p className="font-bold text-[var(--text-primary)] text-sm">
                {homeBranch.name}
              </p>
              <span className="font-mono text-xs text-[var(--text-muted)]">{homeBranch.code}</span>
            </div>

            <div>
              <span className="text-xs text-[var(--text-muted)] block mb-1">Branch Status</span>
              <Badge variant={homeBranch.status === 'active' ? 'success' : 'neutral'}>
                {homeBranch.status}
              </Badge>
            </div>

            <div>
              <span className="text-xs text-[var(--text-muted)] block mb-1">Current Assignment</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle size={14} className="mr-1 inline" />
                Active Home Location
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No home branch designated.</p>
        )}
      </Card>

      {/* Secondary Branch Assignments */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center space-x-2">
              <Building2 className="text-[var(--text-secondary)]" size={18} />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Secondary Branch Access
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Additional salon branches where this employee is authorized to take appointments and shifts.
            </p>
          </div>

          {(can('staff_branch.create') ||
            can('staff_branch.assign') ||
            can('staff_branch.manage')) && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddSecondaryModalOpen(true)}
            >
              <Plus size={14} className="mr-1.5" />
              Add Secondary Branch
            </Button>
          )}
        </div>

        {secondaryAssignments.length === 0 ? (
          <div className="p-8 text-center bg-[var(--bg-input)] border border-dashed border-[var(--border-color)] rounded-xl">
            <Building2 className="mx-auto text-[var(--text-muted)] mb-2" size={32} />
            <p className="text-sm font-semibold text-[var(--text-secondary)]">
              No secondary branches assigned
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Add secondary branches if this employee roams or works across multiple locations.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {secondaryAssignments.map((assignment) => {
              const isActive = !assignment.effectiveTo || new Date(assignment.effectiveTo) > new Date();

              return (
                <div
                  key={assignment.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm">
                          {assignment.branch?.name}
                        </h4>
                        <span className="font-mono text-xs text-[var(--text-muted)]">
                          ({assignment.branch?.code})
                        </span>
                        {isActive ? (
                          <Badge variant="success" size="xs">Active</Badge>
                        ) : (
                          <Badge variant="neutral" size="xs">Ended</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-[var(--text-muted)] mt-1">
                        <span>
                          From: {new Date(assignment.effectiveFrom).toLocaleDateString()}
                        </span>
                        {assignment.effectiveTo && (
                          <span>
                            To: {new Date(assignment.effectiveTo).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isActive &&
                    (can('staff_branch.delete') ||
                      can('staff_branch.remove') ||
                      can('staff_branch.manage')) && (
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-rose-600 border-rose-300 hover:bg-rose-50 self-end sm:self-center"
                        onClick={() => onEndSecondaryBranch(assignment.id)}
                      >
                        <Ban size={12} className="mr-1" />
                        End Assignment
                      </Button>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Secondary Branch Modal */}
      <AddBranchAssignmentModal
        isOpen={isAddSecondaryModalOpen}
        onClose={() => setIsAddSecondaryModalOpen(false)}
        branches={branches}
        currentBranchId={staff.homeBranchId}
        loading={loading}
        onSave={async (data) => {
          await onAddSecondaryBranch(data);
          setIsAddSecondaryModalOpen(false);
        }}
      />

      {/* Transfer Home Branch Modal */}
      <TransferHomeBranchModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        branches={branches}
        currentHomeBranch={homeBranch}
        loading={loading}
        onTransfer={async (data) => {
          await onTransferHomeBranch(data);
          setIsTransferModalOpen(false);
        }}
      />
    </div>
  );
}

export default StaffBranchesTab;
