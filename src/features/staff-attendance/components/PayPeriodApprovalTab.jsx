import React from 'react';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import DatePicker from '../../../components/shared/DatePicker';
import {
  ShieldCheck,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export const PayPeriodApprovalTab = ({
  data,
  isLoading,
  periodStart,
  periodEnd,
  onPeriodStartChange,
  onPeriodEndChange,
  onApproveStaff,
  onBulkApproveClean,
  onReopenStaff,
  canApprove,
  canReject,
}) => {
  const staffRows = data?.data || [];
  const cleanCount = staffRows.filter(
    (r) => r.isClean && r.approvalStatus !== 'approved',
  ).length;

  return (
    <div className="space-y-4">
      {/* Top Controls: Period Selection & Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            Pay Period Range:
          </span>
          <div className="w-40">
            <DatePicker
              value={periodStart}
              onChange={onPeriodStartChange}
              placeholder="Start date"
            />
          </div>
          <span className="text-[var(--text-muted)] text-xs">to</span>
          <div className="w-40">
            <DatePicker
              value={periodEnd}
              onChange={onPeriodEndChange}
              placeholder="End date"
            />
          </div>
        </div>

        {canApprove && (
          <Button
            variant="primary"
            onClick={onBulkApproveClean}
            disabled={cleanCount === 0 || isLoading}
            icon={ShieldCheck}
          >
            Approve All Clean Records ({cleanCount})
          </Button>
        )}
      </div>

      {/* Pay Period Approval Grid / Table */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-xs">
        {isLoading ? (
          <Loader type="table" rows={10} columns={7} text="Evaluating pay-period attendance..." />
        ) : staffRows.length === 0 ? (
          <EmptyState
            title="No staff attendance records in this period"
            description="Select a valid period range to review employee attendance for payroll sign-off."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="bg-[var(--bg-app)] uppercase font-semibold text-[11px] text-[var(--text-secondary)] border-b border-[var(--border-color)] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Days Present</th>
                  <th className="py-3 px-4">Late / Early</th>
                  <th className="py-3 px-4">Absent</th>
                  <th className="py-3 px-4">Worked Hours</th>
                  <th className="py-3 px-4">Overtime</th>
                  <th className="py-3 px-4">Corrections</th>
                  <th className="py-3 px-4">Status & Lock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {staffRows.map((row) => {
                  const isApproved = row.approvalStatus === 'approved';
                  const isReopened = row.approvalStatus === 'reopened';

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
                              {isApproved && (
                                <Lock size={12} className="text-emerald-500" title="Locked by Period Approval" />
                              )}
                              {isReopened && (
                                <Unlock size={12} className="text-amber-500" title="Period Reopened" />
                              )}
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)]">
                              {row.employeeCode} • {row.designation}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                        {row.presentDays} / {row.totalRecordedDays}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400 font-medium">
                        {row.lateDays}
                      </td>
                      <td className="py-3 px-4 font-mono text-rose-600 dark:text-rose-400 font-medium">
                        {row.absentDays}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        {row.totalWorkedHoursFormatted}
                      </td>
                      <td className="py-3 px-4 font-mono text-primary-600 dark:text-primary-400 font-medium">
                        {row.totalOvertimeHoursFormatted}
                      </td>
                      <td className="py-3 px-4">
                        {row.pendingCorrectionCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-300 font-bold">
                            <AlertTriangle size={14} />
                            {row.pendingCorrectionCount} Pending
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">Clean</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isApproved ? (
                          <Badge variant="success">Approved & Locked</Badge>
                        ) : isReopened ? (
                          <Badge variant="warning">Reopened</Badge>
                        ) : (
                          <Badge variant="neutral">Pending Approval</Badge>
                        )}
                        {row.approvedBy && (
                          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            By {row.approvedBy}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canApprove && !isApproved && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onApproveStaff(row)}
                              disabled={row.pendingCorrectionCount > 0}
                              title={
                                row.pendingCorrectionCount > 0
                                  ? 'Resolve pending corrections before approval'
                                  : 'Sign off & lock period'
                              }
                              icon={CheckCircle2}
                            >
                              Approve
                            </Button>
                          )}

                          {canReject && isApproved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onReopenStaff(row)}
                              icon={Unlock}
                              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                            >
                              Reopen
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
      </div>
    </div>
  );
};

export default PayPeriodApprovalTab;
