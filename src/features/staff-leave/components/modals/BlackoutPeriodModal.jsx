import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import { Input } from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { Textarea } from '../../../../components/shared/Textarea';
import { DatePicker } from '../../../../components/shared/DatePicker';
import { Toggle } from '../../../../components/shared/Toggle';
import { CalendarOff, AlertTriangle, ShieldAlert, AlertCircle } from 'lucide-react';

/**
 * BlackoutPeriodModal: Configure salon blackout windows (peak season, holiday surges, inventory audit)
 * with strict leave request blocks or percentage capacity caps.
 */
export default function BlackoutPeriodModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  blackoutPeriod = null,
  branches = [],
  leaveTypes = [],
}) {
  const isEditing = Boolean(blackoutPeriod?.id);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [restrictionType, setRestrictionType] = useState('block_all');
  const [maxAllowedPercentage, setMaxAllowedPercentage] = useState('20');
  const [applicableBranchIds, setApplicableBranchIds] = useState([]);
  const [exemptLeaveTypeIds, setExemptLeaveTypeIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (formError) setFormError('');
  };

  const safeBranches = Array.isArray(branches)
    ? branches
    : Array.isArray(branches?.data)
    ? branches.data
    : Array.isArray(branches?.items)
    ? branches.items
    : [];

  const safeLeaveTypes = Array.isArray(leaveTypes)
    ? leaveTypes
    : Array.isArray(leaveTypes?.items)
    ? leaveTypes.items
    : Array.isArray(leaveTypes?.data)
    ? leaveTypes.data
    : [];

  useEffect(() => {
    setErrors({});
    setFormError('');
    if (blackoutPeriod) {
      setName(blackoutPeriod.name || '');
      setStartDate(blackoutPeriod.startDate ? blackoutPeriod.startDate.slice(0, 10) : '');
      setEndDate(blackoutPeriod.endDate ? blackoutPeriod.endDate.slice(0, 10) : '');
      setRestrictionType((blackoutPeriod.restrictionType || 'block_all').toLowerCase());
      setMaxAllowedPercentage(
        String(
          blackoutPeriod.maxPercentageStaffOnLeave ??
            blackoutPeriod.maxAllowedLeavePercentage ??
            '20',
        ),
      );
      setApplicableBranchIds(blackoutPeriod.applicableBranchIds || []);
      setExemptLeaveTypeIds(blackoutPeriod.exemptLeaveTypeIds || []);
      setNotes(blackoutPeriod.reason || blackoutPeriod.notes || '');
      setIsActive(blackoutPeriod.isActive ?? true);
    } else {
      setName('');
      setStartDate('');
      setEndDate('');
      setRestrictionType('block_all');
      setMaxAllowedPercentage('20');
      setApplicableBranchIds([]);
      setExemptLeaveTypeIds([]);
      setNotes('');
      setIsActive(true);
    }
  }, [blackoutPeriod, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Blackout period name is required';
    }
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    } else if (new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }
    if (restrictionType.toLowerCase() === 'limit_percentage') {
      const pct = parseFloat(maxAllowedPercentage);
      if (maxAllowedPercentage === '' || isNaN(pct) || pct < 1 || pct > 100) {
        newErrors.maxAllowedPercentage = 'Maximum permitted leave percentage must be between 1 and 100%';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: name.trim(),
      startDate,
      endDate,
      restrictionType: restrictionType.toLowerCase(),
      maxAllowedLeavePercentage:
        restrictionType.toLowerCase() === 'limit_percentage' ? parseFloat(maxAllowedPercentage) || 0 : undefined,
      maxPercentageStaffOnLeave:
        restrictionType.toLowerCase() === 'limit_percentage' ? parseFloat(maxAllowedPercentage) || 0 : undefined,
      branchId: applicableBranchIds.length === 1 ? applicableBranchIds[0] : undefined,
      applicableBranchIds: applicableBranchIds.length > 0 ? applicableBranchIds : undefined,
      exemptLeaveTypeIds: exemptLeaveTypeIds.length > 0 ? exemptLeaveTypeIds : undefined,
      reason: notes.trim() || undefined,
      notes: notes.trim() || undefined,
      isActive,
    };

    try {
      if (isEditing) {
        await onSubmit({ id: blackoutPeriod.id, payload });
      } else {
        await onSubmit(payload);
      }
      onClose();
    } catch (err) {
      setFormError(err?.message || 'Failed to save blackout period');
    }
  };

  const restrictionOptions = [
    { value: 'block_all', label: 'Block All Leaves (Zero staff leave permitted)' },
    { value: 'limit_percentage', label: 'Limit Percentage (Max % of staff allowed on leave concurrently)' },
  ];

  const handleBranchToggle = (branchId) => {
    setApplicableBranchIds((prev) =>
      prev.includes(branchId) ? prev.filter((id) => id !== branchId) : [...prev, branchId],
    );
  };

  const handleExemptToggle = (typeId) => {
    setExemptLeaveTypeIds((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId],
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Blackout: ${blackoutPeriod?.name}` : 'Create Blackout Period'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <div>
          <Input
            label="Blackout Event / Period Name"
            placeholder="e.g. Diwali Peak Week, Christmas Rush, Annual Inventory Audit..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError('name');
            }}
            error={errors.name}
            maxLength={120}
            showCharCount={true}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(val) => {
              setStartDate(val);
              clearError('startDate');
            }}
            error={errors.startDate}
            required
          />

          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(val) => {
              setEndDate(val);
              clearError('endDate');
            }}
            minDate={startDate}
            error={errors.endDate}
            required
          />
        </div>

        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl space-y-4">
          <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
            Restriction Severity
          </h4>

          <CustomSelector
            label="Restriction Type"
            options={restrictionOptions}
            value={restrictionType}
            onChange={(val) => {
              setRestrictionType(val || 'block_all');
              clearError('restrictionType');
            }}
            isClearable={false}
          />

          {restrictionType.toLowerCase() === 'limit_percentage' && (
            <div>
              <Input
                label="Maximum Concurrently Permitted Leave (%)"
                type="text"
                inputMode="numeric"
                value={maxAllowedPercentage}
                onChange={(e) => {
                  setMaxAllowedPercentage(e.target.value.replace(/\D/g, '').slice(0, 3));
                  clearError('maxAllowedPercentage');
                }}
                error={errors.maxAllowedPercentage}
                placeholder="1 - 100"
                maxLength={3}
                helperText="Percentage of total branch staff permitted on leave at the same time (1 - 100%)"
                required
              />
            </div>
          )}
        </div>

        {/* Branch Scope Selection */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Applicable Branches ({applicableBranchIds.length === 0 ? 'All Branches' : `${applicableBranchIds.length} Selected`})
            </span>
            {applicableBranchIds.length > 0 && (
              <button
                type="button"
                onClick={() => setApplicableBranchIds([])}
                className="text-[11px] text-primary-500 hover:underline"
              >
                Clear (Apply to All)
              </button>
            )}
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">
            Leave unchecked to enforce blackout across all salon branches.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {safeBranches.map((b) => {
              const isSelected = applicableBranchIds.includes(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleBranchToggle(b.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-primary-500/10 border-primary-500 text-primary-600 font-semibold'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exempt Leave Types */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl space-y-2">
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            Exempt Leave Types (Emergency Bypass)
          </span>
          <p className="text-[10px] text-[var(--text-muted)]">
            Selected leave types will bypass this blackout (e.g. Emergency Sick Leave, Maternity Leave).
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {safeLeaveTypes.map((lt) => {
              const isExempt = exemptLeaveTypeIds.includes(lt.id);
              return (
                <button
                  key={lt.id}
                  type="button"
                  onClick={() => handleExemptToggle(lt.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    isExempt
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 font-semibold'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  {lt.name} ({lt.code})
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Textarea
            label="Internal Notes (Optional)"
            placeholder="Operational guidelines, manager instructions during blackout..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={255}
            showCharCount={true}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
          <div>
            <span className="text-xs font-semibold text-[var(--text-primary)] block">Active Blackout</span>
            <span className="text-[10px] text-[var(--text-muted)]">
              When inactive, leave requests will not be restricted by this rule
            </span>
          </div>
          <Toggle checked={isActive} onChange={setIsActive} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            {isEditing ? 'Save Blackout Window' : 'Create Blackout Period'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
