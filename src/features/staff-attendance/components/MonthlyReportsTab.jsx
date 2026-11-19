import React from 'react';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import CustomSelector from '../../../components/shared/CustomSelector';
import {
  FileSpreadsheet,
  Printer,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
} from 'lucide-react';

export const MonthlyReportsTab = ({
  data,
  isLoading,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onRecalculate,
  onExportCsv,
  isRecalculating,
  canManage,
  canExport,
  canPrint,
}) => {
  const summaries = data?.data || [];
  const isFinal = data?.isFinal || false;
  const statusLabel = data?.statusLabel || 'Provisional — Pending final period approval';

  const years = [2024, 2025, 2026, 2027].map((y) => ({
    value: y,
    label: String(y),
  }));

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-36">
            <CustomSelector
              options={months}
              value={selectedMonth}
              onChange={(val) => onMonthChange(Number(val))}
              placeholder="Select Month"
              isClearable={false}
              isSearchable={false}
            />
          </div>
          <div className="w-28">
            <CustomSelector
              options={years}
              value={selectedYear}
              onChange={(val) => onYearChange(Number(val))}
              placeholder="Select Year"
              isClearable={false}
              isSearchable={false}
            />
          </div>
          {data?.data?.[0]?.generatedAt && (
            <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
              <Clock size={12} /> Generated as of{' '}
              {new Date(data.data[0].generatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="secondary"
              onClick={onRecalculate}
              disabled={isRecalculating}
              icon={RefreshCw}
            >
              {isRecalculating ? 'Recalculating...' : 'Recalculate'}
            </Button>
          )}

          {canPrint && (
            <Button
              variant="secondary"
              onClick={handlePrint}
              icon={Printer}
            >
              Print
            </Button>
          )}

          {canExport && (
            <Button
              variant="primary"
              onClick={onExportCsv}
              icon={FileSpreadsheet}
            >
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Finality Status Alert */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
          isFinal
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {isFinal ? (
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
          )}
          <span className="font-semibold">{statusLabel}</span>
        </div>
        <Badge variant={isFinal ? 'success' : 'warning'}>
          {isFinal ? 'FINAL' : 'PROVISIONAL'}
        </Badge>
      </div>

      {/* Precomputed Monthly Summary Table */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader size="lg" text="Loading monthly attendance rollup..." />
          </div>
        ) : summaries.length === 0 ? (
          <EmptyState
            title="No monthly attendance summary found"
            description="Recalculate or select another month/branch to view precomputed rollups."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="bg-[var(--bg-app)] uppercase font-semibold text-[11px] text-[var(--text-secondary)] border-b border-[var(--border-color)] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Working Days</th>
                  <th className="py-3 px-4">Present</th>
                  <th className="py-3 px-4">Late</th>
                  <th className="py-3 px-4">Absent</th>
                  <th className="py-3 px-4">Leave</th>
                  <th className="py-3 px-4">Total Worked</th>
                  <th className="py-3 px-4">Overtime</th>
                  <th className="py-3 px-4">Payroll Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {summaries.map((row) => (
                  <tr
                    key={row.id}
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
                            row.fullName?.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">
                            {row.fullName}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            {row.employeeCode} • {row.designation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                      {row.totalWorkingDays}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      {row.totalPresentDays}
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400 font-medium">
                      {row.totalLateDays}
                    </td>
                    <td className="py-3 px-4 font-mono text-rose-600 dark:text-rose-400 font-medium">
                      {row.totalAbsentDays}
                    </td>
                    <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 font-medium">
                      {row.totalLeaveDays}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[var(--text-primary)]">
                      {row.totalWorkedHoursFormatted}
                    </td>
                    <td className="py-3 px-4 font-mono text-primary-600 dark:text-primary-400 font-medium">
                      {row.totalOvertimeHoursFormatted}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={row.isFinal ? 'success' : 'warning'}>
                        {row.isFinal ? 'Locked Final' : 'Provisional'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReportsTab;
