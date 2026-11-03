import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import DatePicker from '../../../../components/shared/DatePicker';
import Textarea from '../../../../components/shared/Textarea';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { Clock, ShieldAlert, Calendar, Users, Repeat, Building2 } from 'lucide-react';

const REASON_CATEGORIES = [
  { value: 'training', label: 'Training (Workshops, product demos, education)' },
  { value: 'meeting', label: 'Meeting (Branch sync, 1-on-1, staff briefing)' },
  { value: 'personal', label: 'Personal (Doctor, family, personal break)' },
  { value: 'other', label: 'Other (Salon maintenance, photo shoot, etc.)' },
];

export default function BlockedTimeModal({
  isOpen,
  onClose,
  onSubmit,
  staffList = [],
  branches = [],
  currentBranchId = '',
  loading = false,
}) {
  const [isBulk, setIsBulk] = useState(false);
  const [staffId, setStaffId] = useState(staffList[0]?.id || '');
  const [selectedStaffIds, setSelectedStaffIds] = useState(
    staffList.length > 0 ? [staffList[0].id] : [],
  );
  const [branchId, setBranchId] = useState(currentBranchId || branches[0]?.id || '');
  const [blockDate, setBlockDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('15:00');
  const [reasonCategory, setReasonCategory] = useState('training');
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [formError, setFormError] = useState(null);

  const staffOptions = staffList.map((s) => ({
    value: s.id,
    label: `${s.fullName} (${s.employeeCode || 'EMP'})`,
  }));

  const toggleStaffSelection = (id) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    setSelectedStaffIds(staffList.map((s) => s.id));
  };

  const handleClearAll = () => {
    setSelectedStaffIds([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!branchId) {
      setFormError('Branch is required');
      return;
    }
    if (!blockDate) {
      setFormError('Date is required');
      return;
    }
    if (!startTime || !endTime) {
      setFormError('Start and end time are required');
      return;
    }
    if (endTime <= startTime) {
      setFormError('End time must be later than start time');
      return;
    }
    if (isRecurring && recurrenceEndDate && recurrenceEndDate < blockDate) {
      setFormError('Recurrence end date cannot precede the block start date');
      return;
    }

    if (isBulk) {
      if (selectedStaffIds.length === 0) {
        setFormError('Please select at least one staff member');
        return;
      }
      onSubmit({
        staffIds: selectedStaffIds,
        branchId,
        blockDate,
        startTime,
        endTime,
        reasonCategory,
        note: note ? note.trim() : null,
        isRecurring,
        recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
      });
    } else {
      if (!staffId) {
        setFormError('Staff member is required');
        return;
      }
      onSubmit({
        staffId,
        branchId,
        blockDate,
        startTime,
        endTime,
        reasonCategory,
        note: note ? note.trim() : null,
        isRecurring,
        recurrenceEndDate: isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Block Out Staff Time (Busy / Non-Bookable)"
      size="medium"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="blocked-time-form"
            variant="primary"
            loading={loading}
          >
            Create Blocked Time
          </Button>
        </div>
      }
    >
      <form id="blocked-time-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-500 font-medium">
            {formError}
          </div>
        )}

        {/* Single vs Bulk Mode Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
          <span className="text-xs font-semibold text-[var(--text-primary)]">Staff Assignment Scope</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsBulk(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isBulk
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Single Staff
            </button>
            <button
              type="button"
              onClick={() => setIsBulk(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isBulk
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Bulk Team Block
            </button>
          </div>
        </div>

        {/* Staff Picker */}
        {!isBulk ? (
          <div>
            <CustomSelector
              label="Employee *"
              options={staffOptions}
              value={staffId}
              onChange={setStaffId}
              placeholder="Select Stylist..."
              isSearchable={false}
              isClearable={false}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Select Team Members ({selectedStaffIds.length} selected) *
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-primary-600 dark:text-primary-400 font-bold hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-[var(--text-muted)]">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              {staffList.map((s) => {
                const isSelected = selectedStaffIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleStaffSelection(s.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-primary-500/15 text-primary-700 dark:text-primary-300 border border-primary-500/30 font-bold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{s.fullName}</span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">{s.employeeCode}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Branch Display & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1.5">
              Branch
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)]">
              <Building2 size={13} className="text-primary-500 shrink-0" />
              <span className="truncate">
                {branches.find((b) => b.id === branchId)?.name || 'Active Branch'}
              </span>
            </div>
          </div>
          <div>
            <DatePicker
              label="Date *"
              value={blockDate}
              onChange={(val) => setBlockDate(val)}
              required
            />
          </div>
        </div>

        {/* Time Interval */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Start Time *"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              label="End Time *"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Reason Category */}
        <div>
          <CustomSelector
            label="Category *"
            options={REASON_CATEGORIES}
            value={reasonCategory}
            onChange={setReasonCategory}
            isSearchable={false}
            isClearable={false}
          />
        </div>

        {/* Internal Note using shared Textarea */}
        <div>
          <Textarea
            label="Internal Note / Detail"
            value={note}
            maxLength={255}
            showCharCount
            onChange={(e) => setNote(e.target.value.slice(0, 255))}
            placeholder="e.g. L'Oréal Colour Masterclass session, all-hands sync..."
            rows={2}
          />
        </div>

        {/* Recurrence Toggle */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500"
            />
            <Repeat size={14} className="text-primary-500" />
            <span>Recur weekly on this day</span>
          </label>

          {isRecurring && (
            <div>
              <DatePicker
                label="Recurrence End Date (Optional)"
                value={recurrenceEndDate}
                onChange={(val) => setRecurrenceEndDate(val)}
                minDate={blockDate}
                placeholder="Indefinite / Select date"
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
