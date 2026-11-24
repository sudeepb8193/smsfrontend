import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import { Input } from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { Textarea } from '../../../../components/shared/Textarea';
import { AlertTriangle, Plus, Minus, Scale, AlertCircle } from 'lucide-react';

/**
 * AdjustBalanceModal: Allows authorized managers to perform manual leave balance adjustments
 * with strict mandatory reasoning recorded in the immutable audit transaction ledger.
 */
export default function AdjustBalanceModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  staffList = [],
  leaveTypes = [],
  defaultStaffId = '',
  defaultLeaveTypeId = '',
}) {
  const currentYear = new Date().getFullYear();
  const [staffId, setStaffId] = useState(defaultStaffId || '');
  const [leaveTypeId, setLeaveTypeId] = useState(defaultLeaveTypeId || '');
  const [year, setYear] = useState(currentYear);
  const [adjustmentDays, setAdjustmentDays] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

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
    if (defaultStaffId) setStaffId(defaultStaffId);
    if (defaultLeaveTypeId) setLeaveTypeId(defaultLeaveTypeId);
  }, [isOpen, defaultStaffId, defaultLeaveTypeId]);

  // Strict signed decimal sanitizer: accepts optional leading '+' or '-' and digits with at most one dot
  const handleSignedDecimalChange = (e) => {
    clearError('adjustmentDays');
    const raw = e.target.value;
    const isNegative = raw.startsWith('-');
    const isPositive = raw.startsWith('+');
    let clean = raw.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    const sign = isNegative ? '-' : isPositive ? '+' : '';
    setAdjustmentDays((sign + clean).slice(0, 6));
  };

  const safeStaffList = Array.isArray(staffList)
    ? staffList
    : Array.isArray(staffList?.data)
    ? staffList.data
    : Array.isArray(staffList?.items)
    ? staffList.items
    : [];

  const safeLeaveTypes = Array.isArray(leaveTypes)
    ? leaveTypes
    : Array.isArray(leaveTypes?.items)
    ? leaveTypes.items
    : Array.isArray(leaveTypes?.data)
    ? leaveTypes.data
    : [];

  const staffOptions = safeStaffList.map((s) => ({
    value: s.id,
    label: `${s.firstName || ''} ${s.lastName || ''} (${s.employeeCode || s.id?.slice(0, 8) || 'EMP'})`,
  }));

  const leaveTypeOptions = safeLeaveTypes
    .filter((lt) => (lt.status ? lt.status === 'active' : (lt.isActive ?? true)))
    .map((lt) => ({
      value: lt.id,
      label: `${lt.name} (${lt.code})`,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const newErrors = {};
    if (!staffId) {
      newErrors.staffId = 'Please select an employee';
    }
    if (!leaveTypeId) {
      newErrors.leaveTypeId = 'Please select a leave category';
    }
    const yearNum = parseInt(year, 10);
    if (!year || isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      newErrors.year = 'Please enter a valid 4-digit calendar year (2020 - 2100)';
    }
    const daysNum = parseFloat(adjustmentDays);
    if (adjustmentDays === '' || isNaN(daysNum) || daysNum === 0 || daysNum < -365 || daysNum > 365) {
      newErrors.adjustmentDays = 'Please enter a valid non-zero adjustment amount (-365 to +365 days)';
    }
    if (!reason.trim() || reason.trim().length < 5) {
      newErrors.reason = 'A clear justification reason (minimum 5 characters) is mandatory';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        staffId,
        leaveTypeId,
        balanceYear: Number(year),
        year: Number(year),
        adjustmentDays: daysNum,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setFormError(err?.message || 'Failed to adjust balance');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Leave Balance Adjustment"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400">
          <Scale className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Manual adjustments directly modify the employee's available leave balance. Every adjustment
            is immutably recorded in the <strong>sms_staffLeaveBalanceTransactions</strong> ledger with your user ID and mandatory justification.
          </p>
        </div>

        <div>
          <CustomSelector
            label="Employee"
            options={staffOptions}
            value={staffId}
            onChange={(val) => {
              setStaffId(val || '');
              clearError('staffId');
            }}
            error={errors.staffId}
            placeholder="Select employee..."
            required
            isClearable={false}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomSelector
            label="Leave Type"
            options={leaveTypeOptions}
            value={leaveTypeId}
            onChange={(val) => {
              setLeaveTypeId(val || '');
              clearError('leaveTypeId');
            }}
            error={errors.leaveTypeId}
            placeholder="Select leave type..."
            required
            isClearable={false}
          />

          <Input
            label="Calendar Year"
            type="text"
            inputMode="numeric"
            value={year}
            onChange={(e) => {
              setYear(e.target.value.replace(/\D/g, '').slice(0, 4));
              clearError('year');
            }}
            error={errors.year}
            placeholder="YYYY (e.g. 2026)"
            maxLength={4}
            required
          />
        </div>

        <div>
          <Input
            label="Adjustment in Days (+ / -)"
            type="text"
            inputMode="decimal"
            placeholder="e.g. +2.0 or -1.5"
            value={adjustmentDays}
            onChange={handleSignedDecimalChange}
            error={errors.adjustmentDays}
            helperText="Enter positive numbers to credit days (e.g. +2.0), negative numbers to debit days (e.g. -1.0)"
            maxLength={6}
            required
          />
        </div>

        <div>
          <Textarea
            label="Audit Justification Reason (Mandatory)"
            placeholder="e.g. Compensatory off for emergency weekend shift, or retroactive policy grant..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              clearError('reason');
            }}
            error={errors.reason}
            rows={2}
            maxLength={255}
            showCharCount={true}
            required
          />
        </div>

        <div>
          <Textarea
            label="Additional Notes (Optional)"
            placeholder="Reference ticket or manager approval details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={255}
            showCharCount={true}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            Commit Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
