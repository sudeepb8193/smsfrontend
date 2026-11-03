import React, { useState } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import SearchInput from '../../../components/shared/SearchInput';
import CustomSelector from '../../../components/shared/CustomSelector';
import EmptyState from '../../../components/shared/EmptyState';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import Pagination from '../../../components/shared/Pagination';
import BlockedTimeModal from './modals/BlockedTimeModal';
import {
  Clock,
  ShieldAlert,
  Calendar,
  Users,
  Repeat,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Briefcase,
  User,
  MoreHorizontal,
} from 'lucide-react';

const REASON_PILLS = {
  training: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  meeting: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  personal: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  other: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
};

// Format HH:MM to 1:00 PM or 10:00 AM
function formatTime12(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  const mPart = m < 10 ? `0${m}` : m;
  return `${h}:${mPart} ${ampm}`;
}

function formatDateNice(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlockedTimeTab({
  blockedTimes = [],
  staffList = [],
  branches = [],
  selectedBranchId = '',
  loading = false,
  onCreate,
  onBulkCreate,
  onCancel,
  canManage = false,
}) {
  const [search, setSearch] = useState('');
  const [staffFilter, setStaffFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
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

  // Filter blocked times
  const filteredBlocks = blockedTimes.filter((block) => {
    if (reasonFilter !== 'all' && block.reasonCategory !== reasonFilter) return false;
    if (staffFilter !== 'all' && block.staffId !== staffFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const staffName = block.staff?.fullName?.toLowerCase() || '';
      const note = block.note?.toLowerCase() || '';
      const date = block.blockDate || '';
      return staffName.includes(q) || note.includes(q) || date.includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredBlocks.length / pageSize) || 1;
  const pagedBlocks = filteredBlocks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleSubmitModal = async (payload) => {
    try {
      setActionLoading(true);
      if (payload.staffIds && payload.staffIds.length > 0) {
        await onBulkCreate(payload);
      } else {
        await onCreate(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to create blocked time:', err);
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
      console.error('Failed to cancel blocked time:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar matching Image Panel 6 */}
      <div className="p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Side Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
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

          {/* All Reasons */}
          <div className="w-36">
            <CustomSelector
              value={reasonFilter}
              onChange={setReasonFilter}
              options={[
                { value: 'all', label: 'All Reasons' },
                { value: 'training', label: 'Training' },
                { value: 'meeting', label: 'Meeting' },
                { value: 'personal', label: 'Personal' },
                { value: 'other', label: 'Other' },
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

      {/* Table matching Image Panel 6 */}
      {filteredBlocks.length > 0 ? (
        <>
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs overflow-hidden">
            <div className="overflow-x-auto min-h-[240px]">
              <table className="w-full text-left border-collapse text-xs min-w-[850px]">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)]/50 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Recurrence</th>
                  <th className="py-3 px-4">Created By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-xs">
                {pagedBlocks.map((block) => {
                  const staffInitials = block.staff?.fullName
                    ? block.staff.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'ST';

                  const reasonKey = block.reasonCategory || 'other';
                  const pillClass = REASON_PILLS[reasonKey] || REASON_PILLS.other;
                  const reasonLabel = reasonKey.charAt(0).toUpperCase() + reasonKey.slice(1);

                  return (
                    <tr
                      key={block.id}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors group"
                    >
                      {/* Employee Avatar + Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {block.staff?.profilePhotoUrl ? (
                            <img
                              src={block.staff.profilePhotoUrl}
                              alt={block.staff.fullName}
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-[var(--border-color)]"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-primary-500/15 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-[10px] shrink-0 border border-primary-500/20">
                              {staffInitials}
                            </div>
                          )}
                          <div className="font-bold text-[var(--text-primary)]">
                            {block.staff?.fullName || 'Stylist'}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[var(--text-primary)]">
                        {formatDateNice(block.blockDate)}
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)] font-medium">
                        {formatTime12(block.startTime)} – {formatTime12(block.endTime)}
                      </td>

                      {/* Reason Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${pillClass}`}
                        >
                          {reasonLabel}
                        </span>
                      </td>

                      {/* Recurrence */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] font-medium">
                        {block.isRecurring ? 'Weekly' : 'No'}
                      </td>

                      {/* Created By */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {block.creator?.fullName || block.staff?.fullName || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-[var(--text-muted)]">
                          <button
                            type="button"
                            onClick={() => setModalOpen(true)}
                            className="p-1.5 rounded-lg hover:text-primary-500 hover:bg-[var(--bg-input)] transition cursor-pointer"
                            title="Edit Blocked Time"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelCandidate(block)}
                            className="p-1.5 rounded-lg hover:text-rose-500 hover:bg-[var(--bg-input)] transition cursor-pointer"
                            title="Cancel Blocked Time"
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
        {filteredBlocks.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredBlocks.length}
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
          title="No Blocked Time Records"
          description="No blocked out time periods recorded for training, meetings, or salon maintenance."
          actionLabel="Block Time"
          onAction={() => setModalOpen(true)}
        />
      )}

      {/* Blocked Time Modal */}
      {modalOpen && (
        <BlockedTimeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitModal}
          staffList={staffList}
          branches={branches}
          currentBranchId={selectedBranchId}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation */}
      {cancelCandidate && (
        <ConfirmDialog
          isOpen={!!cancelCandidate}
          title="Remove Blocked Time"
          message={`Are you sure you want to remove the blocked time (${cancelCandidate.startTime} - ${
            cancelCandidate.endTime
          }) for ${cancelCandidate.staff?.fullName || 'this employee'} on ${
            cancelCandidate.blockDate
          }?`}
          confirmLabel="Remove Block"
          confirmVariant="danger"
          loading={actionLoading}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelCandidate(null)}
        />
      )}
    </div>
  );
}
