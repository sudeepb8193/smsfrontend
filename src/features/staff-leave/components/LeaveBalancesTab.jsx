import React, { useState } from 'react';
import Button from '../../../components/shared/Button';
import CustomSelector from '../../../components/shared/CustomSelector';
import { Input } from '../../../components/shared/Input';
import { SearchInput } from '../../../components/shared/SearchInput';
import { Badge } from '../../../components/shared/Badge';
import Skeleton from '../../../components/shared/Skeleton';
import EmptyState from '../../../components/shared/EmptyState';
import Pagination from '../../../components/shared/Pagination';
import {
  Scale,
  RefreshCw,
  Plus,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

/**
 * LeaveBalancesTab: Master balance control grid for Managers and HR.
 * Displays entitlements, accruals, deductions, and live available days with adjustment actions.
 */
export default function LeaveBalancesTab({
  balances = [],
  totalCount = 0,
  totalPages = 1,
  page = 1,
  limit = 10,
  onPageChange,
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  leaveTypeFilter = '',
  onLeaveTypeChange,
  sortBy = 'staffName',
  sortOrder = 'asc',
  onSortChange,
  year = new Date().getFullYear(),
  onYearChange,
  branches = [],
  leaveTypes = [],
  onOpenAdjustModal,
  onOpenAccrualModal,
  onInitializeBalances,
  isInitializing = false,
  canManage = false,
}) {
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
  const safeBranches = Array.isArray(branches) ? branches : Array.isArray(branches?.data) ? branches.data : [];
  const safeLeaveTypes = Array.isArray(leaveTypes) ? leaveTypes : Array.isArray(leaveTypes?.items) ? leaveTypes.items : Array.isArray(leaveTypes?.data) ? leaveTypes.data : [];
  const safeBalances = Array.isArray(balances) ? balances : Array.isArray(balances?.data) ? balances.data : Array.isArray(balances?.items) ? balances.items : Array.isArray(balances?.balances) ? balances.balances : [];

  const branchOptions = [
    { value: '', label: 'All Branches' },
    ...safeBranches.map((b) => ({ value: b.id, label: b.name })),
  ];

  const leaveTypeOptions = [
    { value: '', label: 'All Leave Types' },
    ...safeLeaveTypes.map((lt) => ({ value: lt.id, label: `${lt.name} (${lt.code})` })),
  ];

  const yearOptions = [
    { value: 2024, label: '2024' },
    { value: 2025, label: '2025' },
    { value: 2026, label: '2026' },
    { value: 2027, label: '2027' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Row */}
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="w-full sm:w-60">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search employee..."
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

          <div className="w-28">
            <CustomSelector
              options={yearOptions}
              value={year}
              onChange={(val) => onYearChange(val ? Number(val) : new Date().getFullYear())}
              isClearable={false}
              isSearchable={false}
            />
          </div>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              onClick={onOpenAccrualModal}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 text-primary-500" />
              <span>Accrual / Rollover</span>
            </Button>

            <Button
              variant="primary"
              onClick={() => onOpenAdjustModal()}
              className="flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>Manual Adjustment</span>
            </Button>
          </div>
        )}
      </div>

      {/* Balances Data Grid */}
      <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : safeBalances.length > 0 ? (
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
                    <th className="pb-3 px-3 text-center">Entitled</th>
                    <th
                      className="pb-3 px-3 text-center cursor-pointer select-none hover:text-[var(--text-primary)]"
                      onClick={() => handleSort('accruedDays')}
                    >
                      <span className="flex items-center justify-center">
                        Accrued {renderSortIcon('accruedDays')}
                      </span>
                    </th>
                    <th
                      className="pb-3 px-3 text-center cursor-pointer select-none hover:text-[var(--text-primary)]"
                      onClick={() => handleSort('usedDays')}
                    >
                      <span className="flex items-center justify-center">
                        Used {renderSortIcon('usedDays')}
                      </span>
                    </th>
                    <th className="pb-3 px-3 text-center">Pending</th>
                    <th
                      className="pb-3 px-3 text-center cursor-pointer select-none hover:text-[var(--text-primary)]"
                      onClick={() => handleSort('closingBalanceDays')}
                    >
                      <span className="flex items-center justify-center">
                        Available {renderSortIcon('closingBalanceDays')}
                      </span>
                    </th>
                    <th className="pb-3 px-3 w-40">Utilization</th>
                    {canManage && <th className="pb-3 px-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {safeBalances.map((b) => {
                    const entitled = Number(b.entitledDays || 0);
                    const accrued = Number(b.accruedDays || 0);
                    const used = Number(b.usedDays || 0);
                    const pending = Number(b.pendingDays || 0);
                    const available = Number(b.availableDays || 0);
                    const totalPool = entitled > 0 ? entitled : accrued > 0 ? accrued : 1;
                    const usedPercentage = Math.min(100, Math.round((used / totalPool) * 100));

                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-[var(--bg-card-hover)] transition-colors"
                      >
                        <td className="py-3 px-3">
                          <span className="font-bold text-[var(--text-primary)]">
                            {b.staff?.fullName || `${b.staff?.firstName || ''} ${b.staff?.lastName || ''}`.trim() || 'Staff'}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] block">
                            {b.staff?.employeeCode || 'N/A'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-[var(--text-secondary)]">
                          {b.staff?.homeBranch?.name || b.staff?.branch?.name || 'All Branches'}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {b.leaveType?.name}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] block">
                            {b.leaveType?.code} • {b.leaveType?.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center text-[var(--text-secondary)]">
                          {entitled}d
                        </td>

                        <td className="py-3 px-3 text-center text-[var(--text-secondary)]">
                          {accrued}d
                        </td>

                        <td className="py-3 px-3 text-center font-semibold text-rose-500">
                          {used}d
                        </td>

                        <td className="py-3 px-3 text-center text-amber-500">
                          {pending}d
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                            {available}d
                          </span>
                        </td>

                        {/* Visual Utilization Bar */}
                        <td className="py-3 px-3">
                          <div className="w-full bg-[var(--bg-card-hover)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                            <div
                              className="bg-primary-500 h-full rounded-full transition-all"
                              style={{ width: `${usedPercentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] block text-right mt-1">
                            {usedPercentage}% used
                          </span>
                        </td>

                        {canManage && (
                          <td className="py-3 px-3 text-right">
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() =>
                                onOpenAdjustModal({
                                  staffId: b.staffId,
                                  leaveTypeId: b.leaveTypeId,
                                })
                              }
                            >
                              Adjust
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
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
            title="No Leave Balances Found"
            description="No staff leave balances have been initialized for the selected year or filters."
            actionLabel={canManage ? 'Initialize Staff Balances' : undefined}
            onAction={canManage ? onInitializeBalances : undefined}
          />
        )}
      </div>
    </div>
  );
}
