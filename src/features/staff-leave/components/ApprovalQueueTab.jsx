import React from 'react';
import Button from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';
import { SearchInput } from '../../../components/shared/SearchInput';
import Skeleton from '../../../components/shared/Skeleton';
import EmptyState from '../../../components/shared/EmptyState';
import Pagination from '../../../components/shared/Pagination';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  ExternalLink,
  ShieldAlert,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

/**
 * ApprovalQueueTab: Action-oriented approval inbox for managers.
 * Surfaces pending requests, live balance shortfall warnings, and one-click reviews.
 */
export default function ApprovalQueueTab({
  pendingRequests = [],
  totalCount = 0,
  totalPages = 1,
  page = 1,
  limit = 10,
  onPageChange,
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  sortBy = 'appliedAt',
  sortOrder = 'asc',
  onSortChange,
  onReviewRequest,
}) {
  const safeRequests = Array.isArray(pendingRequests)
    ? pendingRequests
    : Array.isArray(pendingRequests?.items)
    ? pendingRequests.items
    : Array.isArray(pendingRequests?.data)
    ? pendingRequests.data
    : [];

  const handleToggleSort = () => {
    if (!onSortChange) return;
    onSortChange(sortBy || 'appliedAt', sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Controls */}
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Pending Leave Approvals Queue</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Review staff applications, assess coverage, and verify medical documentation before approving
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onSearchChange && (
            <div className="w-full sm:w-56">
              <SearchInput
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Search staff..."
              />
            </div>
          )}

          {onSortChange && (
            <Button
              variant="outline"
              size="small"
              onClick={handleToggleSort}
              className="flex items-center gap-1.5"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-primary-500" />
              <span>{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
            </Button>
          )}

          <Badge variant="warning" className="text-xs font-bold px-3 py-1">
            {totalCount || safeRequests.length} Pending
          </Badge>
        </div>
      </div>

      {/* Queue List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : safeRequests.length > 0 ? (
        <div className="space-y-4">
          {safeRequests.map((req) => {
            const staff = req.staff || {};
            const staffName = staff.fullName || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Staff';
            const initials = staffName.slice(0, 2).toUpperCase();
            const leaveType = req.leaveType || {};
            const balance = req.balanceMetrics || null;
            const availableDays = balance ? Number(balance.availableBalance ?? balance.availableDays ?? 0) : null;
            const requestedDays = Number(req.totalDays ?? req.durationDays ?? 0);
            const isShortfall = availableDays !== null && requestedDays > availableDays;

            return (
              <div
                key={req.id}
                className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Employee & Timing Information */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center font-bold text-primary-600 text-sm shrink-0">
                    {initials}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">
                        {staffName}
                      </h4>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        ({staff.employeeCode || 'N/A'})
                      </span>
                      <Badge variant="primary" className="text-[10px]">
                        {leaveType.name} ({leaveType.code})
                      </Badge>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {leaveType.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary-500" />
                        {new Date(req.startDate).toLocaleDateString()} —{' '}
                        {new Date(req.endDate).toLocaleDateString()}
                      </span>

                      <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                        <Clock className="w-3.5 h-3.5 text-primary-500" />
                        {requestedDays} working day(s)
                      </span>

                      {(req.branch?.name || staff.homeBranch?.name) && (
                        <span>Branch: {req.branch?.name || staff.homeBranch?.name}</span>
                      )}
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-[var(--text-muted)] italic pt-1">
                      "{req.reason}"
                    </p>

                    {/* Document Link */}
                    {req.supportingDocumentUrl && (
                      <div className="pt-1">
                        <a
                          href={req.supportingDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Uploaded Document</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics & Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 lg:border-l lg:border-[var(--border-color)] lg:pl-6">
                  {/* Balance Impact */}
                  {availableDays !== null && (
                    <div className="text-right sm:text-left min-w-[120px]">
                      <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">
                        Balance Available
                      </span>
                      <span
                        className={`text-base font-bold ${
                          isShortfall ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {availableDays} days
                      </span>
                      {isShortfall && (
                        <span className="text-[10px] text-amber-500 block font-semibold">
                          Shortfall by {requestedDays - availableDays}d
                        </span>
                      )}
                    </div>
                  )}

                  <Button
                    variant="primary"
                    onClick={() => onReviewRequest(req)}
                    className="shadow-sm"
                  >
                    Review Application
                  </Button>
                </div>
              </div>
            );
          })}

          {onPageChange && (
            <div className="pt-3 border-t border-[var(--border-color)]">
              <Pagination
                currentPage={page}
                totalPages={totalPages || Math.ceil((totalCount || 0) / limit) || 1}
                totalItems={totalCount}
                pageSize={limit}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No Pending Approvals"
          description="All staff leave applications have been reviewed. Good job!"
        />
      )}
    </div>
  );
}
