import React, { useState } from 'react';
import Button from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';
import Skeleton from '../../../components/shared/Skeleton';
import EmptyState from '../../../components/shared/EmptyState';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';

/**
 * MyLeaveTab: Dedicated self-service leave hub for Service Staff and team members.
 * Displays personal leave balance cards, upcoming leaves, and request history.
 */
export default function MyLeaveTab({
  balances = [],
  requests = [],
  isLoadingBalances = false,
  isLoadingRequests = false,
  onOpenApplyModal,
  onCancelRequest,
  isCancelling = false,
}) {
  const [cancellingRequestId, setCancellingRequestId] = useState(null);

  const safeBalances = Array.isArray(balances)
    ? balances
    : Array.isArray(balances?.balances)
    ? balances.balances
    : Array.isArray(balances?.data)
    ? balances.data
    : Array.isArray(balances?.items)
    ? balances.items
    : [];

  const safeRequests = Array.isArray(requests)
    ? requests
    : Array.isArray(requests?.data)
    ? requests.data
    : Array.isArray(requests?.items)
    ? requests.items
    : [];

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase().trim();
    switch (s) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Cancelled</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>;
      default:
        return (
          <Badge variant="neutral">
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending Review'}
          </Badge>
        );
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingRequestId) return;
    try {
      await onCancelRequest({ id: cancellingRequestId, reason: 'Cancelled by employee' });
    } finally {
      setCancellingRequestId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Apply CTA */}
      <div className="p-5 bg-gradient-to-r from-primary-600/10 via-primary-500/5 to-transparent border border-[var(--border-color)] rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <span>My Leave Balances & History</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Review your annual leave quotas, apply for scheduled time off, and track approval statuses
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onOpenApplyModal}
          className="flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </Button>
      </div>

      {/* Balance Cards Grid */}
      <div>
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Available Leave Allowances
        </h3>

        {isLoadingBalances ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : safeBalances.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {safeBalances.map((b) => {
              const available = Number(b.availableDays ?? b.closingBalanceDays ?? 0);
              const entitled = Number(
                b.entitledDays ?? b.openingBalanceDays ?? b.leaveType?.annualEntitlementDays ?? 0,
              );
              const used = Number(b.usedDays || 0);
              const pending = Number(b.pendingDays || 0);
              const leaveType = b.leaveType || {};

              return (
                <div
                  key={b.id || b.leaveTypeId}
                  className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {leaveType.name || 'Leave'}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-card-hover)] text-[var(--text-muted)] border border-[var(--border-color)]">
                      {leaveType.code || 'LV'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-3xl font-extrabold text-[var(--text-primary)]">
                      {available}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">days left</span>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-color)] grid grid-cols-3 gap-1 text-center text-[10px]">
                    <div>
                      <span className="text-[var(--text-muted)] block">Entitled</span>
                      <span className="font-semibold text-[var(--text-primary)]">{entitled}d</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block">Used</span>
                      <span className="font-semibold text-rose-500">{used}d</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block">Pending</span>
                      <span className="font-semibold text-amber-500">{pending}d</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl text-center text-xs text-[var(--text-muted)]">
            No active leave balances assigned. Contact your salon manager to initialize leave quotas.
          </div>
        )}
      </div>

      {/* Leave Application History Table */}
      <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          My Leave Request History
        </h3>

        {isLoadingRequests ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : safeRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">Leave Type</th>
                  <th className="pb-3 px-3">Period</th>
                  <th className="pb-3 px-3">Duration</th>
                  <th className="pb-3 px-3">Reason</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Applied On</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {safeRequests.map((req) => {
                  const isFutureOrPending =
                    req.status === 'pending' ||
                    (req.status === 'approved' && new Date(req.startDate) >= new Date());

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      <td className="py-3 px-3">
                        <span className="font-bold text-[var(--text-primary)]">
                          {req.leaveType?.name}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          {req.leaveType?.code}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[var(--text-secondary)]">
                        {new Date(req.startDate).toLocaleDateString()} —{' '}
                        {new Date(req.endDate).toLocaleDateString()}
                        {req.isHalfDay && (
                          <span className="block text-[10px] text-primary-500">
                            Half Day ({req.halfDayPeriod === 'FIRST_HALF' ? 'Morning' : 'Afternoon'})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                        {Number(req.totalDays ?? req.durationDays ?? 0)} day(s)
                      </td>

                      <td className="py-3 px-3 text-[var(--text-muted)] max-w-xs truncate">
                        {req.reason}
                      </td>

                      <td className="py-3 px-3">{getStatusBadge(req.status)}</td>

                      <td className="py-3 px-3 text-[var(--text-muted)]">
                        {new Date(req.appliedAt || req.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {isFutureOrPending && req.status !== 'cancelled' ? (
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => setCancellingRequestId(req.id)}
                            className="text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            Cancel
                          </Button>
                        ) : (
                          <span className="text-[11px] text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Leave Requests Found"
            description="You have not submitted any leave applications yet. Click below to apply."
            actionLabel="Apply for Leave"
            onAction={onOpenApplyModal}
          />
        )}
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={Boolean(cancellingRequestId)}
        onCancel={() => setCancellingRequestId(null)}
        onClose={() => setCancellingRequestId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Leave Request?"
        message="Are you sure you want to cancel this leave application? Any deducted or reserved leave balance will be restored automatically."
        confirmText="Yes, Cancel Leave"
        cancelText="Cancel"
        variant="danger"
        confirmVariant="danger"
        loading={isCancelling}
      />
    </div>
  );
}
