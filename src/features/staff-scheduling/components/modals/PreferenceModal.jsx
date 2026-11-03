import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import Textarea from '../../../../components/shared/Textarea';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { ThumbsUp, ThumbsDown, Slash } from 'lucide-react';

const WEEKDAYS = [
  { value: 'all', label: 'All Days (General Preference)' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '0', label: 'Sunday' },
];

export default function PreferenceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  staffId = null,
  loading = false,
}) {
  const [dayOfWeekVal, setDayOfWeekVal] = useState('all');
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [preferenceType, setPreferenceType] = useState('preferred');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setDayOfWeekVal(
        initialData.dayOfWeek !== null && initialData.dayOfWeek !== undefined
          ? String(initialData.dayOfWeek)
          : 'all',
      );
      if (initialData.startTime && initialData.endTime) {
        setIsAllDay(false);
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime);
      } else {
        setIsAllDay(true);
        setStartTime('09:00');
        setEndTime('17:00');
      }
      setPreferenceType(initialData.preferenceType || 'preferred');
      setNote(initialData.note || '');
    } else {
      setDayOfWeekVal('all');
      setIsAllDay(true);
      setStartTime('09:00');
      setEndTime('17:00');
      setPreferenceType('preferred');
      setNote('');
    }
    setFormError(null);
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!isAllDay) {
      if (!startTime || !endTime) {
        setFormError('Both start and end time are required for time-specific preferences');
        return;
      }
      if (endTime <= startTime) {
        setFormError('End time must be later than start time');
        return;
      }
    }

    const payload = {
      staffId: staffId || undefined,
      dayOfWeek: dayOfWeekVal === 'all' ? null : parseInt(dayOfWeekVal, 10),
      startTime: isAllDay ? null : startTime,
      endTime: isAllDay ? null : endTime,
      preferenceType,
      note: note ? note.trim() : null,
    };

    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Availability Preference' : 'Submit Availability Preference'}
      size="medium"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="preference-form"
            variant="primary"
            loading={loading}
          >
            {initialData ? 'Save Preference' : 'Submit Preference'}
          </Button>
        </div>
      }
    >
      <form id="preference-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-500 font-medium">
            {formError}
          </div>
        )}

        {/* Preference Type Selection Cards */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">
            Preference Type *
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPreferenceType('preferred')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                preferenceType === 'preferred'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ThumbsUp size={18} className="mx-auto mb-1 text-emerald-500" />
              <div className="text-xs font-bold text-[var(--text-primary)]">Preferred</div>
              <div className="text-[10px] text-[var(--text-muted)]">Desire to work</div>
            </button>

            <button
              type="button"
              onClick={() => setPreferenceType('avoid')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                preferenceType === 'avoid'
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ThumbsDown size={18} className="mx-auto mb-1 text-amber-500" />
              <div className="text-xs font-bold text-[var(--text-primary)]">Avoid</div>
              <div className="text-[10px] text-[var(--text-muted)]">Prefer not to work</div>
            </button>

            <button
              type="button"
              onClick={() => setPreferenceType('unavailable')}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                preferenceType === 'unavailable'
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-700 dark:text-rose-300 shadow-xs'
                  : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Slash size={18} className="mx-auto mb-1 text-rose-500" />
              <div className="text-xs font-bold text-[var(--text-primary)]">Unavailable</div>
              <div className="text-[10px] text-[var(--text-muted)]">Hard constraint</div>
            </button>
          </div>
        </div>

        {/* Day of Week */}
        <div>
          <CustomSelector
            label="Day Scope *"
            options={WEEKDAYS}
            value={dayOfWeekVal}
            onChange={setDayOfWeekVal}
            isSearchable={false}
            isClearable={false}
          />
        </div>

        {/* Time Scope Toggle */}
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500"
            />
            <span>Applies to the entire day</span>
          </label>

          {!isAllDay && (
            <div className="grid grid-cols-2 gap-3 mt-2.5 p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
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
          )}
        </div>

        {/* Optional Note using shared Textarea */}
        <div>
          <Textarea
            label="Optional Note / Reason"
            value={note}
            maxLength={255}
            showCharCount
            onChange={(e) => setNote(e.target.value.slice(0, 255))}
            placeholder="e.g. Evening college classes on Tuesdays, family commitments..."
            rows={2}
          />
        </div>

        {/* Advisory Notice */}
        <div className="p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
          Preferences are soft and advisory: they guide management when building weekly rosters and highlight conflicts.
          They do not replace formal leave requests.
        </div>
      </form>
    </Modal>
  );
}
