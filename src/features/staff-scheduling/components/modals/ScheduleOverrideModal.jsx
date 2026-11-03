import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import DatePicker from '../../../../components/shared/DatePicker';
import Textarea from '../../../../components/shared/Textarea';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const OVERRIDE_TYPES = [
  { value: 'extra_shift', label: 'Extra Shift (Work on standing day off)' },
  { value: 'shift_change', label: 'Shift Change (Different hours on this date)' },
  { value: 'early_leave', label: 'Early Leave (Staff leaves earlier than scheduled)' },
  { value: 'late_arrival', label: 'Late Arrival (Staff arrives later than scheduled)' },
  { value: 'day_off', label: 'One-off Day Off (Full day off on this date)' },
];

export default function ScheduleOverrideModal({
  isOpen,
  onClose,
  onSubmit,
  staffList = [],
  initialStaffId = '',
  initialDate = '',
  loading = false,
}) {
  const [staffId, setStaffId] = useState(initialStaffId || staffList[0]?.id || '');
  const [overrideDate, setOverrideDate] = useState(() => {
    return initialDate || new Date().toISOString().substring(0, 10);
  });
  const [overrideType, setOverrideType] = useState('extra_shift');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [reason, setReason] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('approved');
  const [formError, setFormError] = useState(null);

  const staffOptions = staffList.map((s) => ({
    value: s.id,
    label: `${s.fullName} (${s.employeeCode || 'EMP'})`,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!staffId) {
      setFormError('Employee selection is required');
      return;
    }
    if (!overrideDate) {
      setFormError('Override date is required');
      return;
    }
    if (!reason.trim()) {
      setFormError('A mandatory reason must be provided for audit tracking');
      return;
    }

    if (['extra_shift', 'shift_change'].includes(overrideType)) {
      if (!startTime || !endTime) {
        setFormError('Both start time and end time are required');
        return;
      }
      if (endTime <= startTime) {
        setFormError('End time must be later than start time');
        return;
      }
    } else if (overrideType === 'early_leave') {
      if (!endTime) {
        setFormError('Adjusted departure time is required for early leave');
        return;
      }
    } else if (overrideType === 'late_arrival') {
      if (!startTime) {
        setFormError('Adjusted arrival time is required for late arrival');
        return;
      }
    }

    onSubmit({
      staffId,
      overrideDate,
      overrideType,
      startTime: ['extra_shift', 'shift_change', 'late_arrival'].includes(overrideType)
        ? startTime
        : null,
      endTime: ['extra_shift', 'shift_change', 'early_leave'].includes(overrideType)
        ? endTime
        : null,
      reason: reason.trim(),
      approvalStatus,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Schedule Override / Ad-hoc Change"
      size="medium"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="schedule-override-form"
            variant="primary"
            loading={loading}
          >
            Confirm Override
          </Button>
        </div>
      }
    >
      <form id="schedule-override-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-500 font-medium">
            {formError}
          </div>
        )}

        {/* Staff Selector */}
        <div>
          <CustomSelector
            label="Employee *"
            options={staffOptions}
            value={staffId}
            onChange={setStaffId}
            placeholder="Select Employee..."
            isSearchable={false}
            isClearable={false}
          />
        </div>

        {/* Override Date & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <DatePicker
              label="Override Date *"
              value={overrideDate}
              onChange={(val) => setOverrideDate(val)}
              required
            />
          </div>
          <div>
            <CustomSelector
              label="Override Type *"
              options={OVERRIDE_TYPES}
              value={overrideType}
              onChange={setOverrideType}
              isSearchable={false}
              isClearable={false}
            />
          </div>
        </div>

        {/* Time Inputs (Conditional) */}
        {overrideType !== 'day_off' && (
          <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-3">
            <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Adjusted Operating Hours
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(overrideType === 'extra_shift' ||
                overrideType === 'shift_change' ||
                overrideType === 'late_arrival') && (
                <div>
                  <Input
                    label={overrideType === 'late_arrival' ? 'Arrival Time *' : 'Start Time *'}
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              )}

              {(overrideType === 'extra_shift' ||
                overrideType === 'shift_change' ||
                overrideType === 'early_leave') && (
                <div>
                  <Input
                    label={overrideType === 'early_leave' ? 'Departure Time *' : 'End Time *'}
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reason (Mandatory) using shared Textarea */}
        <div>
          <Textarea
            label="Reason for Override (Mandatory Audit Trail)"
            value={reason}
            maxLength={255}
            showCharCount
            onChange={(e) => setReason(e.target.value.slice(0, 255))}
            placeholder="e.g. Wedding party booking support, Personal family event early departure, etc."
            rows={2}
            required
          />
        </div>

        {/* Approval Status */}
        <div className="flex items-center gap-3 pt-1">
          <label className="text-xs font-semibold text-[var(--text-primary)]">
            Approval Status:
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setApprovalStatus('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                approvalStatus === 'approved'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)]'
              }`}
            >
              Approved (Immediate)
            </button>
            <button
              type="button"
              onClick={() => setApprovalStatus('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                approvalStatus === 'pending'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)]'
              }`}
            >
              Pending Sign-off
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
