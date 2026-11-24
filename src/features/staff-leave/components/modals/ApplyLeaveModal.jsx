import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import { Input } from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { Textarea } from '../../../../components/shared/Textarea';
import { DatePicker } from '../../../../components/shared/DatePicker';
import { MediaUpload } from '../../../../components/shared/MediaUpload';
import { Badge } from '../../../../components/shared/Badge';
import {
  Calendar,
  AlertTriangle,
  Info,
  FileText,
  Clock,
  Phone,
  User,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';

/**
 * ApplyLeaveModal: Handles both self-service staff leave applications and
 * manager-initiated leave applications on behalf of team members.
 */
export default function ApplyLeaveModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  leaveTypes = [],
  staffList = [],
  balances = [],
  isManager = false,
  currentStaffId = '',
}) {
  const [selectedStaffId, setSelectedStaffId] = useState(currentStaffId || '');
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState('morning');
  const [reason, setReason] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [coveringStaffId, setCoveringStaffId] = useState('');
  const [supportingDocUrl, setSupportingDocUrl] = useState('');
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
  }, [isOpen]);

  // Defensively ensure props are arrays
  const safeLeaveTypes = useMemo(() => {
    if (Array.isArray(leaveTypes)) return leaveTypes;
    if (Array.isArray(leaveTypes?.items)) return leaveTypes.items;
    if (Array.isArray(leaveTypes?.data)) return leaveTypes.data;
    return [];
  }, [leaveTypes]);

  const safeBalances = useMemo(() => {
    if (Array.isArray(balances)) return balances;
    if (Array.isArray(balances?.balances)) return balances.balances;
    if (Array.isArray(balances?.items)) return balances.items;
    if (Array.isArray(balances?.data)) return balances.data;
    return [];
  }, [balances]);

  const safeStaffList = useMemo(() => {
    if (Array.isArray(staffList)) return staffList;
    if (Array.isArray(staffList?.data)) return staffList.data;
    if (Array.isArray(staffList?.items)) return staffList.items;
    return [];
  }, [staffList]);

  // Sync current staff id
  useEffect(() => {
    if (currentStaffId && !selectedStaffId) {
      setSelectedStaffId(currentStaffId);
    }
  }, [currentStaffId, selectedStaffId]);

  // Selected leave type metadata
  const selectedLeaveType = useMemo(() => {
    return safeLeaveTypes.find((lt) => lt.id === selectedLeaveTypeId) || null;
  }, [safeLeaveTypes, selectedLeaveTypeId]);

  // Relevant balance for selected staff and leave type
  const relevantBalance = useMemo(() => {
    if (!selectedLeaveTypeId) return null;
    return (
      safeBalances.find(
        (b) =>
          b.leaveTypeId === selectedLeaveTypeId &&
          (!selectedStaffId || b.staffId === selectedStaffId),
      ) || null
    );
  }, [safeBalances, selectedLeaveTypeId, selectedStaffId]);

  const availableDays = relevantBalance ? Number(relevantBalance.availableDays || 0) : 0;

  // Approximate duration calculation
  const calculatedDuration = useMemo(() => {
    if (!startDate) return 0;
    if (isHalfDay) return 0.5;
    if (!endDate) return 1;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;

    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate, isHalfDay]);

  // Notice days check
  const noticeWarning = useMemo(() => {
    if (!startDate || !selectedLeaveType?.minNoticeDays) return null;
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < selectedLeaveType.minNoticeDays) {
      return `Policy requires at least ${selectedLeaveType.minNoticeDays} day(s) advance notice. You are applying with ${Math.max(0, diffDays)} day(s) notice.`;
    }
    return null;
  }, [startDate, selectedLeaveType]);

  // Documentation requirement check
  const isDocumentMandatory = useMemo(() => {
    if (!selectedLeaveType) return false;
    const isDocReq =
      selectedLeaveType.documentRequiredAfterDays !== null &&
      selectedLeaveType.documentRequiredAfterDays !== undefined
        ? true
        : Boolean(selectedLeaveType.isDocumentRequired);
    if (!isDocReq) return false;
    const threshold = Number(
      selectedLeaveType.documentRequiredAfterDays ??
        selectedLeaveType.documentRequiredThreshold ??
        1,
    );
    return calculatedDuration >= threshold;
  }, [selectedLeaveType, calculatedDuration]);

  // Shortfall check
  const isShortfall = useMemo(() => {
    if (!relevantBalance || !calculatedDuration) return false;
    return calculatedDuration > availableDays;
  }, [relevantBalance, calculatedDuration, availableDays]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const newErrors = {};
    if (isManager && !selectedStaffId) {
      newErrors.staffId = 'Please select an employee';
    }
    if (!selectedLeaveTypeId) {
      newErrors.leaveTypeId = 'Please select a leave category';
    }
    if (!startDate) {
      newErrors.startDate = 'Please select a start date';
    }
    if (!isHalfDay && !endDate) {
      newErrors.endDate = 'Please select an end date';
    } else if (endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }
    if (!reason.trim() || reason.trim().length < 3) {
      newErrors.reason = 'Reason for leave must be at least 3 characters';
    }
    const docThreshold =
      selectedLeaveType?.documentRequiredAfterDays ??
      selectedLeaveType?.documentRequiredThreshold ??
      1;
    if (isDocumentMandatory && !supportingDocUrl) {
      newErrors.supportingDocUrl = `Supporting document is mandatory for requests of ${docThreshold} or more days.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      staffId: isManager ? selectedStaffId : undefined,
      leaveTypeId: selectedLeaveTypeId,
      startDate,
      endDate: isHalfDay ? startDate : endDate,
      isHalfDay,
      halfDayPeriod: isHalfDay
        ? halfDayPeriod.toLowerCase().includes('afternoon') || halfDayPeriod.toLowerCase().includes('second')
          ? 'afternoon'
          : 'morning'
        : undefined,
      reason: reason.trim(),
      emergencyContactPhone: emergencyPhone.trim() || undefined,
      coveringStaffId: coveringStaffId || undefined,
      supportingDocumentUrl: supportingDocUrl || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setFormError(err?.message || 'Failed to submit leave request');
    }
  };

  const staffOptions = safeStaffList.map((s) => ({
    value: s.id,
    label: `${s.firstName || ''} ${s.lastName || ''} (${s.employeeCode || s.id?.slice(0, 8) || 'EMP'})`,
  }));

  const leaveTypeOptions = safeLeaveTypes
    .filter((lt) => (lt.status ? lt.status === 'active' : (lt.isActive ?? true)))
    .map((lt) => ({
      value: lt.id,
      label: `${lt.name} (${lt.code}) - ${lt.isPaid ? 'Paid' : 'Unpaid'}`,
    }));

  const colleagueOptions = safeStaffList
    .filter((s) => s.id !== selectedStaffId)
    .map((s) => ({
      value: s.id,
      label: `${s.firstName || ''} ${s.lastName || ''}`,
    }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isManager ? 'Apply Leave for Employee' : 'Apply for Leave'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Manager Mode Staff Selector */}
        {isManager && (
          <div>
            <CustomSelector
              label="Select Employee"
              options={staffOptions}
              value={selectedStaffId}
              onChange={(val) => {
                setSelectedStaffId(val || '');
                clearError('staffId');
              }}
              error={errors.staffId}
              placeholder="Choose employee..."
              required
              isClearable={false}
            />
          </div>
        )}

        {/* Leave Type and Current Balance Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CustomSelector
              label="Leave Type"
              options={leaveTypeOptions}
              value={selectedLeaveTypeId}
              onChange={(val) => {
                setSelectedLeaveTypeId(val || '');
                clearError('leaveTypeId');
              }}
              error={errors.leaveTypeId}
              placeholder="Choose leave category..."
              required
              isClearable={false}
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="p-3 bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                <span className="text-xs text-[var(--text-muted)] font-medium">Available Balance:</span>
              </div>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {relevantBalance !== null ? `${availableDays} days` : 'Select type'}
              </span>
            </div>
          </div>
        </div>

        {/* Date Selection & Half-Day Controls */}
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Schedule & Duration
              </h4>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isHalfDay}
                onChange={(e) => {
                  setIsHalfDay(e.target.checked);
                  if (e.target.checked && startDate) {
                    setEndDate(startDate);
                    clearError('endDate');
                  }
                }}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span>Half Day Leave</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(val) => {
                setStartDate(val);
                clearError('startDate');
                if (isHalfDay || !endDate) {
                  setEndDate(val);
                  clearError('endDate');
                }
              }}
              error={errors.startDate}
              required
            />

            {!isHalfDay ? (
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
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Half Day Session
                </label>
                <div className="grid grid-cols-2 gap-2 h-10">
                  <button
                    type="button"
                    onClick={() => setHalfDayPeriod('morning')}
                    className={`text-xs font-medium rounded-xl border transition-all ${
                      halfDayPeriod === 'morning'
                        ? 'bg-primary-500/10 border-primary-500 text-primary-600 font-semibold'
                        : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    First Half (Morning)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHalfDayPeriod('afternoon')}
                    className={`text-xs font-medium rounded-xl border transition-all ${
                      halfDayPeriod === 'afternoon'
                        ? 'bg-primary-500/10 border-primary-500 text-primary-600 font-semibold'
                        : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    Second Half (Afternoon)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Duration & Warnings banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-color)]">
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <span>Estimated duration:</span>
              <strong className="text-[var(--text-primary)] font-semibold">
                {calculatedDuration} {calculatedDuration === 1 ? 'day' : 'days'}
              </strong>
              <span className="text-[10px] text-[var(--text-muted)]">
                (Backend will exclude branch off-days and public holidays)
              </span>
            </div>

            {isShortfall && (
              <Badge variant="warning" className="flex items-center gap-1 text-xs">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                Shortfall Alert: Exceeds Available ({availableDays}d)
              </Badge>
            )}
          </div>
        </div>

        {/* Notice Warning Alert */}
        {noticeWarning && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Advance Notice Reminder</p>
              <p className="text-[11px] opacity-90">{noticeWarning}</p>
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <Textarea
            label="Reason for Leave"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              clearError('reason');
            }}
            error={errors.reason}
            placeholder="Please detail the reason for requesting leave (min 3 characters)..."
            rows={3}
            maxLength={255}
            showCharCount={true}
            required
          />
        </div>

        {/* Supporting Document Upload (Mandatory or Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
              Supporting Medical / Official Document
              {isDocumentMandatory && <span className="text-rose-500">*</span>}
            </label>
            {isDocumentMandatory ? (
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">
                Mandatory for &gt;=
                {selectedLeaveType?.documentRequiredAfterDays ??
                  selectedLeaveType?.documentRequiredThreshold ??
                  1}{' '}
                Days
              </span>
            ) : (
              <span className="text-[10px] text-[var(--text-muted)]">Optional</span>
            )}
          </div>

          <MediaUpload
            value={supportingDocUrl}
            onChange={(url) => {
              setSupportingDocUrl(url);
              clearError('supportingDocUrl');
            }}
            helperText="Upload doctor's certificate, ticket, or official document (PDF, PNG, JPG up to 5MB)"
            required={isDocumentMandatory}
          />
          {errors.supportingDocUrl && (
            <span className="text-xs text-rose-500 font-medium block mt-1">
              {errors.supportingDocUrl}
            </span>
          )}
        </div>

        {/* Optional Operational Context: Covering Staff & Emergency Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomSelector
            label="Covering Colleague (Optional)"
            options={colleagueOptions}
            value={coveringStaffId}
            onChange={(val) => setCoveringStaffId(val || '')}
            placeholder="Select colleague covering duties..."
            isClearable={true}
          />

          <Input
            label="Emergency Contact Phone"
            type="tel"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            maxLength={20}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            Submit Leave Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
