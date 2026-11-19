import React, { useState, useEffect } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import Pagination from '../../../components/shared/Pagination';
import { toast } from 'sonner';
import { checkInStaff, checkOutStaff } from '../api/staffAttendanceApi';
import {
  Clock,
  Play,
  Square,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
  Edit3,
  FileText,
} from 'lucide-react';

export const MyAttendanceTab = ({
  data,
  myCorrectionsData,
  isLoading,
  onRefresh,
  onRequestCorrection,
  organizationId,
}) => {
  const staff = data?.staff || {};
  const todayData = data?.today || {};
  const todayRecord = todayData?.attendanceRecord;
  const isCheckedIn = todayData?.isCurrentlyIn;
  const historyRows = data?.history || [];

  const [isPunching, setIsPunching] = useState(false);
  const [elapsedTimer, setElapsedTimer] = useState('00:00:00');

  // Live timer for currently checked-in session
  useEffect(() => {
    if (!isCheckedIn || !todayRecord?.checkInAt) {
      setElapsedTimer('00:00:00');
      return;
    }

    const checkInTime = new Date(todayRecord.checkInAt).getTime();

    const updateTimer = () => {
      const diffMs = Math.max(0, Date.now() - checkInTime);
      const totalSec = Math.floor(diffMs / 1000);
      const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      const s = String(totalSec % 60).padStart(2, '0');
      setElapsedTimer(`${h}:${m}:${s}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, todayRecord?.checkInAt]);

  const handlePunch = () => {
    setIsPunching(true);

    const performPunch = async (coords = null) => {
      try {
        const payload = {
          branchId: staff.homeBranchId,
          method: coords ? 'GEOFENCED_APP' : 'MANUAL',
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        };

        if (isCheckedIn) {
          const res = await checkOutStaff(payload, organizationId);
          toast.success(res?.message || 'Checked out successfully.');
        } else {
          const res = await checkInStaff(payload, organizationId);
          toast.success(res?.message || 'Checked in successfully.');
        }

        onRefresh?.();
      } catch (err) {
        toast.error(err?.message || 'Punch operation failed.');
      } finally {
        setIsPunching(false);
      }
    };

    // Try geolocation if supported
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          performPunch({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          performPunch(null);
        },
        { timeout: 8000, enableHighAccuracy: true },
      );
    } else {
      performPunch(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <Badge variant="success">Present</Badge>;
      case 'late':
        return <Badge variant="warning">Late</Badge>;
      case 'early_exit':
        return <Badge variant="warning">Early Exit</Badge>;
      case 'half_day':
        return <Badge variant="warning">Half Day</Badge>;
      case 'absent':
        return <Badge variant="danger">Absent</Badge>;
      case 'on_leave':
        return <Badge variant="info">On Leave</Badge>;
      case 'holiday':
        return <Badge variant="neutral">Holiday</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader size="lg" text="Loading your attendance dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Shift Info & Interactive Punch Control */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Check-In / Out Hero Card */}
        <div
          className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 md:col-span-2 ${
            isCheckedIn
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Clock
                  size={14}
                  className={isCheckedIn ? 'text-emerald-500' : 'text-primary-500'}
                />
                Today's Punch Status
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-baseline gap-4 my-2">
              <div className="text-4xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight">
                {isCheckedIn ? elapsedTimer : '00:00:00'}
              </div>
              {isCheckedIn && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Clocked In
                </span>
              )}
            </div>

            <div className="text-xs text-[var(--text-secondary)] mt-1">
              {isCheckedIn
                ? `Clocked in at ${formatTime(todayRecord?.checkInAt)} (${
                    todayRecord?.checkInMethod || 'mobile'
                  }). Don't forget to clock out when leaving.`
                : todayRecord?.checkOutAt
                ? `Day completed. Clocked out at ${formatTime(
                    todayRecord.checkOutAt,
                  )}. Total worked: ${Math.floor(
                    (todayRecord.workedMinutes || 0) / 60,
                  )}h ${(todayRecord.workedMinutes || 0) % 60}m.`
                : 'You have not checked in yet today.'}
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <MapPin size={14} className="text-primary-500" />
              GPS-verified branch punch enabled
            </div>
            <Button
              variant={isCheckedIn ? 'danger' : 'primary'}
              size="lg"
              onClick={handlePunch}
              disabled={isPunching}
              icon={isCheckedIn ? Square : Play}
              className="px-8 shadow-md"
            >
              {isPunching
                ? 'Processing...'
                : isCheckedIn
                ? 'Clock Out Now'
                : 'Clock In Now'}
            </Button>
          </div>
        </div>

        {/* Scheduled Shift Card */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar size={14} className="text-primary-500" /> Planned Shift
            </div>

            {todayData.scheduledShift ? (
              <div className="space-y-2 mt-3">
                <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                  {todayData.scheduledShift.startTime} — {todayData.scheduledShift.endTime}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Break duration: {todayData.scheduledShift.breakDurationMinutes || 0} minutes
                </div>
                <div className="pt-2 text-xs">
                  Today's Status:{' '}
                  {getStatusBadge(todayRecord?.status || 'absent')}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                {todayData.isOnLeave ? (
                  <Badge variant="info">On Approved Leave</Badge>
                ) : todayData.isHoliday ? (
                  <Badge variant="neutral">Branch Holiday</Badge>
                ) : (
                  'No scheduled shift for today'
                )}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onRequestCorrection({
                attendanceId: todayRecord?.id,
                attendanceDate: todayData.date,
                staffId: staff.id,
              })
            }
            icon={Edit3}
            className="w-full justify-center mt-3"
          >
            Request Today's Correction
          </Button>
        </div>
      </div>

      {/* Attendance History Section */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h3 className="font-bold text-[var(--text-primary)] text-sm">
            My Attendance History
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            Showing past punches and approved payroll locks
          </span>
        </div>

        {historyRows.length === 0 ? (
          <EmptyState
            title="No past attendance records"
            description="Your recorded punches and shifts will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="bg-[var(--bg-app)] uppercase font-semibold text-[11px] text-[var(--text-secondary)] border-b border-[var(--border-color)] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Worked</th>
                  <th className="py-3 px-4">Overtime</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {historyRows.map((row) => {
                  const hours = Math.floor((row.workedMinutes || 0) / 60);
                  const mins = (row.workedMinutes || 0) % 60;
                  const workedFormatted =
                    row.workedMinutes !== null ? `${hours}h ${mins}m` : '—';
                  const otHours = Math.floor((row.overtimeMinutes || 0) / 60);
                  const otMins = (row.overtimeMinutes || 0) % 60;
                  const otFormatted =
                    row.overtimeMinutes > 0 ? `${otHours}h ${otMins}m` : '—';

                  const dateStr = new Date(row.attendanceDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                        <div className="flex items-center gap-1.5">
                          {dateStr}
                          {row.isLocked && (
                            <Lock size={12} className="text-amber-500" title="Locked by Period Approval" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">
                        {row.branch?.name || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--text-primary)]">
                        {formatTime(row.checkInAt)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--text-primary)]">
                        {formatTime(row.checkOutAt)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--text-primary)] font-medium">
                        {workedFormatted}
                      </td>
                      <td className="py-3 px-4 font-mono text-primary-600 dark:text-primary-400 font-medium">
                        {otFormatted}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(row.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!row.isLocked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onRequestCorrection({
                                attendanceId: row.id,
                                attendanceDate: row.attendanceDate,
                                staffId: staff.id,
                              })
                            }
                            icon={Edit3}
                          >
                            Correct
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttendanceTab;
