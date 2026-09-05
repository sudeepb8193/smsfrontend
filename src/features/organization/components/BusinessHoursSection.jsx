import { useState, useEffect } from 'react';
import {
  Clock,
  Save,
  Copy,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Coffee,
} from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { Button } from '../../../components/common/Button/Button';
import { Loader } from '../../../components/common/Loader/Loader';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_WEEKLY_SCHEDULE = [
  { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '18:00', spansMidnight: false },
  { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00', spansMidnight: false },
  { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00', spansMidnight: false },
  { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00', spansMidnight: false },
  { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00', spansMidnight: false },
  { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00', spansMidnight: false },
  { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '17:00', spansMidnight: false },
];

export const BusinessHoursSection = ({ organizationId, isReadOnly }) => {
  const [schedules, setSchedules] = useState(DEFAULT_WEEKLY_SCHEDULE);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadHours = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await organizationApi.getBusinessHours(
        organizationId,
        selectedBranchId ? parseInt(selectedBranchId, 10) : undefined,
      );

      if (data && data.length > 0) {
        const merged = DEFAULT_WEEKLY_SCHEDULE.map((defDay) => {
          const found = data.find((d) => d.dayOfWeek === defDay.dayOfWeek);
          return found
            ? {
                dayOfWeek: found.dayOfWeek,
                isOpen: found.isOpen,
                openTime: found.openTime || '09:00',
                closeTime: found.closeTime || '18:00',
                breakStartTime: found.breakStartTime || '',
                breakEndTime: found.breakEndTime || '',
                spansMidnight: found.spansMidnight || false,
              }
            : defDay;
        });
        setSchedules(merged);
      } else {
        setSchedules(DEFAULT_WEEKLY_SCHEDULE);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load business hours' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) loadHours();
  }, [organizationId, selectedBranchId]);

  const handleDayChange = (dayIdx, field, value) => {
    const updated = [...schedules];
    updated[dayIdx] = { ...updated[dayIdx], [field]: value };
    setSchedules(updated);
  };

  const handleCopyMondayToWeekdays = () => {
    const monday = schedules[1];
    const updated = schedules.map((s) => {
      if (s.dayOfWeek >= 1 && s.dayOfWeek <= 5) {
        return {
          ...s,
          isOpen: monday.isOpen,
          openTime: monday.openTime,
          closeTime: monday.closeTime,
          breakStartTime: monday.breakStartTime,
          breakEndTime: monday.breakEndTime,
          spansMidnight: monday.spansMidnight,
        };
      }
      return s;
    });
    setSchedules(updated);
    setFeedback({ type: 'success', message: 'Copied Monday schedule to all weekdays (Mon-Fri).' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {
        branchId: selectedBranchId ? parseInt(selectedBranchId, 10) : undefined,
        schedules: schedules.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          isOpen: s.isOpen,
          openTime: s.isOpen ? s.openTime : undefined,
          closeTime: s.isOpen ? s.closeTime : undefined,
          breakStartTime: s.isOpen && s.breakStartTime ? s.breakStartTime : undefined,
          breakEndTime: s.isOpen && s.breakEndTime ? s.breakEndTime : undefined,
          spansMidnight: s.spansMidnight || false,
        })),
      };

      await organizationApi.updateWeeklyHours(organizationId, payload);
      setFeedback({ type: 'success', message: 'Weekly business hours schedule saved successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save business hours.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Clock size={20} className="text-primary-500" />
            Weekly Business Hours & Working Days
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Configure default 7-day opening hours, break times, and overnight shifts
          </p>
        </div>
        {!isReadOnly && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyMondayToWeekdays}
            icon={Copy}
          >
            Copy Mon to Mon-Fri
          </Button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-500'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <Loader text="Loading business hours..." />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {schedules.map((s, idx) => (
              <div
                key={s.dayOfWeek}
                className={`p-4 rounded-2xl border transition ${
                  s.isOpen
                    ? 'bg-[var(--bg-card)] border-[var(--border-color)]'
                    : 'bg-[var(--bg-card)]/50 border-[var(--border-color)] opacity-60'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Day Name & Toggle */}
                  <div className="md:col-span-3 flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={isReadOnly}
                        checked={s.isOpen}
                        onChange={(e) => handleDayChange(idx, 'isOpen', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                    <div>
                      <span className="text-sm font-bold text-[var(--text-primary)] block">{DAY_NAMES[s.dayOfWeek]}</span>
                      <span className={`text-[10px] font-bold ${s.isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                        {s.isOpen ? 'OPEN' : 'CLOSED'}
                      </span>
                    </div>
                  </div>

                  {/* Open & Close Times */}
                  {s.isOpen ? (
                    <>
                      <div className="md:col-span-4 flex items-center gap-2">
                        <input
                          type="time"
                          disabled={isReadOnly}
                          value={s.openTime}
                          onChange={(e) => handleDayChange(idx, 'openTime', e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-mono focus:border-primary-500"
                        />
                        <span className="text-xs text-[var(--text-muted)]">to</span>
                        <input
                          type="time"
                          disabled={isReadOnly}
                          value={s.closeTime}
                          onChange={(e) => handleDayChange(idx, 'closeTime', e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-mono focus:border-primary-500"
                        />
                      </div>

                      {/* Break Window */}
                      <div className="md:col-span-3 flex items-center gap-2">
                        <Coffee size={14} className="text-[var(--text-muted)]" />
                        <input
                          type="time"
                          disabled={isReadOnly}
                          value={s.breakStartTime || ''}
                          onChange={(e) => handleDayChange(idx, 'breakStartTime', e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-mono focus:border-primary-500"
                          placeholder="Break Start"
                        />
                        <span className="text-xs text-[var(--text-muted)]">-</span>
                        <input
                          type="time"
                          disabled={isReadOnly}
                          value={s.breakEndTime || ''}
                          onChange={(e) => handleDayChange(idx, 'breakEndTime', e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-mono focus:border-primary-500"
                          placeholder="Break End"
                        />
                      </div>

                      {/* Overnight Toggle */}
                      <div className="md:col-span-2 flex justify-end">
                        <label className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={isReadOnly}
                            checked={s.spansMidnight}
                            onChange={(e) => handleDayChange(idx, 'spansMidnight', e.target.checked)}
                            className="rounded border-[var(--border-color)] text-primary-500 focus:ring-0 bg-[var(--bg-card)]"
                          />
                          <Moon size={12} className="text-indigo-400" />
                          <span>Overnight</span>
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="md:col-span-9 text-xs text-[var(--text-muted)] italic">
                      Salon is closed on this day. No booking slots generated.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!isReadOnly && (
            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={saving}
                icon={Sparkles}
              >
                Save Weekly Schedule
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
