import React from 'react';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import Pagination from '../../../components/shared/Pagination';
import DatePicker from '../../../components/shared/DatePicker';
import CustomSelector from '../../../components/shared/CustomSelector';
import SearchInput from '../../../components/shared/SearchInput';
import {
  Calendar,
  Clock,
  Plus,
  Lock,
  Edit3,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const DailyAttendanceTab = ({
  data,
  isLoading,
  selectedDate,
  onDateChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  page,
  onPageChange,
  onOpenManualEntry,
  onRequestCorrection,
  canCreate,
  canUpdate,
}) => {
  const staffRows = data?.data || [];
  const total = data?.total || 0;
  const limit = data?.limit || 10;
  const totalPages = data?.totalPages || 1;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <Badge variant="success">Present</Badge>;
      case 'late':
        return <Badge variant="warning">Late</Badge>;
      case 'early_exit':
        return <Badge variant="warning">Early Exit</Badge>;
      case 'half_day':
        return <Badge variant="warning">Half Day</Badge>;
      case 'absent':
        return <Badge variant="danger">Absent</Badge>;
      case 'on_leave':
        return <Badge variant="info">On Leave</Badge>;
      case 'holiday':
        return <Badge variant="neutral">Holiday</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Filters, Date, Manual Entry */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Shared DatePicker */}
          <div className="w-44">
            <DatePicker
              value={selectedDate}
              onChange={onDateChange}
              placeholder="Select date..."
            />
          </div>

          {/* Shared SearchInput */}
          <div className="w-64 max-w-xs">
            <SearchInput
              placeholder="Search staff name or code..."
              value={searchQuery}
              onChange={onSearchChange}
            />
          </div>

          {/* Shared CustomSelector */}
          <div className="w-48">
            <CustomSelector
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'present', label: 'Present' },
                { value: 'late', label: 'Late' },
                { value: 'early_exit', label: 'Early Exit' },
                { value: 'half_day', label: 'Half Day' },
                { value: 'absent', label: 'Absent' },
                { value: 'on_leave', label: 'On Leave' },
                { value: 'holiday', label: 'Holiday' },
              ]}
              value={statusFilter}
              onChange={onStatusFilterChange}
              placeholder="Filter status..."
              isClearable={false}
              isSearchable={false}
            />
          </div>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            onClick={onOpenManualEntry}
            icon={Plus}
          >
            Manual Punch
          </Button>
        )}
      </div>

      {/* Daily Attendance Table */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader size="lg" text="Loading daily attendance roster..." />
          </div>
        ) : staffRows.length === 0 ? (
          <EmptyState
            title="No staff attendance records found"
            description="No staff matched your filters for the selected date."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="bg-[var(--bg-app)] uppercase font-semibold text-[11px] text-[var(--text-secondary)] border-b border-[var(--border-color)] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Scheduled Shift</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Worked</th>
                  <th className="py-3 px-4">Overtime</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {staffRows.map((row) => {
                  const hours = Math.floor((row.workedMinutes || 0) / 60);
                  const mins = (row.workedMinutes || 0) % 60;
                  const workedFormatted =
                    row.workedMinutes !== null ? `${hours}h ${mins}m` : '—';
                  const otHours = Math.floor((row.overtimeMinutes || 0) / 60);
                  const otMins = (row.overtimeMinutes || 0) % 60;
                  const otFormatted =
                    row.overtimeMinutes > 0 ? `${otHours}h ${otMins}m` : '—';

                  return (
                    <tr
                      key={row.staffId}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0 border border-purple-500/20">
                            {row.profilePhotoUrl ? (
                              <img
                                src={row.profilePhotoUrl}
                                alt={row.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              row.fullName.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                              {row.fullName}
                              {row.isCurrentlyIn && (
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Currently Clocked In" />
                              )}
                              {row.isLocked && (
                                <Lock size={12} className="text-amber-500" title="Locked by Period Approval" />
                              )}
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)]">
                              {row.employeeCode} • {row.designation}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {row.homeBranch?.name || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-secondary)]">
                        {row.scheduledShift}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[var(--text-primary)] font-medium">
                          {formatTime(row.checkInAt)}
                        </div>
                        {row.checkInMethod && (
                          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-tight">
                            {row.checkInMethod.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[var(--text-primary)] font-medium">
                          {formatTime(row.checkOutAt)}
                        </div>
                        {row.checkOutMethod && (
                          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-tight">
                            {row.checkOutMethod.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                        {workedFormatted}
                      </td>
                      <td className="py-3 px-4 font-mono text-primary-600 dark:text-primary-400 font-medium">
                        {otFormatted}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {getStatusBadge(row.status)}
                          {row.hasPendingCorrection && (
                            <Badge variant="warning">Correction Pending</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canUpdate && !row.isLocked && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRequestCorrection(row)}
                              title="Request Punch Correction"
                              icon={Edit3}
                            >
                              Correct
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[var(--border-color)] flex justify-between items-center text-xs text-[var(--text-secondary)] bg-[var(--bg-app)]">
            <span>Showing page {page} of {totalPages} ({total} employees)</span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyAttendanceTab;
