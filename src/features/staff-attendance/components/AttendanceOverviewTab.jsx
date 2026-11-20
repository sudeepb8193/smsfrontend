import React from 'react';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserX,
  CalendarCheck,
  FileText,
  ShieldCheck,
  QrCode,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AttendanceOverviewTab = ({
  overviewData,
  currentlyInData,
  isLoading,
  onNavigateTab,
  onOpenManualEntry,
  canCreate,
  canApprove,
}) => {
  if (isLoading) {
    return <Loader type="stats" count={4} text="Loading attendance metrics..." />;
  }

  const metrics = overviewData || {};
  const currentlyIn = currentlyInData?.data || [];

  const statCards = [
    {
      label: 'Total Staff',
      value: metrics.totalStaff || 0,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Currently In',
      value: metrics.currentlyCheckedIn || 0,
      icon: Clock,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      badge: 'Live',
    },
    {
      label: 'Present Today',
      value: metrics.presentToday || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Late Arrivals',
      value: metrics.lateToday || 0,
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Absent',
      value: metrics.absentToday || 0,
      icon: UserX,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      label: 'On Leave',
      value: metrics.onLeaveToday || 0,
      icon: CalendarCheck,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Pending Corrections',
      value: metrics.pendingCorrections || 0,
      icon: FileText,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-500/10',
      actionTab: 'corrections',
    },
    {
      label: 'Pending Approvals',
      value: metrics.pendingApprovals || 0,
      icon: ShieldCheck,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10',
      actionTab: 'approvals',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => card.actionTab && onNavigateTab(card.actionTab)}
              className={`p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs transition-all duration-200 ${
                card.actionTab
                  ? 'cursor-pointer hover:border-primary-500/40 hover:shadow-sm'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)] font-mono">
                  {card.value}
                </div>
                {card.badge && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {card.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Punctuality Meter & Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <TrendingUp size={14} /> Punctuality Index
            </div>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] font-mono mt-1">
              {metrics.punctualityRate || 100}%
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              On-time arrival rate against scheduled shift grace thresholds.
            </p>
          </div>
          <div className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] h-2 rounded-full overflow-hidden mt-4">
            <div
              className="bg-primary-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.punctualityRate || 100}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Daily Hours Recorded
            </div>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] font-mono mt-1">
              {metrics.totalWorkedHoursToday || '0h 0m'}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Cumulative worked time across branch roster today.
            </p>
          </div>
          <div className="text-xs text-primary-600 dark:text-primary-400 font-mono font-medium">
            Overtime: {metrics.totalOvertimeHoursToday || '0h 0m'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigateTab('kiosk')}
                icon={QrCode}
              >
                Kiosk Mode
              </Button>
              {canCreate && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onOpenManualEntry}
                >
                  Manual Entry
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigateTab('daily')}
              >
                Daily Table
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigateTab('reports')}
              >
                Monthly Rollup
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Currently Checked-In Staff Roster */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-bold text-[var(--text-primary)] text-base">
              Live Currently Checked-In ({currentlyIn.length})
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab('daily')}
            icon={ArrowRight}
          >
            Full Daily View
          </Button>
        </div>

        {currentlyIn.length === 0 ? (
          <EmptyState
            title="No staff currently checked in"
            description="Employees who clock in via mobile, kiosk, or manual entry will appear here in real-time."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentlyIn.map((item) => (
              <div
                key={item.attendanceId}
                className="p-3.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center overflow-hidden border border-purple-500/20">
                    {item.profilePhotoUrl ? (
                      <img
                        src={item.profilePhotoUrl}
                        alt={item.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      item.fullName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)] text-sm">
                      {item.fullName}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      In since{' '}
                      {new Date(item.checkInAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    {item.currentDurationFormatted}
                  </div>
                  <Badge variant={item.status === 'late' ? 'warning' : 'success'}>
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceOverviewTab;
