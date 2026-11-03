import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import DatePicker from '../../../../components/shared/DatePicker';
import CustomSelector from '../../../../components/shared/CustomSelector';
import Badge from '../../../../components/shared/Badge';
import {
  Calendar,
  Clock,
  AlertTriangle,
  Copy,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { index: 1, label: 'Monday' },
  { index: 2, label: 'Tuesday' },
  { index: 3, label: 'Wednesday' },
  { index: 4, label: 'Thursday' },
  { index: 5, label: 'Friday' },
  { index: 6, label: 'Saturday' },
  { index: 0, label: 'Sunday' },
];

export default function WeeklyScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  staff,
  templates = [],
  initialSchedule = null,
  preferences = [],
  loading = false,
}) {
  const [effectiveFrom, setEffectiveFrom] = useState(() => {
    return new Date().toISOString().substring(0, 10);
  });
  const [effectiveTo, setEffectiveTo] = useState('');
  const [daysState, setDaysState] = useState(() => {
    return DAYS_OF_WEEK.map((d) => ({
      dayOfWeek: d.index,
      dayName: d.label,
      isWorking: d.index !== 0, // Default working Mon-Sat, Sunday off
      mode: 'template', // 'template' | 'custom'
      shiftTemplateId: templates[0]?.id || '',
      customStartTime: '09:00',
      customEndTime: '17:00',
      customBreakStartTime: '13:00',
      customBreakEndTime: '14:00',
    }));
  });
  const [formError, setFormError] = useState(null);

  // Initialize from initialSchedule or defaults
  useEffect(() => {
    if (initialSchedule && Array.isArray(initialSchedule.days) && initialSchedule.days.length === 7) {
      setEffectiveFrom(initialSchedule.effectiveFrom || new Date().toISOString().substring(0, 10));
      setEffectiveTo(initialSchedule.effectiveTo || '');

      setDaysState(
        DAYS_OF_WEEK.map((d) => {
          const match = initialSchedule.days.find((row) => row.dayOfWeek === d.index);
          const isWorking = match ? match.isWorking : true;
          const hasTemplate = match && match.shiftTemplateId;
          return {
            dayOfWeek: d.index,
            dayName: d.label,
            isWorking,
            mode: hasTemplate ? 'template' : 'custom',
            shiftTemplateId: match?.shiftTemplateId || templates[0]?.id || '',
            customStartTime: match?.customStartTime || '09:00',
            customEndTime: match?.customEndTime || '17:00',
            customBreakStartTime: match?.customBreakStartTime || '13:00',
            customBreakEndTime: match?.customBreakEndTime || '14:00',
          };
        }),
      );
    } else {
      setEffectiveFrom(new Date().toISOString().substring(0, 10));
      setEffectiveTo('');
      setDaysState(
        DAYS_OF_WEEK.map((d) => ({
          dayOfWeek: d.index,
          dayName: d.label,
          isWorking: d.index !== 0,
          mode: templates.length > 0 ? 'template' : 'custom',
          shiftTemplateId: templates[0]?.id || '',
          customStartTime: '09:00',
          customEndTime: '17:00',
          customBreakStartTime: '13:00',
          customBreakEndTime: '14:00',
        })),
      );
    }
    setFormError(null);
  }, [initialSchedule, isOpen, templates]);

  const updateDay = (dayIndex, updates) => {
    setDaysState((prev) =>
      prev.map((d) => (d.dayOfWeek === dayIndex ? { ...d, ...updates } : d)),
    );
  };

  const applyTemplateToAllWorkingDays = (templateId) => {
    setDaysState((prev) =>
      prev.map((d) =>
        d.isWorking ? { ...d, mode: 'template', shiftTemplateId: templateId } : d,
      ),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!effectiveFrom) {
      setFormError('Effective from date is required');
      return;
    }
    if (effectiveTo && effectiveTo < effectiveFrom) {
      setFormError('Effective to date cannot precede effective from date');
      return;
    }

    // Validate days
    for (const d of daysState) {
      if (d.isWorking) {
        if (d.mode === 'template') {
          if (!d.shiftTemplateId) {
            setFormError(`Please select a shift template for ${d.dayName}`);
            return;
          }
        } else {
          if (!d.customStartTime || !d.customEndTime) {
            setFormError(`Custom start and end time required for ${d.dayName}`);
            return;
          }
          if (d.customEndTime <= d.customStartTime) {
            setFormError(`End time must be after start time for ${d.dayName}`);
            return;
          }
        }
      }
    }

    const payload = {
      staffId: staff.id,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
      days: daysState.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        isWorking: d.isWorking,
        shiftTemplateId: d.isWorking && d.mode === 'template' ? d.shiftTemplateId : null,
        customStartTime: d.isWorking && d.mode === 'custom' ? d.customStartTime : null,
        customEndTime: d.isWorking && d.mode === 'custom' ? d.customEndTime : null,
        customBreakStartTime:
          d.isWorking && d.mode === 'custom' ? d.customBreakStartTime || null : null,
        customBreakEndTime:
          d.isWorking && d.mode === 'custom' ? d.customBreakEndTime || null : null,
      })),
    };

    onSubmit(payload);
  };

  const templateOptions = templates.map((t) => ({
    value: t.id,
    label: `${t.name} (${t.startTime}-${t.endTime})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Weekly Schedule Builder — ${staff?.fullName || 'Employee'}`}
      size="large"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="weekly-schedule-form"
            variant="primary"
            loading={loading}
          >
            Save Weekly Schedule
          </Button>
        </div>
      }
    >
      <form id="weekly-schedule-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-500 font-medium">
            {formError}
          </div>
        )}

        {/* Staff & Effective Date Range Banner */}
        <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div>
            <div className="text-[11px] text-[var(--text-muted)] font-semibold">Employee</div>
            <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 mt-0.5">
              <span>{staff?.fullName}</span>
              <span className="text-xs text-primary-600 dark:text-primary-400 font-mono font-bold">
                ({staff?.employeeCode})
              </span>
            </div>
          </div>

          <div>
            <DatePicker
              label="Effective From"
              value={effectiveFrom}
              onChange={(val) => setEffectiveFrom(val)}
              required
            />
          </div>

          <div>
            <DatePicker
              label="Effective To (Optional)"
              value={effectiveTo}
              onChange={(val) => setEffectiveTo(val)}
              minDate={effectiveFrom}
              placeholder="Ongoing / Select date"
            />
          </div>
        </div>

        {/* Quick bulk action */}
        {templateOptions.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-xs">
            <span className="text-primary-700 dark:text-primary-300 font-semibold flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary-500" /> Quick Apply: Apply template to all working days:
            </span>
            <div className="flex items-center gap-1.5">
              {templateOptions.slice(0, 3).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => applyTemplateToAllWorkingDays(opt.value)}
                  className="px-2.5 py-1 rounded-lg bg-primary-500 text-white font-bold hover:bg-primary-600 transition-all cursor-pointer text-[11px] shadow-xs"
                >
                  {opt.label.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 7 Days Schedule Table */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {daysState.map((day) => {
            const dayPref = preferences.find(
              (p) => p.staffId === staff?.id && p.dayOfWeek === day.dayOfWeek,
            );
            const isUnavailable = dayPref?.preferenceType === 'unavailable';
            const isAvoid = dayPref?.preferenceType === 'avoid';
            const isPreferred = dayPref?.preferenceType === 'preferred';

            return (
              <div
                key={day.dayOfWeek}
                className={`p-3.5 rounded-2xl border transition-all ${
                  day.isWorking
                    ? 'bg-[var(--bg-card)] border-[var(--border-color)] shadow-xs'
                    : 'bg-[var(--bg-input)]/40 border-[var(--border-color)]/60 opacity-75'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Day Header & Working Toggle */}
                  <div className="flex items-center gap-3 min-w-[150px]">
                    <button
                      type="button"
                      onClick={() => updateDay(day.dayOfWeek, { isWorking: !day.isWorking })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        day.isWorking
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {day.isWorking ? (
                        <>
                          <CheckCircle2 size={13} /> Working
                        </>
                      ) : (
                        <>
                          <XCircle size={13} /> Day Off
                        </>
                      )}
                    </button>

                    <div>
                      <span className="font-bold text-sm text-[var(--text-primary)]">{day.dayName}</span>
                      {dayPref && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                              isUnavailable
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                : isAvoid
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            }`}
                          >
                            Pref: {dayPref.preferenceType}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mode & Hours / Template Configuration */}
                  {day.isWorking ? (
                    <div className="flex-1 flex flex-wrap items-center gap-2 justify-end">
                      {/* Mode Toggle */}
                      <div className="flex items-center bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => updateDay(day.dayOfWeek, { mode: 'template' })}
                          className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
                            day.mode === 'template'
                              ? 'bg-primary-500 text-white font-bold shadow-xs'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          Template
                        </button>
                        <button
                          type="button"
                          onClick={() => updateDay(day.dayOfWeek, { mode: 'custom' })}
                          className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
                            day.mode === 'custom'
                              ? 'bg-primary-500 text-white font-bold shadow-xs'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          Custom
                        </button>
                      </div>

                      {/* Template Selector */}
                      {day.mode === 'template' ? (
                        <div className="w-56">
                          <CustomSelector
                            options={templateOptions}
                            value={day.shiftTemplateId}
                            onChange={(val) => updateDay(day.dayOfWeek, { shiftTemplateId: val })}
                            placeholder="Select Template..."
                            isSearchable={false}
                            isClearable={false}
                          />
                        </div>
                      ) : (
                        /* Custom Hours Inputs */
                        <div className="flex items-center gap-1.5 text-xs">
                          <input
                            type="time"
                            value={day.customStartTime}
                            onChange={(e) =>
                              updateDay(day.dayOfWeek, { customStartTime: e.target.value })
                            }
                            className="w-24 px-2 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-mono font-semibold"
                          />
                          <span className="text-[var(--text-muted)] font-bold">–</span>
                          <input
                            type="time"
                            value={day.customEndTime}
                            onChange={(e) =>
                              updateDay(day.dayOfWeek, { customEndTime: e.target.value })
                            }
                            className="w-24 px-2 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-mono font-semibold"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--text-muted)] italic">
                      Standing recurring day off (non-working)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </form>
    </Modal>
  );
}
