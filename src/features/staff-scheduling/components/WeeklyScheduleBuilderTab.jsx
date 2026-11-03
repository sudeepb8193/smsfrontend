import React, { useState } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import EmptyState from '../../../components/shared/EmptyState';
import WeeklyScheduleModal from './modals/WeeklyScheduleModal';
import CopyScheduleModal from './modals/CopyScheduleModal';
import ScheduleOverrideModal from './modals/ScheduleOverrideModal';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Copy,
  Download,
  Share2,
  AlertTriangle,
  Users,
  Building2,
  Sparkles,
  Coffee,
  CheckCircle2,
} from 'lucide-react';

// Format HH:MM to 9 AM or 5 PM
function formatTime12(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  const mPart = m > 0 ? `:${m < 10 ? '0' : ''}${m}` : '';
  return `${h}${mPart} ${ampm}`;
}

function formatShiftRange(start, end) {
  if (!start || !end) return '';
  return `${formatTime12(start)} – ${formatTime12(end)}`;
}

// Formats YYYY-MM-DD to "Nov 10 – Nov 16, 2026"
function formatWeekDisplay(startDateStr) {
  if (!startDateStr) return '';
  const start = new Date(startDateStr);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

export default function WeeklyScheduleBuilderTab({
  teamSchedule,
  templates = [],
  selectedWeekStartDate,
  onChangeWeekStartDate,
  loading = false,
  onSaveSchedule,
  onCopySchedule,
  onCreateOverride,
}) {
  const [scheduleModalStaff, setScheduleModalStaff] = useState(null);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [overrideModalStaff, setOverrideModalStaff] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Navigate weeks
  const navigateWeek = (weeksDelta) => {
    const cur = new Date(selectedWeekStartDate);
    cur.setDate(cur.getDate() + weeksDelta * 7);
    onChangeWeekStartDate(cur.toISOString().substring(0, 10));
  };

  const jumpToCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    onChangeWeekStartDate(monday.toISOString().substring(0, 10));
  };

  const staffList = (teamSchedule?.teamGrid || []).map((row) => row.staff);

  const handleOpenScheduleForStaff = (staff) => {
    setScheduleModalStaff(staff);
  };

  const handleSubmitSchedule = async (payload) => {
    try {
      setActionLoading(true);
      await onSaveSchedule(payload);
      setScheduleModalStaff(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitCopy = async (payload) => {
    try {
      setActionLoading(true);
      await onCopySchedule(payload);
      setCopyModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitOverride = async (payload) => {
    try {
      setActionLoading(true);
      await onCreateOverride(payload);
      setOverrideModalStaff(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    window.print();
  };

  // Get day header dates from team schedule first row if available
  const sampleDays = teamSchedule?.teamGrid?.[0]?.days || [];

  return (
    <div className="space-y-4">
      {/* Control Bar: Date Range Navigator + Copy Schedule + Export matching Image Panel 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs">
        {/* Left Subtitle or Context */}
        <div className="text-xs text-[var(--text-secondary)] font-medium">
          View and manage weekly shifts for all eligible staff
        </div>

        {/* Date Navigator + Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Week Date Range Selector with Arrows */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-2 py-1">
            <button
              type="button"
              onClick={() => navigateWeek(-1)}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={jumpToCurrentWeek}
              className="text-xs font-bold text-[var(--text-primary)] hover:text-primary-500 font-mono transition cursor-pointer px-1"
            >
              {formatWeekDisplay(selectedWeekStartDate)}
            </button>
            <button
              type="button"
              onClick={() => navigateWeek(1)}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
              title="Next Week"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Copy Schedule Button */}
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => setCopyModalOpen(true)}
            disabled={staffList.length === 0}
            className="cursor-pointer"
          >
            <Copy size={13} className="mr-1.5" />
            <span>Copy Schedule</span>
          </Button>

          {/* Export Button */}
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={handleExport}
            className="cursor-pointer"
          >
            <Download size={13} className="mr-1.5" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* 7-Column Team Schedule Grid matching Image Panel 3 */}
      {teamSchedule?.teamGrid && teamSchedule.teamGrid.length > 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px] text-xs">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)]/60 text-xs font-bold text-[var(--text-secondary)]">
                  <th className="p-3.5 w-56 sticky left-0 z-20 bg-[var(--bg-input)] border-r border-[var(--border-color)] uppercase tracking-wider text-[11px]">
                    Staff Member
                  </th>
                  {sampleDays.map((d) => {
                    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.dayOfWeek];
                    const dateObj = new Date(d.date);
                    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                    const dayNum = dateObj.getDate();

                    return (
                      <th
                        key={d.date}
                        className="p-3 text-center border-r border-[var(--border-color)] min-w-[120px]"
                      >
                        <div className="text-[11px] font-bold text-[var(--text-primary)]">
                          {dayName}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                          {monthName} {dayNum}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-[var(--border-color)] text-xs">
                {teamSchedule.teamGrid.map((row) => {
                  const staffInitials = row.staff.fullName
                    ? row.staff.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'ST';

                  return (
                    <tr key={row.staff.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                      {/* Staff Member Info (Sticky Left Column) */}
                      <td className="p-3.5 sticky left-0 z-10 bg-[var(--bg-card)] border-r border-[var(--border-color)]">
                        <div
                          className="flex items-center gap-2.5 cursor-pointer"
                          onClick={() => handleOpenScheduleForStaff(row.staff)}
                        >
                          {row.staff.profilePhotoUrl ? (
                            <img
                              src={row.staff.profilePhotoUrl}
                              alt={row.staff.fullName}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-[var(--border-color)]"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary-500/15 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-xs shrink-0 border border-primary-500/20">
                              {staffInitials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-[var(--text-primary)] truncate hover:text-primary-500 transition-colors">
                              {row.staff.fullName}
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] truncate">
                              {row.staff.primaryDesignation || 'Stylist'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 7 Days Cells */}
                      {row.days.map((day) => {
                        const isEvening = day.startTime && parseInt(day.startTime.split(':')[0], 10) >= 12;
                        const isOverride = !!day.override;
                        const isTrainingOrBlocked = day.blocksCount > 0 || (day.templateName && day.templateName.toLowerCase().includes('training'));

                        // Determine pill color matching image
                        let pillClass = 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
                        if (isOverride) {
                          pillClass = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
                        } else if (isTrainingOrBlocked) {
                          pillClass = 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30';
                        } else if (isEvening) {
                          pillClass = 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
                        }

                        const timeLabel = formatShiftRange(day.startTime, day.endTime);

                        return (
                          <td
                            key={day.date}
                            onClick={() => handleOpenScheduleForStaff(row.staff)}
                            className="p-2 border-r border-[var(--border-color)] text-center align-middle cursor-pointer hover:bg-[var(--bg-input)]/50 transition-colors"
                          >
                            {day.isWorking ? (
                              <div
                                className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold text-center transition-transform hover:scale-[1.02] shadow-2xs ${pillClass}`}
                              >
                                {isTrainingOrBlocked ? (
                                  <div>Training ({timeLabel})</div>
                                ) : (
                                  <div>{timeLabel || day.templateName || 'Working'}</div>
                                )}
                              </div>
                            ) : (
                              <div className="px-2 py-1.5 rounded-xl bg-[var(--bg-input)]/50 text-[var(--text-muted)] text-[11px] font-semibold text-center">
                                Off
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Legend Matching Image Panel 3 */}
          <div className="p-3.5 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-secondary)] font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Working</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Off</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Evening</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Training</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Override</span>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Staff Assigned to this Branch"
          description="Assign staff members to this branch in Module 05, then configure their recurring weekly working schedules."
        />
      )}

      {/* Weekly Schedule Edit Modal */}
      {scheduleModalStaff && (
        <WeeklyScheduleModal
          isOpen={!!scheduleModalStaff}
          onClose={() => setScheduleModalStaff(null)}
          onSubmit={handleSubmitSchedule}
          staff={scheduleModalStaff}
          templates={templates}
          loading={actionLoading}
        />
      )}

      {/* Copy Schedule Modal */}
      {copyModalOpen && (
        <CopyScheduleModal
          isOpen={copyModalOpen}
          onClose={() => setCopyModalOpen(false)}
          onSubmit={handleSubmitCopy}
          staffList={staffList}
          loading={actionLoading}
        />
      )}

      {/* Schedule Override Modal */}
      {overrideModalStaff && (
        <ScheduleOverrideModal
          isOpen={!!overrideModalStaff}
          onClose={() => setOverrideModalStaff(null)}
          onSubmit={handleSubmitOverride}
          staffList={staffList}
          initialStaffId={overrideModalStaff.id}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
