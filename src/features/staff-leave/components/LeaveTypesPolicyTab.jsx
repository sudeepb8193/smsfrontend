import React, { useState } from 'react';
import Button from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';
import { Toggle } from '../../../components/shared/Toggle';
import Skeleton from '../../../components/shared/Skeleton';
import EmptyState from '../../../components/shared/EmptyState';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import {
  FileText,
  Plus,
  Sparkles,
  Edit,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

/**
 * LeaveTypesPolicyTab: Administrative policy center for configuring organization
 * leave categories, entitlements, accrual rules, and documentation thresholds.
 */
export default function LeaveTypesPolicyTab({
  leaveTypes = [],
  isLoading = false,
  onOpenCreateModal,
  onOpenEditModal,
  onToggleStatus,
  onSeedDefaults,
  isSeeding = false,
  canManage = false,
}) {
  const [seedConfirmOpen, setSeedConfirmOpen] = useState(false);

  const safeLeaveTypes = Array.isArray(leaveTypes)
    ? leaveTypes
    : Array.isArray(leaveTypes?.items)
    ? leaveTypes.items
    : Array.isArray(leaveTypes?.data)
    ? leaveTypes.data
    : [];

  const handleConfirmSeed = async () => {
    await onSeedDefaults();
    setSeedConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Seed */}
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-500" />
            <span>Leave Policies & Accrual Rules</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Configure company-wide leave entitlements, carry-forward rules, and documentation gates
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => setSeedConfirmOpen(true)}
              disabled={isSeeding}
              className="flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>Seed Standard Policies</span>
            </Button>

            <Button
              variant="primary"
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Leave Type</span>
            </Button>
          </div>
        )}
      </div>

      {/* Leave Types Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : safeLeaveTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeLeaveTypes.map((lt) => (
            <div
              key={lt.id}
              className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-[var(--text-primary)]">
                      {lt.name}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-card-hover)] text-[var(--text-muted)] border border-[var(--border-color)]">
                      {lt.code}
                    </span>
                  </div>

                  <Badge variant={lt.isPaid ? 'success' : 'default'} className="text-[10px]">
                    {lt.isPaid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>

                <p className="text-xs text-[var(--text-muted)] line-clamp-2 min-h-[32px]">
                  {lt.description || 'Standard organizational leave category.'}
                </p>

                {/* Key Rules Matrix */}
                <div className="p-3 bg-[var(--bg-card-hover)] rounded-xl grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Entitlement</span>
                    <strong className="text-[var(--text-primary)]">
                      {Number(lt.annualEntitlementDays ?? lt.annualEntitlement ?? 0)} days/yr
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Accrual</span>
                    <span className="text-[var(--text-secondary)] font-medium">
                      {(lt.accrualMethod || '').toLowerCase() === 'annual_grant'
                        ? 'Annual Grant'
                        : (lt.accrualMethod || '').toLowerCase() === 'monthly_accrual'
                        ? `${Number(lt.monthlyAccrualDays ?? lt.monthlyAccrualRate ?? 1)}d / mo`
                        : 'None'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Carry Forward</span>
                    <span className="text-[var(--text-secondary)] font-medium">
                      Max {Number(lt.maxCarryForwardDays ?? 0)} days
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Min Notice</span>
                    <span className="text-[var(--text-secondary)] font-medium">
                      {lt.minNoticeDays ?? 0} day(s)
                    </span>
                  </div>
                </div>

                {/* Constraints indicators */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[var(--text-muted)]">
                  {(lt.documentRequiredAfterDays !== null && lt.documentRequiredAfterDays !== undefined
                    ? true
                    : Boolean(lt.isDocumentRequired)) && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium">
                      Doc required &gt;={Number(lt.documentRequiredAfterDays ?? lt.documentRequiredThreshold ?? 1)}d
                    </span>
                  )}
                  {(lt.applicableGender || lt.genderApplicability || 'all').toLowerCase() !== 'all' && (
                    <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium">
                      {(lt.applicableGender || lt.genderApplicability || '').toLowerCase().includes('female')
                        ? 'Female Only'
                        : 'Male Only'}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer controls: Active toggle & Edit */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  {canManage ? (
                    <Toggle
                      checked={lt.status ? lt.status === 'active' : (lt.isActive ?? true)}
                      onChange={(checked) =>
                        onToggleStatus({ id: lt.id, isActive: checked, status: checked ? 'active' : 'inactive' })
                      }
                    />
                  ) : (
                    <Badge
                      variant={
                        (lt.status ? lt.status === 'active' : (lt.isActive ?? true))
                          ? 'success'
                          : 'default'
                      }
                      className="text-[10px]"
                    >
                      {(lt.status ? lt.status === 'active' : (lt.isActive ?? true)) ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {(lt.status ? lt.status === 'active' : (lt.isActive ?? true)) ? 'Active' : 'Disabled'}
                  </span>
                </div>

                {canManage && (
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => onOpenEditModal(lt)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Leave Policies Configured"
          description="Initialize standard salon leave policies or create custom leave categories."
          actionLabel={canManage ? 'Seed Standard Policies' : undefined}
          onAction={canManage ? () => setSeedConfirmOpen(true) : undefined}
        />
      )}

      {/* Confirmation Dialog for Seeding Defaults */}
      <ConfirmDialog
        isOpen={seedConfirmOpen}
        onClose={() => setSeedConfirmOpen(false)}
        onConfirm={handleConfirmSeed}
        title="Initialize Standard Leave Policies?"
        message="This will create standard salon industry leave categories (Sick Leave, Casual Leave, Annual Leave, Maternity Leave, Paternity Leave, Unpaid Leave) for your organization if they do not already exist."
        confirmText="Initialize Standard Policies"
        confirmVariant="primary"
        loading={isSeeding}
      />
    </div>
  );
}
