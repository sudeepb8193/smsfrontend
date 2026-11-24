import React from 'react';
import CustomSelector from '../../../components/shared/CustomSelector';
import { Badge } from '../../../components/shared/Badge';
import Skeleton from '../../../components/shared/Skeleton';
import EmptyState from '../../../components/shared/EmptyState';
import Pagination from '../../../components/shared/Pagination';
import {
  Scale,
  Calendar,
  Clock,
  User,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';

/**
 * BalanceAdjustmentsTab: Immutable audit trail ledger displaying every modification
 * to staff leave balances (manual grants, monthly accruals, approvals, cancellations, roll-overs).
 */
export default function BalanceAdjustmentsTab({
  transactions = [],
  totalCount = 0,
  totalPages = 1,
  page = 1,
  limit = 10,
  onPageChange,
  isLoading = false,
  transactionTypeFilter = '',
  onTransactionTypeChange,
}) {
  const safeTransactions = Array.isArray(transactions)
    ? transactions
    : Array.isArray(transactions?.data)
    ? transactions.data
    : Array.isArray(transactions?.items)
    ? transactions.items
    : [];
  const typeOptions = [
    { value: '', label: 'All Transaction Types' },
    { value: 'MANUAL_ADJUSTMENT', label: 'Manual Adjustment' },
    { value: 'MONTHLY_ACCRUAL', label: 'Monthly Accrual' },
    { value: 'LEAVE_APPROVED', label: 'Leave Approved (Debit)' },
    { value: 'LEAVE_CANCELLED', label: 'Leave Cancelled (Credit)' },
    { value: 'CARRY_FORWARD', label: 'Year-End Carry Forward' },
    { value: 'INITIAL_GRANT', label: 'Initial Grant' },
  ];

  const getTransactionBadge = (type) => {
    switch (type) {
      case 'MANUAL_ADJUSTMENT':
        return <Badge variant="warning">Manual Adjustment</Badge>;
      case 'MONTHLY_ACCRUAL':
        return <Badge variant="primary">Monthly Accrual</Badge>;
      case 'LEAVE_APPROVED':
        return <Badge variant="danger">Leave Approved</Badge>;
      case 'LEAVE_CANCELLED':
        return <Badge variant="success">Leave Cancelled</Badge>;
      case 'CARRY_FORWARD':
        return <Badge variant="secondary">Carry Forward</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary-500" />
            <span>Balance Adjustment Audit Trail</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Immutable transaction ledger recording every balance modification and mandatory reason
          </p>
        </div>

        <div className="w-56">
          <CustomSelector
            options={typeOptions}
            value={transactionTypeFilter}
            onChange={(val) => onTransactionTypeChange(val || '')}
            isClearable={false}
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : safeTransactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-3">Date & Time</th>
                    <th className="pb-3 px-3">Employee</th>
                    <th className="pb-3 px-3">Leave Type</th>
                    <th className="pb-3 px-3">Type</th>
                    <th className="pb-3 px-3 text-center">Change</th>
                    <th className="pb-3 px-3 text-center">Balance Delta</th>
                    <th className="pb-3 px-3">Reason / Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {safeTransactions.map((tx) => {
                    const days = Number(tx.adjustmentDays || 0);
                    const isPositive = days >= 0;

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-[var(--bg-card-hover)] transition-colors"
                      >
                        <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>

                        <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                          {tx.staffName || tx.staffId}
                        </td>

                        <td className="py-3 px-3 text-[var(--text-secondary)]">
                          {tx.leaveTypeName || tx.leaveTypeId}
                        </td>

                        <td className="py-3 px-3">{getTransactionBadge(tx.transactionType)}</td>

                        <td className="py-3 px-3 text-center font-bold">
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              isPositive ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            {isPositive ? `+${days}` : `${days}`}d
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center text-[var(--text-muted)]">
                          {tx.previousBalance != null ? `${tx.previousBalance}d` : '—'} &rarr;{' '}
                          <strong className="text-[var(--text-primary)]">
                            {tx.newBalance != null ? `${tx.newBalance}d` : '—'}
                          </strong>
                        </td>

                        <td className="py-3 px-3 text-[var(--text-muted)] max-w-sm">
                          <span className="italic">{tx.reason || 'Automated system adjustment'}</span>
                          {tx.notes && (
                            <span className="block text-[10px] text-[var(--text-secondary)] mt-0.5">
                              Notes: {tx.notes}
                            </span>
                          )}
                        </td>
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
            title="No Balance Transactions Logged"
            description="The audit ledger will track all automated accruals and manual balance adjustments here."
          />
        )}
      </div>
    </div>
  );
}
