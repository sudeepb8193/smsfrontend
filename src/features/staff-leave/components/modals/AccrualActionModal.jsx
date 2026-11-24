import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import { Input } from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { Calendar, RefreshCw, ArrowRight, ShieldAlert, AlertCircle } from 'lucide-react';

/**
 * AccrualActionModal: Trigger background automated operations:
 * 1. Monthly Accrual Run for active staff.
 * 2. Year-End Carry-Forward processing with policy ceiling enforcement.
 */
export default function AccrualActionModal({
  isOpen,
  onClose,
  onProcessAccrual,
  onProcessCarryForward,
  isSubmitting = false,
  branches = [],
}) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [operationType, setOperationType] = useState('monthly'); // 'monthly' | 'carry_forward'
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [fromYear, setFromYear] = useState(currentYear - 1);
  const [toYear, setToYear] = useState(currentYear);
  const [branchId, setBranchId] = useState('');

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (formError) setFormError('');
  };

  useEffect(() => {
    setErrors({});
    setFormError('');
  }, [isOpen, operationType]);

  const branchOptions = [
    { value: '', label: 'All Salon Branches' },
    ...branches.map((b) => ({ value: b.id, label: b.name })),
  ];

  const monthOptions = [
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const newErrors = {};

    if (operationType === 'monthly') {
      const y = Number(year);
      if (!year || isNaN(y) || y < 2020 || y > 2100) {
        newErrors.year = 'Please enter a valid 4-digit year between 2020 and 2100';
      }
    } else {
      const fy = Number(fromYear);
      const ty = Number(toYear);
      if (!fromYear || isNaN(fy) || fy < 2020 || fy > 2100) {
        newErrors.fromYear = 'Please enter a valid 4-digit year between 2020 and 2100';
      }
      if (!toYear || isNaN(ty) || ty < 2020 || ty > 2100) {
        newErrors.toYear = 'Please enter a valid 4-digit year between 2020 and 2100';
      } else if (ty <= fy) {
        newErrors.toYear = 'Target year must be greater than closing year';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (operationType === 'monthly') {
        await onProcessAccrual({
          year: Number(year),
          month: Number(month),
          branchId: branchId || undefined,
        });
      } else {
        await onProcessCarryForward({
          fromYear: Number(fromYear),
          toYear: Number(toYear),
          branchId: branchId || undefined,
        });
      }
      onClose();
    } catch (err) {
      setFormError(err?.message || 'Failed to process automated operation');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automated Balance Processing"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Operation Selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOperationType('monthly')}
            className={`p-3 rounded-xl border text-left transition-all ${
              operationType === 'monthly'
                ? 'bg-primary-500/10 border-primary-500 text-primary-600 font-semibold'
                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <span className="block text-xs font-bold">Monthly Accrual</span>
            <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
              Credits monthly pro-rata leave days
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOperationType('carry_forward')}
            className={`p-3 rounded-xl border text-left transition-all ${
              operationType === 'carry_forward'
                ? 'bg-primary-500/10 border-primary-500 text-primary-600 font-semibold'
                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <span className="block text-xs font-bold">Year-End Carry Forward</span>
            <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
              Rolls over unused balance within caps
            </span>
          </button>
        </div>

        {/* Operation Parameters */}
        {operationType === 'monthly' ? (
          <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl space-y-4">
            <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Accrual Target Month
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Year"
                type="text"
                inputMode="numeric"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value.replace(/\D/g, '').slice(0, 4));
                  clearError('year');
                }}
                error={errors.year}
                placeholder="YYYY"
                maxLength={4}
                required
              />

              <CustomSelector
                label="Month"
                options={monthOptions}
                value={month}
                onChange={(val) => setMonth(Number(val) || currentMonth)}
                required
                isClearable={false}
              />
            </div>

            <p className="text-[11px] text-[var(--text-muted)]">
              This process is idempotent. If already processed for this month, existing records will not be duplicated.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl space-y-4">
            <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Year-End Rollover Window
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="From Year (Closing)"
                type="text"
                inputMode="numeric"
                value={fromYear}
                onChange={(e) => {
                  setFromYear(e.target.value.replace(/\D/g, '').slice(0, 4));
                  clearError('fromYear');
                }}
                error={errors.fromYear}
                placeholder="YYYY"
                maxLength={4}
                required
              />

              <Input
                label="To Year (Target)"
                type="text"
                inputMode="numeric"
                value={toYear}
                onChange={(e) => {
                  setToYear(e.target.value.replace(/\D/g, '').slice(0, 4));
                  clearError('toYear');
                }}
                error={errors.toYear}
                placeholder="YYYY"
                maxLength={4}
                required
              />
            </div>

            <p className="text-[11px] text-[var(--text-muted)]">
              Unused balances from the closing year will roll into the target year up to each leave type's maximum carry-forward ceiling.
            </p>
          </div>
        )}

        {/* Branch Filter */}
        <div>
          <CustomSelector
            label="Branch Scope"
            options={branchOptions}
            value={branchId}
            onChange={(val) => setBranchId(val || '')}
            isClearable={false}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            Execute Processing
          </Button>
        </div>
      </form>
    </Modal>
  );
}
