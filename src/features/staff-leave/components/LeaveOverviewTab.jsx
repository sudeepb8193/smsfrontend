import React from 'react';
import StateCard from '../../../components/shared/StateCard';
import Button from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';
import Skeleton from '../../../components/shared/Skeleton';
import EmptyState from '../../../components/shared/EmptyState';
import {
  CalendarDays,
  Clock,
  UserCheck,
  CalendarOff,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

/**
 * LeaveOverviewTab: Executive snapshot of salon leave metrics,
 * pending queues, on-leave staff today, and active blackout periods.
 */
export default function LeaveOverviewTab({
  balancesData = {},
  requestsData = {},
  approvalsData = {},
  blackoutData = {},
  isLoading = false,
  onOpenApplyModal,
  onNavigateTab,
  canApprove = false,
  canManage = false,
}) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const approvalsList = Array.isArray(approvalsData?.data)
    ? approvalsData.data
    : Array.isArray(approvalsData?.items)
    ? approvalsData.items
    : Array.isArray(approvalsData)
    ? approvalsData
    : [];

  const recentRequests = Array.isArray(requestsData?.data)
    ? requestsData.data
    : Array.isArray(requestsData?.items)
    ? requestsData.items
    : Array.isArray(requestsData)
    ? requestsData
    : [];

  const blackoutPeriods = Array.isArray(blackoutData?.data)
    ? blackoutData.data
    : Array.isArray(blackoutData?.items)
    ? blackoutData.items
    : Array.isArray(blackoutData)
    ? blackoutData
    : [];

  const pendingCount = approvalsData?.total || approvalsData?.count || approvalsList.length;

  // Filter staff currently on leave today
  const todayStr = new Date().toISOString().slice(0, 10);
  const onLeaveToday = recentRequests.filter(
    (r) =>
      r.status === 'approved' &&
      r.startDate?.slice(0, 10) <= todayStr &&
      r.endDate?.slice(0, 10) >= todayStr,
  );

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StateCard
          title="Pending Approvals"
          value={pendingCount}
          icon={Clock}
          color="amber"
          description={pendingCount > 0 ? 'Requires manager attention' : 'All requests reviewed'}
          onClick={() => onNavigateTab('approvals')}
          className="cursor-pointer hover:shadow-md transition-shadow"
        />

        <StateCard
          title="Staff On Leave Today"
          value={onLeaveToday.length}
          icon={UserCheck}
          color="blue"
          description="Active verified absences"
          onClick={() => onNavigateTab('calendar')}
          className="cursor-pointer hover:shadow-md transition-shadow"
        />

        <StateCard
          title="Active Blackouts"
          value={blackoutPeriods.filter((b) => b.isActive).length}
          icon={CalendarOff}
          color="rose"
          description="Enforced blackout windows"
          onClick={() => onNavigateTab('blackout')}
          className="cursor-pointer hover:shadow-md transition-shadow"
        />

        <StateCard
          title="Total Requests Logged"
          value={requestsData?.total || recentRequests.length}
          icon={CalendarDays}
          color="emerald"
          description="Current calendar cycle"
          onClick={() => onNavigateTab('requests')}
          className="cursor-pointer hover:shadow-md transition-shadow"
        />
      </div>

      {/* Quick Action Bar */}
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Quick Actions</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Streamline staff leave operations, approvals, and balance adjustments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="primary" onClick={onOpenApplyModal} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Apply for Leave</span>
          </Button>

          {canApprove && (
            <Button
              variant="outline"
              onClick={() => onNavigateTab('approvals')}
              className="flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Approval Queue ({pendingCount})</span>
            </Button>
          )}

          {canManage && (
            <Button
              variant="outline"
              onClick={() => onNavigateTab('balances')}
              className="flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-primary-500" />
              <span>Balance Management</span>
            </Button>
          )}
        </div>
      </div>

      {/* Dual Column: Pending Approvals Queue & Today's Absences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals Widget */}
        <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Pending Leave Requests
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('approvals')}
                className="text-xs text-primary-500 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {approvalsList.length > 0 ? (
              <div className="space-y-3">
                {approvalsList.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">
                        {req.staff?.firstName} {req.staff?.lastName}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {req.leaveType?.name} • {req.durationDays} day(s) •{' '}
                        {new Date(req.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="warning" className="text-[10px]">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                <p>No pending approvals. All caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Staff on Leave Today Widget */}
        <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary-500" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Staff On Leave Today
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('calendar')}
                className="text-xs text-primary-500 hover:underline flex items-center gap-1"
              >
                <span>View calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {onLeaveToday.length > 0 ? (
              <div className="space-y-3">
                {onLeaveToday.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">
                        {req.staff?.firstName} {req.staff?.lastName}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {req.leaveType?.name} • Until {new Date(req.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="primary" className="text-[10px]">
                      {req.isHalfDay ? 'Half Day' : 'Full Day'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                <UserCheck className="w-8 h-8 text-primary-500/50 mx-auto mb-2" />
                <p>All scheduled staff are available today. No active leaves.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
