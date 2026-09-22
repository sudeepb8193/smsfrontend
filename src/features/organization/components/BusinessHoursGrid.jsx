import React, { useState, useEffect } from 'react';
import { Clock, Save, Copy, Moon, CheckCircle2 } from 'lucide-react';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';

const DAYS_OF_WEEK = [
  { dayOfWeek: 0, name: 'Sunday' },
  { dayOfWeek: 1, name: 'Monday' },
  { dayOfWeek: 2, name: 'Tuesday' },
  { dayOfWeek: 3, name: 'Wednesday' },
  { dayOfWeek: 4, name: 'Thursday' },
  { dayOfWeek: 5, name: 'Friday' },
  { dayOfWeek: 6, name: 'Saturday' },
];

export const BusinessHoursGrid = ({ businessHours = [], onSave, saving = false }) => {
  const [schedule, setSchedule] = useState(() =>
    DAYS_OF_WEEK.map((d) => ({
      dayOfWeek: d.dayOfWeek,
      isOpen: d.dayOfWeek >= 1 && d.dayOfWeek <= 5,
      openTime: '09:00',
      closeTime: '18:00',
      breakStartTime: '',
      breakEndTime: '',
      spansMidnight: false,
    })),
  );

  useEffect(() => {
    if (Array.isArray(businessHours) && businessHours.length > 0) {
      setSchedule(
        DAYS_OF_WEEK.map((d) => {
          const found = businessHours.find((h) => h.dayOfWeek === d.dayOfWeek);
          if (found) {
            return {
              dayOfWeek: d.dayOfWeek,
              isOpen: found.isOpen,
              openTime: found.openTime || '09:00',
              closeTime: found.closeTime || '18:00',
              breakStartTime: found.breakStartTime || '',
              breakEndTime: found.breakEndTime || '',
              spansMidnight: found.spansMidnight || false,
            };
          }
          return {
            dayOfWeek: d.dayOfWeek,
            isOpen: d.dayOfWeek >= 1 && d.dayOfWeek <= 5,
            openTime: '09:00',
            closeTime: '18:00',
            breakStartTime: '',
            breakEndTime: '',
            spansMidnight: false,
          };
        }),
      );
    }
  }, [businessHours]);

  const handleToggleOpen = (dayOfWeek) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayOfWeek
          ? { ...item, isOpen: !item.isOpen }
          : item,
      ),
    );
  };

  const handleTimeChange = (dayOfWeek, field, value) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.dayOfWeek === dayOfWeek) {
          const updated = { ...item, [field]: value };
          if (updated.isOpen && updated.openTime && updated.closeTime) {
            updated.spansMidnight = updated.closeTime < updated.openTime;
          }
          return updated;
        }
        return item;
      }),
    );
  };

  const applyMondayToWeekdays = () => {
    const monday = schedule.find((s) => s.dayOfWeek === 1);
    if (!monday) return;

    setSchedule((prev) =>
      prev.map((item) =>
        item.dayOfWeek >= 1 && item.dayOfWeek <= 5
          ? { ...monday, dayOfWeek: item.dayOfWeek }
          : item,
      ),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = schedule.map((item) => ({
      dayOfWeek: item.dayOfWeek,
      isOpen: item.isOpen,
      openTime: item.isOpen ? item.openTime : null,
      closeTime: item.isOpen ? item.closeTime : null,
      breakStartTime: item.isOpen && item.breakStartTime ? item.breakStartTime : null,
      breakEndTime: item.isOpen && item.breakEndTime ? item.breakEndTime : null,
    }));
    onSave(payload);
  };

  return (
    <Card
      title="Business Hours & Working Days"
      subtitle="Define weekly operating hours, shift schedules, break periods, and overnight shift configurations."
      action={
        <Button
          variant="outline"
          size="small"
          icon={Copy}
          onClick={applyMondayToWeekdays}
        >
          Copy Monday to Mon-Fri
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {schedule.map((item) => {
            const dayName = DAYS_OF_WEEK.find((d) => d.dayOfWeek === item.dayOfWeek)?.name;

            return (
              <div
                key={item.dayOfWeek}
                className={`p-4 rounded-xl border transition-all ${
                  item.isOpen
                    ? 'bg-[var(--bg-card)] border-[var(--border-color)] shadow-sm'
                    : 'bg-[var(--bg-input)] border-transparent opacity-75'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Day Toggle & Label */}
                  <div className="flex items-center gap-3 w-40 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isOpen}
                        onChange={() => handleToggleOpen(item.dayOfWeek)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[var(--border-color)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>

                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        {dayName}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {item.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>

                    {item.spansMidnight && item.isOpen && (
                      <Badge variant="warning">
                        <span className="flex items-center gap-1">
                          <Moon size={12} /> Overnight Shift
                        </span>
                      </Badge>
                    )}
                  </div>

                  {/* Operational Time Selectors */}
                  {item.isOpen ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                          Opens At
                        </label>
                        <input
                          type="time"
                          value={item.openTime || ''}
                          onChange={(e) =>
                            handleTimeChange(item.dayOfWeek, 'openTime', e.target.value)
                          }
                          className="w-full h-9 px-2 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                          Closes At
                        </label>
                        <input
                          type="time"
                          value={item.closeTime || ''}
                          onChange={(e) =>
                            handleTimeChange(item.dayOfWeek, 'closeTime', e.target.value)
                          }
                          className="w-full h-9 px-2 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                          Break Start
                        </label>
                        <input
                          type="time"
                          value={item.breakStartTime || ''}
                          onChange={(e) =>
                            handleTimeChange(item.dayOfWeek, 'breakStartTime', e.target.value)
                          }
                          className="w-full h-9 px-2 text-xs text-[var(--text-primary)] bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                          Break End
                        </label>
                        <input
                          type="time"
                          value={item.breakEndTime || ''}
                          onChange={(e) =>
                            handleTimeChange(item.dayOfWeek, 'breakEndTime', e.target.value)
                          }
                          className="w-full h-9 px-2 text-xs text-[var(--text-primary)] bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 text-xs text-[var(--text-muted)] italic py-2">
                      Store closed on {dayName}. No appointment slots will be scheduled.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
          <Button type="submit" variant="primary" icon={Save} loading={saving}>
            Save Operating Schedule
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BusinessHoursGrid;
