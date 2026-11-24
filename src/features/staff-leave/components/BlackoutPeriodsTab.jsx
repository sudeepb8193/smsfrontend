import React, { useState } from 'react';
import Button from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';
import Skeleton from '../../../components/shared/Skeleton';
import EmptyState from '../../../components/shared/EmptyState';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import {
  CalendarOff,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Building,
  ShieldAlert,
} from 'lucide-react';

/**
 * BlackoutPeriodsTab: Manage operational peak blackout windows (festive seasons,
 * rush hours, inventory audits) where leave requests are blocked or capped.
 */
export default function BlackoutPeriodsTab({
  blackoutPeriods = [],
  isLoading = false,
  branches = [],
  leaveTypes = [],
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteBlackout,
  isDeleting = false,
  canManage = false,
}) {
  const [deletingId, setDeletingId] = useState(null);

  const safeBlackoutPeriods = Array.isArray(blackoutPeriods)
    ? blackoutPeriods
    : Array.isArray(blackoutPeriods?.data)
    ? blackoutPeriods.data
    : Array.isArray(blackoutPeriods?.items)
    ? blackoutPeriods.items
    : [];

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    await onDeleteBlackout(deletingId);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Create Action */}
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <CalendarOff className="w-4 h-4 text-rose-500" />
            <span>Blackout Periods & Peak Restraints</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Safeguard salon staffing levels during festive peaks and seasonal surges
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Blackout Window</span>
          </Button>
        )}
      </div>

      {/* Blackout List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : safeBlackoutPeriods.length > 0 ? (
        <div className="space-y-4">
          {safeBlackoutPeriods.map((bp) => {
            const isBlockAll = (bp.restrictionType || '').toLowerCase() === 'block_all';

            return (
              <div
                key={bp.id}
                className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      {bp.name}
                    </h4>
                    <Badge variant={isBlockAll ? 'danger' : 'warning'} className="text-[10px]">
                      {isBlockAll
                        ? 'Block All Leaves (0% permitted)'
                        : `Limit to Max ${Number(bp.maxPercentageStaffOnLeave ?? bp.maxAllowedLeavePercentage ?? 20)}% Staff`}
                    </Badge>
                    <Badge variant={bp.isActive ? 'success' : 'default'} className="text-[10px]">
                      {bp.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)]">
                    <strong>Period:</strong> {new Date(bp.startDate).toLocaleDateString()} —{' '}
                    {new Date(bp.endDate).toLocaleDateString()}
                  </p>

                  {/* Branch and Exemption Scope */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--text-muted)] pt-1">
                    <span>
                      <strong>Branches:</strong>{' '}
                      {bp.applicableBranchIds && bp.applicableBranchIds.length > 0
                        ? `${bp.applicableBranchIds.length} Branch(es) Selected`
                        : 'All Branches'}
                    </span>

                    <span>
                      <strong>Exemptions:</strong>{' '}
                      {bp.exemptLeaveTypeIds && bp.exemptLeaveTypeIds.length > 0
                        ? `${bp.exemptLeaveTypeIds.length} Leave Type(s) Exempt`
                        : 'No Exemptions'}
                    </span>
                  </div>

                  {bp.notes && (
                    <p className="text-xs text-[var(--text-muted)] italic pt-1">
                      "{bp.notes}"
                    </p>
                  )}
                </div>

                {canManage && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => onOpenEditModal(bp)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setDeletingId(bp.id)}
                      className="text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Blackout Periods Defined"
          description="Ensure uninterrupted service by defining peak blackout dates for the salon."
          actionLabel={canManage ? 'Add Blackout Window' : undefined}
          onAction={canManage ? onOpenCreateModal : undefined}
        />
      )}

      {/* Confirmation Dialog for Deleting Blackout */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Blackout Period?"
        message="Are you sure you want to delete this blackout period? Leave requests falling within this window will no longer be restricted."
        confirmText="Yes, Delete Window"
        confirmVariant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
