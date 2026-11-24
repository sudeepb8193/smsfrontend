import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import { Input } from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { Textarea } from '../../../../components/shared/Textarea';
import { Toggle } from '../../../../components/shared/Toggle';
import { Settings, ShieldAlert, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * LeaveTypeModal: Create or update organization-level Leave Type policies.
 */
export default function LeaveTypeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  leaveType = null, // null for create, object for edit
}) {
  const isEditing = Boolean(leaveType?.id);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  const [accrualMethod, setAccrualMethod] = useState('annual_grant');
  const [annualEntitlement, setAnnualEntitlement] = useState('12');
  const [monthlyAccrualRate, setMonthlyAccrualRate] = useState('1');
  const [maxCarryForwardDays, setMaxCarryForwardDays] = useState('5');
  const [minNoticeDays, setMinNoticeDays] = useState('1');
  const [isDocumentRequired, setIsDocumentRequired] = useState(false);
  const [documentRequiredThreshold, setDocumentRequiredThreshold] = useState('3');
  const [genderApplicability, setGenderApplicability] = useState('all');
  const [colorCode, setColorCode] = useState('#3b82f6');
  const [isActive, setIsActive] = useState(true);

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
    if (leaveType) {
      setName(leaveType.name || '');
      setCode(leaveType.code || '');
      setDescription(leaveType.description || '');
      setIsPaid(Boolean(leaveType.isPaid));
      setAccrualMethod((leaveType.accrualMethod || 'annual_grant').toLowerCase());
      setAnnualEntitlement(String(leaveType.annualEntitlementDays ?? leaveType.annualEntitlement ?? '12'));
      setMonthlyAccrualRate(String(leaveType.monthlyAccrualDays ?? leaveType.monthlyAccrualRate ?? '1'));
      setMaxCarryForwardDays(String(leaveType.maxCarryForwardDays ?? '5'));
      setMinNoticeDays(String(leaveType.minNoticeDays ?? '1'));
      const hasDocReq =
        leaveType.documentRequiredAfterDays !== null && leaveType.documentRequiredAfterDays !== undefined
          ? true
          : Boolean(leaveType.isDocumentRequired);
      setIsDocumentRequired(hasDocReq);
      setDocumentRequiredThreshold(
        String(leaveType.documentRequiredAfterDays ?? leaveType.documentRequiredThreshold ?? '3'),
      );
      setGenderApplicability(
        (leaveType.applicableGender || leaveType.genderApplicability || 'all').toLowerCase(),
      );
      setColorCode(leaveType.colorCode || '#3b82f6');
      setIsActive(leaveType.status ? leaveType.status === 'active' : (leaveType.isActive ?? true));
    } else {
      setName('');
      setCode('');
      setDescription('');
      setIsPaid(true);
      setAccrualMethod('annual_grant');
      setAnnualEntitlement('12');
      setMonthlyAccrualRate('1');
      setMaxCarryForwardDays('5');
      setMinNoticeDays('1');
      setIsDocumentRequired(false);
      setDocumentRequiredThreshold('3');
      setGenderApplicability('all');
      setColorCode('#3b82f6');
      setIsActive(true);
    }
  }, [leaveType, isOpen]);

  // Strict decimal input sanitizer: accepts digits and at most one decimal point
  const handleDecimalChange = (setter, field, maxChars = 5) => (e) => {
    clearError(field);
    let val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    setter(val.slice(0, maxChars));
  };

  // Strict integer sanitizer: accepts digits only
  const handleDigitChange = (setter, field, maxChars = 3) => (e) => {
    clearError(field);
    setter(e.target.value.replace(/\D/g, '').slice(0, maxChars));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Leave type name is required';
    }
    if (!code.trim()) {
      newErrors.code = 'Leave type code is required';
    }

    const annualVal = parseFloat(annualEntitlement);
    if (annualEntitlement === '' || isNaN(annualVal) || annualVal < 0 || annualVal > 365) {
      newErrors.annualEntitlement = 'Annual entitlement must be between 0 and 365 days';
    }
    if (accrualMethod.toLowerCase() === 'monthly_accrual') {
      const monthlyVal = parseFloat(monthlyAccrualRate);
      if (monthlyAccrualRate === '' || isNaN(monthlyVal) || monthlyVal < 0 || monthlyVal > 31) {
        newErrors.monthlyAccrualRate = 'Monthly accrual rate must be between 0 and 31 days';
      }
    }
    const carryVal = parseFloat(maxCarryForwardDays);
    if (maxCarryForwardDays === '' || isNaN(carryVal) || carryVal < 0 || carryVal > 365) {
      newErrors.maxCarryForwardDays = 'Max carry-forward must be between 0 and 365 days';
    }
    const noticeVal = parseInt(minNoticeDays, 10);
    if (minNoticeDays !== '' && (isNaN(noticeVal) || noticeVal < 0 || noticeVal > 365)) {
      newErrors.minNoticeDays = 'Minimum notice days must be between 0 and 365 days';
    }
    if (isDocumentRequired) {
      const docThresh = parseInt(documentRequiredThreshold, 10);
      if (documentRequiredThreshold === '' || isNaN(docThresh) || docThresh < 1 || docThresh > 365) {
        newErrors.documentRequiredThreshold = 'Document required threshold must be at least 1 day';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      isPaid,
      accrualMethod: accrualMethod.toLowerCase(),
      annualEntitlementDays: parseFloat(annualEntitlement) || 0,
      monthlyAccrualDays:
        accrualMethod.toLowerCase() === 'monthly_accrual' ? parseFloat(monthlyAccrualRate) || 0 : undefined,
      maxCarryForwardDays: parseFloat(maxCarryForwardDays) || 0,
      minNoticeDays: parseInt(minNoticeDays, 10) || 0,
      documentRequiredAfterDays: isDocumentRequired ? parseInt(documentRequiredThreshold, 10) || 1 : undefined,
      applicableGender: genderApplicability.toLowerCase(),
      colorCode: colorCode || undefined,
      status: isActive ? 'active' : 'inactive',
    };

    try {
      if (isEditing) {
        await onSubmit({ id: leaveType.id, payload });
      } else {
        await onSubmit(payload);
      }
      onClose();
    } catch (err) {
      setFormError(err?.message || 'Failed to save leave type policy');
    }
  };

  const accrualOptions = [
    { value: 'annual_grant', label: 'Annual Grant (Full grant at start of year)' },
    { value: 'monthly_accrual', label: 'Monthly Accrual (Accrues every month)' },
    { value: 'none', label: 'None (Unpaid / As-needed)' },
  ];

  const genderOptions = [
    { value: 'all', label: 'All Employees' },
    { value: 'female', label: 'Female Only (e.g. Maternity Leave)' },
    { value: 'male', label: 'Male Only (e.g. Paternity Leave)' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Leave Type: ${leaveType?.name}` : 'Create New Leave Type & Policy'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Name & Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Leave Type Name"
              placeholder="e.g. Annual Leave, Sick Leave..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError('name');
              }}
              error={errors.name}
              maxLength={80}
              showCharCount={true}
              required
            />
          </div>

          <div>
            <Input
              label="Short Code"
              placeholder="e.g. AL, SL, CL..."
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                clearError('code');
              }}
              error={errors.code}
              disabled={isEditing} // Code immutable after creation to preserve audit linkage
              maxLength={20}
              showCharCount={true}
              required
            />
          </div>
        </div>

        {/* Paid Status & Applicability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex items-center gap-3 p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
            <Toggle checked={isPaid} onChange={setIsPaid} />
            <div>
              <span className="text-xs font-semibold text-[var(--text-primary)] block">Paid Leave</span>
              <span className="text-[10px] text-[var(--text-muted)]">
                {isPaid ? 'Salaried compensation' : 'Unpaid absence'}
              </span>
            </div>
          </div>

          <div>
            <CustomSelector
              label="Gender Applicability"
              options={genderOptions}
              value={genderApplicability}
              onChange={(val) => {
                setGenderApplicability(val || 'all');
                clearError('genderApplicability');
              }}
              error={errors.genderApplicability}
              isClearable={false}
            />
          </div>
        </div>

        {/* Accrual Method & Entitlement */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl space-y-4">
          <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Accrual & Balance Rules
          </h4>

          <CustomSelector
            label="Accrual Method"
            options={accrualOptions}
            value={accrualMethod}
            onChange={(val) => {
              setAccrualMethod(val || 'annual_grant');
              clearError('accrualMethod');
            }}
            error={errors.accrualMethod}
            isClearable={false}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Annual Entitlement (Days)"
              type="text"
              inputMode="decimal"
              value={annualEntitlement}
              onChange={handleDecimalChange(setAnnualEntitlement, 'annualEntitlement', 5)}
              error={errors.annualEntitlement}
              placeholder="e.g. 12 or 12.5"
              maxLength={5}
              required
            />

            {accrualMethod.toLowerCase() === 'monthly_accrual' && (
              <Input
                label="Monthly Rate (Days/mo)"
                type="text"
                inputMode="decimal"
                value={monthlyAccrualRate}
                onChange={handleDecimalChange(setMonthlyAccrualRate, 'monthlyAccrualRate', 5)}
                error={errors.monthlyAccrualRate}
                placeholder="e.g. 1.0 or 1.25"
                maxLength={5}
                required
              />
            )}

            <Input
              label="Max Carry-Forward (Days)"
              type="text"
              inputMode="decimal"
              value={maxCarryForwardDays}
              onChange={handleDecimalChange(setMaxCarryForwardDays, 'maxCarryForwardDays', 5)}
              error={errors.maxCarryForwardDays}
              helperText="Year-end rollover ceiling"
              placeholder="e.g. 5"
              maxLength={5}
              required
            />
          </div>
        </div>

        {/* Documentation & Notice Rules */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl space-y-4">
          <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Notice & Documentation Constraints
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <Input
                label="Min Advance Notice (Days)"
                type="text"
                inputMode="numeric"
                value={minNoticeDays}
                onChange={handleDigitChange(setMinNoticeDays, 'minNoticeDays', 3)}
                error={errors.minNoticeDays}
                placeholder="0"
                maxLength={3}
                helperText="Days before start date"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl">
              <Toggle checked={isDocumentRequired} onChange={setIsDocumentRequired} />
              <div>
                <span className="text-xs font-semibold text-[var(--text-primary)] block">Document Required</span>
                <span className="text-[10px] text-[var(--text-muted)]">Medical cert, ticket, etc.</span>
              </div>
            </div>

            {isDocumentRequired && (
              <div>
                <Input
                  label="Threshold (Days &gt;=)"
                  type="text"
                  inputMode="numeric"
                  value={documentRequiredThreshold}
                  onChange={handleDigitChange(setDocumentRequiredThreshold, 'documentRequiredThreshold', 3)}
                  error={errors.documentRequiredThreshold}
                  placeholder="1"
                  maxLength={3}
                  helperText="Required when leave exceeds"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <Textarea
            label="Policy Description (Optional)"
            placeholder="Describe company leave rules, eligibility, or guidelines..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearError('description');
            }}
            error={errors.description}
            rows={2}
            maxLength={255}
            showCharCount={true}
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
          <div>
            <span className="text-xs font-semibold text-[var(--text-primary)] block">Active Status</span>
            <span className="text-[10px] text-[var(--text-muted)]">
              Inactive leave types cannot be selected for new leave applications
            </span>
          </div>
          <Toggle checked={isActive} onChange={setIsActive} />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            {isEditing ? 'Save Policy Changes' : 'Create Leave Type'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
