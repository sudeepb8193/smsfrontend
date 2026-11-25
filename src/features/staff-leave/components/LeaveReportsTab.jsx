import React, { useState } from 'react';
import Button from '../../../components/shared/Button';
import CustomSelector from '../../../components/shared/CustomSelector';
import { Badge } from '../../../components/shared/Badge';
import StateCard from '../../../components/shared/StateCard';
import Skeleton from '../../../components/shared/Skeleton';
import EmptyState from '../../../components/shared/EmptyState';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  PieChart,
  UserCheck,
  TrendingDown,
} from 'lucide-react';
import { toast } from '../../../components/shared/Toast';

/**
 * LeaveReportsTab: Leave utilization analytics and CSV export interface.
 * Shows high-level rollups by leave type, department, and paid vs unpaid utilization.
 */
export default function LeaveReportsTab({
  reportData = {},
  isLoading = false,
  year = new Date().getFullYear(),
  onYearChange,
  branches = [],
  onExportCsv,
  isExporting = false,
}) {
  const safeBranches = Array.isArray(branches) ? branches : Array.isArray(branches?.data) ? branches.data : [];

  const branchOptions = [
    { value: '', label: 'All Salon Branches' },
    ...safeBranches.map((b) => ({ value: b.id, label: b.name })),
  ];

  const yearOptions = [
    { value: 2024, label: '2024' },
    { value: 2025, label: '2025' },
    { value: 2026, label: '2026' },
    { value: 2027, label: '2027' },
  ];

  const summary = reportData?.summary || {};
  const rawBreakdown = reportData?.breakdown;
  const safeBreakdown = Array.isArray(rawBreakdown)
    ? rawBreakdown
    : Array.isArray(rawBreakdown?.data)
    ? rawBreakdown.data
    : [];

  const handleExport = async () => {
    try {
      await onExportCsv({ year });
    } catch (err) {
      toast.error('Failed to export leave data to CSV');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Year & Branch Selector & Export CTA */}
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-32">
            <CustomSelector
              options={yearOptions}
              value={year}
              onChange={(val) => onYearChange(val ? Number(val) : new Date().getFullYear())}
              isClearable={false}
              isSearchable={false}
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-1.5"
        >
          <Download className="w-4 h-4 text-emerald-500" />
          <span>Export CSV Report</span>
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StateCard
          title="Total Leave Taken"
          value={`${summary.totalDaysTaken || 0}d`}
          icon={Calendar}
          color="blue"
          description="Approved leave days"
        />

        <StateCard
          title="Paid Leave Days"
          value={`${summary.totalPaidDays || 0}d`}
          icon={Layers}
          color="emerald"
          description="Compensated absences"
        />

        <StateCard
          title="Unpaid Leave Days"
          value={`${summary.totalUnpaidDays || 0}d`}
          icon={TrendingDown}
          color="amber"
          description="Deducted from payroll"
        />

        <StateCard
          title="Employees Utilizing Leave"
          value={summary.employeesOnLeaveCount || 0}
          icon={UserCheck}
          color="rose"
          description="Staff taking at least 1 day"
        />
      </div>

      {/* Breakdown by Leave Type Table */}
      <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          Leave Utilization by Category
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : safeBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">Leave Type</th>
                  <th className="pb-3 px-3">Code</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3 text-center">Requests Logged</th>
                  <th className="pb-3 px-3 text-center">Total Days Taken</th>
                  <th className="pb-3 px-3 text-center">Avg Days / Request</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {safeBreakdown.map((row) => (
                  <tr
                    key={row.leaveTypeId || row.code}
                    className="hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                      {row.name}
                    </td>

                    <td className="py-3 px-3 font-mono text-[var(--text-muted)]">
                      {row.code}
                    </td>

                    <td className="py-3 px-3">
                      <Badge variant={row.isPaid ? 'success' : 'default'} className="text-[10px]">
                        {row.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </td>

                    <td className="py-3 px-3 text-center text-[var(--text-secondary)]">
                      {row.totalRequests || 0}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-primary-600">
                      {row.totalDays || 0}d
                    </td>

                    <td className="py-3 px-3 text-center text-[var(--text-muted)]">
                      {row.avgDaysPerRequest ? `${row.avgDaysPerRequest}d` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Report Data Available"
            description="Leave usage analytics will populate as staff submit and complete approved leaves."
          />
        )}
      </div>
    </div>
  );
}
