import React, { useState } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import SearchInput from '../../../components/shared/SearchInput';
import CustomSelector from '../../../components/shared/CustomSelector';
import EmptyState from '../../../components/shared/EmptyState';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import Pagination from '../../../components/shared/Pagination';
import ScheduleOverrideModal from './modals/ScheduleOverrideModal';
import ShiftSwapModal from './modals/ShiftSwapModal';
import {
  Calendar,
  Clock,
  Plus,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Ban,
  Users,
} from 'lucide-react';

const OVERRIDE_TYPE_PILLS = {
  early_leave: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  late_arrival: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  extra_shift: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  shift_change: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  day_off: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
};

const OVERRIDE_TYPE_LABELS = {
  early_leave: 'Early Leave',
  late_arrival: 'Late Arrival',
  extra_shift: 'Extra Shift',
  shift_change: 'Shift Change',
  day_off: 'Day Off',
};

function formatDateNice(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ScheduleOverridesTab({
  overrides = [],
  staffList = [],
  loading = false,
  onCreateOverride,
  onCreateSwap,
  onReview,
  onCancel,
  canManage = false,
  currentStaffId = null,
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');

  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [cancelCandidate, setCancelCandidate] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Month navigation
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const monthDisplay = currentMonthDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const navigateMonth = (delta) => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentMonthDate(d);
  };

  // Filter overrides
  const filteredOverrides = overrides.filter((item) => {
    if (statusFilter !== 'all' && item.approvalStatus !== statusFilter) return false;
    if (typeFilter !== 'all' && item.overrideType !== typeFilter) return false;
    if (staffFilter !== 'all' && item.staffId !== staffFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const staffName = item.staff?.fullName?.toLowerCase() || '';
      const reason = item.reason?.toLowerCase() || '';
      const date = item.overrideDate || '';
      return staffName.includes(q) || reason.includes(q) || date.includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredOverrides.length / pageSize) || 1;
  const pagedOverrides = filteredOverrides.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleCreateOverrideSubmit = async (payload) => {
    try {
      setActionLoading(true);
      await onCreateOverride(payload);
      setOverrideModalOpen(false);
    } catch (err) {
      console.error('Failed to create override:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelCandidate) return;
    try {
      setActionLoading(true);
      await onCancel(cancelCandidate.id);
      setCancelCandidate(null);
    } catch (err) {
      console.error('Failed to cancel override:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar matching Image Panel 5 */}
      <div className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Side Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* All Types */}
          <div className="w-32">
            <CustomSelector
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'extra_shift', label: 'Extra Shift' },
                { value: 'shift_change', label: 'Shift Change' },
                { value: 'early_leave', label: 'Early Leave' },
                { value: 'late_arrival', label: 'Late Arrival' },
                { value: 'day_off', label: 'Day Off' },
              ]}
              isSearchable={false}
              isClearable={false}
            />
          </div>

          {/* All Status */}
          <div className="w-32">
            <CustomSelector
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'approved', label: 'Approved' },
                { value: 'pending', label: 'Pending' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              isSearchable={false}
              isClearable={false}
            />
          </div>

          {/* All Staff */}
          <div className="w-36">
            <CustomSelector
              value={staffFilter}
              onChange={setStaffFilter}
              options={[
                { value: 'all', label: 'All Staff' },
                ...staffList.map((s) => ({ value: s.id, label: s.fullName })),
              ]}
              isSearchable={false}
              isClearable={false}
            />
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-2 py-1">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold text-[var(--text-primary)] font-mono px-1">
              {monthDisplay}
            </span>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Side: Search Input */}
        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Table matching Image Panel 5 */}
      {filteredOverrides.length > 0 ? (
        <>
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs overflow-hidden">
            <div className="overflow-x-auto min-h-[240px]">
              <table className="w-full text-left border-collapse text-xs min-w-[850px]">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)]/50 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-xs">
                {pagedOverrides.map((item) => {
                  const staffInitials = item.staff?.fullName
                    ? item.staff.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'ST';

                  const typePill =
                    OVERRIDE_TYPE_PILLS[item.overrideType] ||
                    'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30';
                  const typeLabel =
                    OVERRIDE_TYPE_LABELS[item.overrideType] || item.overrideType?.replace('_', ' ');

                  const isApproved = item.approvalStatus === 'approved';
                  const isPending = item.approvalStatus === 'pending';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors group"
                    >
                      {/* Employee Avatar + Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.staff?.profilePhotoUrl ? (
                            <img
                              src={item.staff.profilePhotoUrl}
                              alt={item.staff.fullName}
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-[var(--border-color)]"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-primary-500/15 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-[10px] shrink-0 border border-primary-500/20">
                              {staffInitials}
                            </div>
                          )}
                          <div className="font-bold text-[var(--text-primary)]">
                            {item.staff?.fullName || 'Stylist'}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[var(--text-primary)]">
                        {formatDateNice(item.overrideDate)}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${typePill}`}
                        >
                          {typeLabel}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                        {item.startTime && item.endTime
                          ? `${item.startTime} – ${item.endTime}`
                          : 'Full Day'}
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] max-w-[200px] truncate" title={item.reason}>
                        {item.reason}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : isPending
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isApproved
                                ? 'bg-emerald-500'
                                : isPending
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span className="capitalize">{item.approvalStatus || 'Approved'}</span>
                        </span>
                      </td>

                      {/* Created / Reviewed By */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {item.reviewer?.fullName || item.staff?.fullName || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-[var(--text-muted)]">
                          <button
                            type="button"
                            onClick={() => setOverrideModalOpen(true)}
                            className="p-1.5 rounded-lg hover:text-primary-500 hover:bg-[var(--bg-input)] transition cursor-pointer"
                            title="Edit Override"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelCandidate(item)}
                            className="p-1.5 rounded-lg hover:text-rose-500 hover:bg-[var(--bg-input)] transition cursor-pointer"
                            title="Cancel Override"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shared Pagination Component */}
        {filteredOverrides.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOverrides.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        )}
      </>
      ) : (
        <EmptyState
          title="No Schedule Overrides"
          description="No one-off schedule exceptions or extra shifts found for the selected filter."
          actionLabel="Add Override"
          onAction={() => setOverrideModalOpen(true)}
        />
      )}

      {/* Override Modal */}
      {overrideModalOpen && (
        <ScheduleOverrideModal
          isOpen={overrideModalOpen}
          onClose={() => setOverrideModalOpen(false)}
          onSubmit={handleCreateOverrideSubmit}
          staffList={staffList}
          loading={actionLoading}
        />
      )}

      {/* Cancel Confirmation */}
      {cancelCandidate && (
        <ConfirmDialog
          isOpen={!!cancelCandidate}
          title="Cancel Schedule Override"
          message={`Are you sure you want to cancel the ${cancelCandidate.overrideType?.replace('_', ' ')} for ${
            cancelCandidate.staff?.fullName || 'this employee'
          } on ${cancelCandidate.overrideDate}?`}
          confirmLabel="Cancel Override"
          confirmVariant="danger"
          loading={actionLoading}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelCandidate(null)}
        />
      )}
    </div>
  );
}
