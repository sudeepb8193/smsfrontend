import React, { useState } from 'react';
import Button from '../../../components/shared/Button';
import CustomSelector from '../../../components/shared/CustomSelector';
import { SearchInput } from '../../../components/shared/SearchInput';
import { Badge } from '../../../components/shared/Badge';
import Skeleton from '../../../components/shared/Skeleton';
import EmptyState from '../../../components/shared/EmptyState';
import Pagination from '../../../components/shared/Pagination';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Filter,
  Eye,
  X,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

/**
 * LeaveRequestsTab: Administrative list of all staff leave requests with search,
 * status filtering, branch scoping, review drawer, and manager cancellation.
 */
export default function LeaveRequestsTab({
  requests = [],
  totalCount = 0,
  totalPages = 1,
  page = 1,
  limit = 10,
  onPageChange,
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  statusFilter = '',
  onStatusChange,
  leaveTypeFilter = '',
  onLeaveTypeChange,
  sortBy = 'appliedAt',
  sortOrder = 'desc',
  onSortChange,
  branches = [],
  leaveTypes = [],
  onOpenApplyModal,
  onReviewRequest,
  onCancelRequest,
  isCancelling = false,
  canApprove = false,
  canManage = false,
}) {
  const [selectedRequestForReview, setSelectedRequestForReview] = useState(null);
  const [cancellingRequestId, setCancellingRequestId] = useState(null);

  const handleSort = (field) => {
    if (!onSortChange) return;
    const nextOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(field, nextOrder);
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)] opacity-60 ml-1 inline-block" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary-500 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary-500 ml-1 inline-block" />
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="default">Cancelled</Badge>;
      case 'pending':
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  const safeBranches = Array.isArray(branches) ? branches : Array.isArray(branches?.data) ? branches.data : [];
  const safeLeaveTypes = Array.isArray(leaveTypes) ? leaveTypes : Array.isArray(leaveTypes?.items) ? leaveTypes.items : Array.isArray(leaveTypes?.data) ? leaveTypes.data : [];
  const safeRequests = Array.isArray(requests) ? requests : Array.isArray(requests?.data) ? requests.data : Array.isArray(requests?.items) ? requests.items : [];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const branchOptions = [
    { value: '', label: 'All Branches' },
    ...safeBranches.map((b) => ({ value: b.id, label: b.name })),
  ];

  const leaveTypeOptions = [
    { value: '', label: 'All Leave Types' },
    ...safeLeaveTypes.map((lt) => ({ value: lt.id, label: `${lt.name} (${lt.code})` })),
  ];

  const handleConfirmCancel = async () => {
    if (!cancellingRequestId) return;
    try {
      await onCancelRequest({ id: cancellingRequestId, reason: 'Cancelled by administrator' });
    } finally {
      setCancellingRequestId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters & Action Button */}
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="w-full md:w-64">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search employee or code..."
            />
          </div>

          <div className="w-36">
            <CustomSelector
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => onStatusChange(val || '')}
              isClearable={false}
              isSearchable={false}
            />
          </div>

          <div className="w-44">
            <CustomSelector
              options={leaveTypeOptions}
              value={leaveTypeFilter}
              onChange={(val) => onLeaveTypeChange(val || '')}
              isClearable={false}
            />
          </div>
        </div>

        {canManage && (
          <Button
            variant="primary"
            onClick={onOpenApplyModal}
            className="flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for Staff</span>
          </Button>
        )}
      </div>

      {/* Requests Table */}
      <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : safeRequests.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                    <th
                      className="pb-3 px-3 cursor-pointer select-none hover:text-[var(--text-primary)]"
                      onClick={() => handleSort('staffName')}
                    >
                      <span className="flex items-center">
                        Employee {renderSortIcon('staffName')}
                      </span>
                    </th>
                    <th className="pb-3 px-3">Branch</th>
                    <th className="pb-3 px-3">Leave Type</th>
                    <th
                      className="pb-3 px-3 cursor-pointer select-none hover:text-[var(--text-primary)]"
                      onClick={() => handleSort('startDate')}
                    >
                      <span className="flex items-center">
                        Period {renderSortIcon('startDate')}
                      </span>
                    </th>
                    <th
                      className="pb-3 px-3 cursor-pointer select-none hover:text-[var(--text-primary)]"
                      onClick={() => handleSort('totalDays')}
                    >
                      <span className="flex items-center">
                        Duration {renderSortIcon('totalDays')}
                      </span>
                    </th>
                    <th
                      className="pb-3 px-3 cursor-pointer select-none hover:text-[var(--text-primary)]"
                      onClick={() => handleSort('status')}
                    >
                      <span className="flex items-center">
                        Status {renderSortIcon('status')}
                      </span>
                    </th>
                    <th className="pb-3 px-3">Reason</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {safeRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      <td className="py-3 px-3">
                        <span className="font-bold text-[var(--text-primary)]">
                          {req.staff?.fullName || `${req.staff?.firstName || ''} ${req.staff?.lastName || ''}`.trim() || 'Staff'}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          {req.staff?.employeeCode || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[var(--text-secondary)]">
                        {req.branch?.name || req.staff?.homeBranch?.name || req.staff?.branch?.name || 'All'}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {req.leaveType?.name}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          {req.leaveType?.isPaid ? 'Paid' : 'Unpaid'}
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

                      <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                        {Number(req.totalDays ?? req.durationDays ?? 0)}d
                      </td>

                      <td className="py-3 px-3">{getStatusBadge(req.status)}</td>

                      <td className="py-3 px-3 text-[var(--text-muted)] max-w-xs truncate">
                        {req.reason}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canApprove && req.status === 'pending' && (
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => onReviewRequest(req)}
                            >
                              Review
                            </Button>
                          )}

                          {(canManage || canApprove) && (req.status === 'approved' || req.status === 'pending') && (
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => setCancellingRequestId(req.id)}
                              className="text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-[var(--border-color)]">
              <Pagination
                currentPage={page}
                totalPages={totalPages || Math.ceil((totalCount || 0) / limit) || 1}
                totalItems={totalCount}
                pageSize={limit}
                onPageChange={onPageChange}
              />
            </div>
          </>
        ) : (
          <EmptyState
            title="No Leave Applications Found"
            description="No leave requests match your search or filter criteria."
          />
        )}
      </div>

      {/* Confirmation Dialog for Manager Cancellation */}
      <ConfirmDialog
        isOpen={Boolean(cancellingRequestId)}
        onCancel={() => setCancellingRequestId(null)}
        onClose={() => setCancellingRequestId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Employee Leave Request?"
        message="Are you sure you want to administratively cancel this leave request? If approved, the deducted leave balance will be restored and attendance status unblocked."
        confirmText="Yes, Cancel Request"
        cancelText="Cancel"
        variant="danger"
        confirmVariant="danger"
        loading={isCancelling}
      />
    </div>
  );
}
