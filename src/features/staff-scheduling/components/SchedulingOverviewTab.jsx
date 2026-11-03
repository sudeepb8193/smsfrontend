import React from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import {
  Users,
  CalendarCheck,
  Clock,
  Coffee,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  Copy,
  Plus,
  ArrowRight,
  TrendingUp,
  Building2,
  CalendarDays,
  Palmtree,
  MoreVertical,
} from 'lucide-react';

export default function SchedulingOverviewTab({
  overview,
  branches = [],
  loading = false,
  onNavigateTab,
  onOpenOverrideModal,
  onOpenBlockModal,
  onOpenCopyModal,
}) {
  if (loading && !overview) {
    return (
      <div className="py-16 flex justify-center">
        <Loader size="lg" message="Loading staff scheduling overview..." />
      </div>
    );
  }

  // 100% Dynamic KPIs from backend
  const kpis = overview?.kpis || {
    totalActiveStaff: 0,
    scheduledToday: 0,
    currentlyWorking: 0,
    onDayOffToday: 0,
    overridesTodayCount: 0,
    blockedTimeTodayCount: 0,
    upcomingChangesCount: 0,
  };

  // 100% Dynamic Branch Coverage from backend overview
  const colors = ['bg-primary-500', 'bg-cyan-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];
  const branchCoverageList = (overview?.branchCoverage || []).map((b, idx) => ({
    id: b.branchId,
    name: b.branchName,
    code: b.branchCode,
    totalStaff: b.totalStaff,
    percent: b.coveragePercent ?? (b.totalStaff > 0 && kpis.totalActiveStaff > 0 ? Math.round((b.totalStaff / kpis.totalActiveStaff) * 100) : 0),
    color: colors[idx % colors.length],
  }));

  // 100% Dynamic 7-Day Trend from backend overview
  const trendData = overview?.availabilityTrend || [
    { day: 'Mon', working: 0, onLeave: 0 },
    { day: 'Tue', working: 0, onLeave: 0 },
    { day: 'Wed', working: 0, onLeave: 0 },
    { day: 'Thu', working: 0, onLeave: 0 },
    { day: 'Fri', working: 0, onLeave: 0 },
    { day: 'Sat', working: 0, onLeave: 0 },
    { day: 'Sun', working: 0, onLeave: 0 },
  ];

  const maxCapacity = Math.max(kpis.totalActiveStaff, 1);
  const hasStaff = kpis.totalActiveStaff > 0;

  // Calculate SVG points dynamically
  const trendPoints = trendData.map((td, i) => {
    const x = 50 + i * 70;
    // Map working staff (0 to maxCapacity) to SVG Y coordinates (130 at 0, 20 at maxCapacity)
    const ratio = Math.min(1, Math.max(0, td.working / maxCapacity));
    const y = 130 - ratio * 110;
    return { x, y, day: td.day, working: td.working, onLeave: td.onLeave };
  });

  const pathD = trendPoints.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = trendPoints[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${trendPoints[trendPoints.length - 1].x},130 L ${trendPoints[0].x},130 Z`;

  // 100% Dynamic upcoming changes from backend
  const upcomingChangesList = overview?.recentOverrides || [];

  return (
    <div className="space-y-4">
      {/* 1. TOP KPI STRIP (3 in a Row on Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3.5">
        {/* Total Staff */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total Staff</div>
            <div className="text-2xl font-black text-[var(--text-primary)] leading-tight">{kpis.totalActiveStaff}</div>
          </div>
        </div>

        {/* Scheduled Today */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CalendarCheck size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Scheduled Today</div>
            <div className="text-2xl font-black text-[var(--text-primary)] leading-tight">{kpis.scheduledToday}</div>
          </div>
        </div>

        {/* Currently Working */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Currently Working</div>
            <div className="text-2xl font-black text-[var(--text-primary)] leading-tight">{kpis.currentlyWorking}</div>
          </div>
        </div>

        {/* On Day Off */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Palmtree size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">On Day Off</div>
            <div className="text-2xl font-black text-[var(--text-primary)] leading-tight">{kpis.onDayOffToday}</div>
          </div>
        </div>

        {/* Overrides */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Overrides</div>
            <div className="text-2xl font-black text-[var(--text-primary)] leading-tight">{kpis.overridesTodayCount}</div>
          </div>
        </div>

        {/* Blocked Time */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Blocked Time</div>
            <div className="text-2xl font-black text-[var(--text-primary)] leading-tight">{kpis.blockedTimeTodayCount}</div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION (Branch Coverage & Staff Availability Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Branch Coverage */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Branch Coverage</h2>
            <button
              type="button"
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {branchCoverageList.length > 0 ? (
            <div className="space-y-4 my-auto">
              {branchCoverageList.map((branch) => (
                <div key={branch.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">{branch.name}</span>
                    <span className="font-bold text-[var(--text-primary)] font-mono">{branch.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-input)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${branch.color}`}
                      style={{ width: `${Math.max(4, Math.min(100, branch.percent))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No branch coverage data available for the selected view.
            </div>
          )}

          <div className="pt-4 mt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Active Branches</span>
            <span className="font-bold text-primary-500">{branchCoverageList.length} Registered</span>
          </div>
        </div>

        {/* Staff Availability Trend */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Staff Availability Trend</h2>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                <span className="text-[var(--text-secondary)]">Working</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-[var(--text-secondary)]">On Leave</span>
              </div>
            </div>
          </div>

          {hasStaff ? (
            <div className="relative w-full h-44 my-auto">
              <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary-500, #8b5cf6)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--primary-500, #8b5cf6)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[120, 90, 60, 30, 0].map((yVal, i) => (
                  <g key={i}>
                    <line
                      x1="30"
                      y1={yVal + 10}
                      x2="490"
                      y2={yVal + 10}
                      stroke="var(--border-color)"
                      strokeDasharray="3 3"
                      strokeWidth="0.8"
                      opacity="0.6"
                    />
                    <text
                      x="20"
                      y={yVal + 14}
                      fontSize="9"
                      fill="var(--text-muted)"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {Math.round((maxCapacity / 4) * (4 - i))}
                    </text>
                  </g>
                ))}

                {/* Trend Smooth Spline Area */}
                {pathD && (
                  <>
                    <path d={areaD} fill="url(#primaryAreaGrad)" />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="var(--primary-500, #8b5cf6)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {/* Data points */}
                {trendPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    className="fill-[var(--bg-card)] stroke-primary-500 stroke-2"
                  />
                ))}

                {/* X Axis Day Labels */}
                {trendPoints.map((pt) => (
                  <text
                    key={pt.day}
                    x={pt.x}
                    y="145"
                    fontSize="10"
                    fill="var(--text-secondary)"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {pt.day}
                  </text>
                ))}
              </svg>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-xs text-[var(--text-muted)]">
              <Clock size={20} className="mb-1.5 opacity-40" />
              <span>No staff availability trend recorded yet.</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM SECTION (Upcoming Changes & Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Changes */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Upcoming Changes</h2>
            <button
              type="button"
              onClick={() => onNavigateTab('overrides')}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {upcomingChangesList.length > 0 ? (
            <div className="space-y-2.5">
              {upcomingChangesList.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[var(--bg-input)]/60 border border-[var(--border-color)]/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
                      <CalendarDays size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">
                        {item.staffName || item.staff?.fullName} – {item.type?.replace('_', ' ') || 'Shift Change'}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">
                        {item.date || item.overrideDate || 'Today'} · {item.startTime && item.endTime ? `${item.startTime} – ${item.endTime}` : item.reason || 'Exception'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[var(--text-muted)]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No upcoming schedule exceptions or shift changes recorded.
            </div>
          )}
        </div>

        {/* Quick Actions (2x2 Grid) */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-xs font-black text-primary-500">⚡</span>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 my-auto">
            {/* Add Override */}
            <button
              type="button"
              onClick={() => {
                if (onOpenOverrideModal) onOpenOverrideModal();
                else onNavigateTab('overrides');
              }}
              className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-primary-500/10 hover:border-primary-500/30 text-left transition-all duration-200 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-500/15 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Plus size={16} />
              </div>
              <div className="font-bold text-xs text-[var(--text-primary)]">Add Override</div>
              <div className="text-[10px] text-[var(--text-muted)]">One-off shifts</div>
            </button>

            {/* Block Time */}
            <button
              type="button"
              onClick={() => {
                if (onOpenBlockModal) onOpenBlockModal();
                else onNavigateTab('blocked');
              }}
              className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-rose-500/10 hover:border-rose-500/30 text-left transition-all duration-200 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <ShieldAlert size={16} />
              </div>
              <div className="font-bold text-xs text-[var(--text-primary)]">Block Time</div>
              <div className="text-[10px] text-[var(--text-muted)]">Meetings & training</div>
            </button>

            {/* Copy Schedule */}
            <button
              type="button"
              onClick={() => {
                if (onOpenCopyModal) onOpenCopyModal();
                else onNavigateTab('weekly');
              }}
              className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-emerald-500/10 hover:border-emerald-500/30 text-left transition-all duration-200 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Copy size={16} />
              </div>
              <div className="font-bold text-xs text-[var(--text-primary)]">Copy Schedule</div>
              <div className="text-[10px] text-[var(--text-muted)]">Duplicate week</div>
            </button>

            {/* View Calendar */}
            <button
              type="button"
              onClick={() => onNavigateTab('weekly')}
              className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-blue-500/10 hover:border-blue-500/30 text-left transition-all duration-200 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Calendar size={16} />
              </div>
              <div className="font-bold text-xs text-[var(--text-primary)]">View Calendar</div>
              <div className="text-[10px] text-[var(--text-muted)]">Weekly roster</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
