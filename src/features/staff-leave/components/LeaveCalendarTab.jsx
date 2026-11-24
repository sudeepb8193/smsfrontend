import React, { useState, useMemo } from 'react';
import Button from '../../../components/shared/Button';
import CustomSelector from '../../../components/shared/CustomSelector';
import { Badge } from '../../../components/shared/Badge';
import Skeleton from '../../../components/shared/Skeleton';
import EmptyState from '../../../components/shared/EmptyState';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CalendarOff,
  Sparkles,
  Info,
} from 'lucide-react';

/**
 * LeaveCalendarTab: Team Leave Calendar with Month / Week navigation,
 * displaying approved staff leaves, public holidays, and blackout period banners.
 */
export default function LeaveCalendarTab({
  calendarEvents = [],
  blackoutPeriods = [],
  isLoading = false,
  branches = [],
  currentDate = new Date(),
  onDateChange,
}) {
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
  const [activeDate, setActiveDate] = useState(currentDate || new Date());

  const safeBranches = useMemo(() => {
    if (Array.isArray(branches)) return branches;
    if (Array.isArray(branches?.data)) return branches.data;
    if (Array.isArray(branches?.items)) return branches.items;
    return [];
  }, [branches]);

  const branchOptions = [
    { value: '', label: 'All Branches' },
    ...safeBranches.map((b) => ({ value: b.id, label: b.name })),
  ];

  // Month navigation helpers
  const handlePrevMonth = () => {
    setActiveDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setActiveDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setActiveDate(new Date());
  };

  // Month grid calculation
  const calendarDays = useMemo(() => {
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Leading empty days from prev month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: null, dateStr: null, isCurrentMonth: false });
    }
    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true });
    }
    return days;
  }, [activeDate]);

  const monthYearLabel = activeDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map events by date
  const eventsByDate = useMemo(() => {
    const map = {};
    const safeEvents = Array.isArray(calendarEvents)
      ? calendarEvents
      : Array.isArray(calendarEvents?.events)
      ? calendarEvents.events
      : Array.isArray(calendarEvents?.leaves)
      ? calendarEvents.leaves
      : Array.isArray(calendarEvents?.data)
      ? calendarEvents.data
      : [];

    safeEvents.forEach((evt) => {
      const startStr = (evt.startDate || evt.date)?.slice(0, 10);
      const endStr = (evt.endDate || evt.startDate || evt.date)?.slice(0, 10);

      if (startStr && endStr) {
        const current = new Date(startStr);
        const end = new Date(endStr);
        let count = 0;
        while (current <= end && count < 60) {
          const dStr = current.toISOString().slice(0, 10);
          if (!map[dStr]) map[dStr] = [];
          map[dStr].push(evt);
          current.setDate(current.getDate() + 1);
          count++;
        }
      } else if (startStr) {
        if (!map[startStr]) map[startStr] = [];
        map[startStr].push(evt);
      }
    });
    return map;
  }, [calendarEvents]);

  // Active blackout periods overlapping current month
  const activeBlackouts = useMemo(() => {
    const safeBlackouts = Array.isArray(blackoutPeriods)
      ? blackoutPeriods
      : Array.isArray(blackoutPeriods?.data)
      ? blackoutPeriods.data
      : Array.isArray(blackoutPeriods?.items)
      ? blackoutPeriods.items
      : [];
    return safeBlackouts.filter((b) => b.isActive ?? true);
  }, [blackoutPeriods]);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Controls */}
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="small" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="small" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="small" onClick={handleToday}>
              Today
            </Button>
          </div>

          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {monthYearLabel}
          </h3>
        </div>
      </div>

      {/* Blackout Warnings Banner */}
      {activeBlackouts.length > 0 && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
          <CalendarOff className="w-5 h-5 text-rose-500 shrink-0" />
          <div className="text-xs text-[var(--text-primary)] flex-1">
            <span className="font-bold">Active Blackout Notice: </span>
            {activeBlackouts.map((b) => (
              <span key={b.id} className="mr-3">
                <strong>{b.name}</strong> ({new Date(b.startDate).toLocaleDateString()} —{' '}
                {new Date(b.endDate).toLocaleDateString()}) [{b.restrictionType}]
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Month Calendar Grid */}
      <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-[var(--text-muted)] pb-2 border-b border-[var(--border-color)]">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Days Cells */}
        {isLoading ? (
          <div className="py-16">
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, index) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[90px] p-1.5 bg-[var(--bg-card-hover)]/30 border border-[var(--border-color)]/30 rounded-xl opacity-40"
                  />
                );
              }

              const dayEvents = eventsByDate[cell.dateStr] || [];
              const isToday =
                new Date().toISOString().slice(0, 10) === cell.dateStr;

              // Check if date falls in any blackout
              const isBlackoutDay = activeBlackouts.some(
                (b) =>
                  b.startDate?.slice(0, 10) <= cell.dateStr &&
                  b.endDate?.slice(0, 10) >= cell.dateStr,
              );

              return (
                <div
                  key={cell.dateStr}
                  className={`min-h-[90px] p-1.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isToday
                      ? 'border-primary-500 bg-primary-500/5'
                      : isBlackoutDay
                      ? 'border-rose-400/50 bg-rose-500/5'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-[11px]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {isBlackoutDay && (
                      <span className="text-[9px] font-bold text-rose-500 uppercase">
                        Blackout
                      </span>
                    )}
                  </div>

                  {/* Day Events / Leave tags */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-16">
                    {dayEvents.map((evt, idx) => (
                      <div
                        key={evt.id || idx}
                        className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1"
                        style={{
                          backgroundColor: `${evt.colorCode || '#3b82f6'}20`,
                          color: evt.colorCode || '#3b82f6',
                          borderLeft: `2px solid ${evt.colorCode || '#3b82f6'}`,
                        }}
                      >
                        <span className="truncate">
                          {evt.staffName || evt.title || 'Staff Leave'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Calendar Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary-500" />
          <span>Approved Staff Leave</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span>Blackout Windows</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Public Holidays</span>
        </div>
      </div>
    </div>
  );
}
