/**
 * ============================================================================
 * ATOMIC SKELETON PRIMITIVES (Accessible, Reduced-Motion Safe, Theme-Aware)
 * ============================================================================
 */

/**
 * Base atomic Skeleton primitive.
 * Purely decorative; renders an aria-hidden placeholder box or circle.
 */
export const Skeleton = ({
  className = '',
  variant = 'rectangular', // 'text' | 'circular' | 'rounded' | 'rectangular'
  width,
  height,
  style = {},
  animate = true,
  ...props
}) => {
  const baseClasses = animate ? 'animate-pulse motion-reduce:animate-none' : '';
  const bgClasses = 'bg-slate-200/80 dark:bg-slate-800/70 border border-transparent';

  const variantClasses = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full shrink-0',
    rounded: 'rounded-2xl',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`${baseClasses} ${bgClasses} ${variantClasses[variant] || variantClasses.rectangular} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

/**
 * SkeletonAvatar: Circular avatar placeholder with standard size tokens.
 */
export const SkeletonAvatar = ({ size = 'md', className = '', ...props }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <Skeleton
      variant="circular"
      className={`${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    />
  );
};

/**
 * SkeletonButton: Standard action button placeholder.
 */
export const SkeletonButton = ({ size = 'md', className = '', ...props }) => {
  const sizeClasses = {
    sm: 'w-20 h-8 rounded-lg',
    md: 'w-28 h-10 rounded-xl',
    lg: 'w-36 h-12 rounded-xl',
  };

  return (
    <Skeleton
      variant="rectangular"
      className={`${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    />
  );
};

/**
 * SkeletonText: Multiple lines of text with realistic varying widths.
 */
export const SkeletonText = ({
  lines = 3,
  className = '',
  gap = 'gap-2.5',
  lastLineWidth = '60%',
  lineHeight = 'h-3.5',
}) => {
  return (
    <div className={`w-full flex flex-col ${gap} ${className}`} aria-hidden="true">
      {[...Array(lines)].map((_, idx) => {
        const isLast = idx === lines - 1;
        const width = isLast ? lastLineWidth : idx % 2 === 0 ? '100%' : '85%';
        return (
          <Skeleton
            key={idx}
            variant="text"
            className={lineHeight}
            style={{ width }}
          />
        );
      })}
    </div>
  );
};

/**
 * SkeletonPageHeader: Pixel-accurate match for `src/components/layout/PageHeader`.
 */
export const SkeletonPageHeader = ({ hasAction = true, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 mb-6 ${className}`} aria-hidden="true">
      <div className="space-y-2">
        <Skeleton variant="text" className="w-56 h-8" />
        <Skeleton variant="text" className="w-80 h-4" />
      </div>
      {hasAction && (
        <div className="flex items-center gap-3">
          <SkeletonButton size="md" />
        </div>
      )}
    </div>
  );
};

/**
 * SkeletonStatCard: Single KPI metric card.
 */
export const SkeletonStatCard = ({ className = '' }) => {
  return (
    <div
      className={`rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 flex items-center justify-between shadow-xs ${className}`}
      aria-hidden="true"
    >
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" className="w-24 h-3.5" />
        <Skeleton variant="text" className="w-20 h-7" />
        <Skeleton variant="text" className="w-28 h-3" />
      </div>
      <Skeleton variant="rounded" className="w-12 h-12 shrink-0" />
    </div>
  );
};

/**
 * SkeletonTableRow: Individual table row placeholder.
 */
export const SkeletonTableRow = ({ columns = 5, rowIndex = 0, className = '' }) => {
  return (
    <tr className={`animate-pulse motion-reduce:animate-none ${className}`} aria-hidden="true">
      {[...Array(columns)].map((_, colIdx) => (
        <td key={colIdx} className="p-4 align-middle">
          <div className="flex items-center gap-2.5">
            {colIdx === 0 && <SkeletonAvatar size="sm" />}
            <Skeleton
              variant="text"
              className="h-3.5"
              style={{
                width:
                  colIdx === 0
                    ? '65%'
                    : colIdx === columns - 1
                      ? '40%'
                      : `${45 + ((rowIndex * 13 + colIdx * 27) % 40)}%`,
              }}
            />
          </div>
        </td>
      ))}
    </tr>
  );
};

/**
 * ============================================================================
 * COMPOSED SKELETON LAYOUTS
 * ============================================================================
 */

/**
 * SkeletonCard: Structured card skeleton.
 */
export const SkeletonCard = ({
  className = '',
  hasHeader = true,
  lines = 3,
}) => {
  return (
    <div
      className={`rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-4 shadow-xs ${className}`}
      aria-hidden="true"
    >
      {hasHeader && (
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="md" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" className="w-2/5 h-4" />
            <Skeleton variant="text" className="w-1/4 h-3" />
          </div>
          <Skeleton variant="rectangular" className="w-16 h-6 rounded-full" />
        </div>
      )}

      <div className="space-y-2 pt-1">
        <SkeletonText lines={lines} />
      </div>

      <div className="pt-3 border-t border-[var(--border-color)]/60 flex items-center justify-between">
        <Skeleton variant="text" className="w-24 h-3" />
        <Skeleton variant="rectangular" className="w-20 h-7 rounded-lg" />
      </div>
    </div>
  );
};

/**
 * SkeletonGrid: Responsive grid of card skeletons.
 */
export const SkeletonGrid = ({
  count = 6,
  cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  className = '',
}) => {
  return (
    <div className={`grid ${cols} gap-4 ${className}`} role="status">
      <span className="sr-only">Loading card records...</span>
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

/**
 * SkeletonTable: Full table skeleton matching SMS DataTable design.
 * Defaults to 10 rows per pagination standards.
 */
export const SkeletonTable = ({
  rows = 10,
  columns = 5,
  className = '',
  showHeader = true,
}) => {
  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs ${className}`}
      role="status"
    >
      <span className="sr-only">Loading data table...</span>
      <table className="w-full text-left border-collapse">
        {showHeader && (
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)]">
              {[...Array(columns)].map((_, i) => (
                <th key={i} className="p-4" aria-hidden="true">
                  <Skeleton
                    variant="text"
                    className="h-3"
                    style={{
                      width: i === 0 ? '50%' : i === columns - 1 ? '35%' : `${40 + ((i * 19) % 30)}%`,
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-[var(--border-color)]">
          {[...Array(rows)].map((_, rowIdx) => (
            <SkeletonTableRow key={rowIdx} columns={columns} rowIndex={rowIdx} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * SkeletonForm: Form layout placeholder for create/edit pages and settings modals.
 */
export const SkeletonForm = ({
  fields = 6,
  columns = 2,
  className = '',
}) => {
  const colClass = columns === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div
      className={`rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-6 shadow-xs ${className}`}
      role="status"
    >
      <span className="sr-only">Loading form...</span>
      <div className="space-y-2 border-b border-[var(--border-color)] pb-4">
        <Skeleton variant="text" className="w-1/3 h-5" />
        <Skeleton variant="text" className="w-1/2 h-3.5" />
      </div>

      <div className={`grid ${colClass} gap-5`}>
        {[...Array(fields)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" className="w-24 h-3" />
            <Skeleton variant="rectangular" className="w-full h-11 rounded-xl" />
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-[var(--border-color)] flex justify-end gap-3">
        <SkeletonButton size="md" />
        <SkeletonButton size="md" className="w-32" />
      </div>
    </div>
  );
};

/**
 * SkeletonProfile: Detailed profile or view page skeleton (Header banner + stats + 2-column detail tabs).
 */
export const SkeletonProfile = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`} role="status">
      <span className="sr-only">Loading profile...</span>
      {/* Header Banner */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SkeletonAvatar size="xl" />
            <div className="space-y-2">
              <Skeleton variant="text" className="w-48 h-6" />
              <Skeleton variant="text" className="w-32 h-4" />
              <div className="flex gap-2 pt-1">
                <Skeleton variant="rectangular" className="w-20 h-5 rounded-full" />
                <Skeleton variant="rectangular" className="w-24 h-5 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <SkeletonButton size="md" />
            <SkeletonButton size="md" />
          </div>
        </div>
      </div>

      {/* 2-Column Details Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-4">
          <Skeleton variant="text" className="w-1/2 h-4 mb-2" />
          <SkeletonText lines={4} />
          <div className="pt-4 border-t border-[var(--border-color)] space-y-2">
            <Skeleton variant="text" className="w-3/4 h-3.5" />
            <Skeleton variant="text" className="w-2/3 h-3.5" />
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-4">
          <div className="flex gap-3 border-b border-[var(--border-color)] pb-3">
            <Skeleton variant="rectangular" className="w-24 h-8 rounded-lg" />
            <Skeleton variant="rectangular" className="w-24 h-8 rounded-lg" />
            <Skeleton variant="rectangular" className="w-24 h-8 rounded-lg" />
          </div>
          <SkeletonTable rows={4} columns={3} showHeader={false} />
        </div>
      </div>
    </div>
  );
};

/**
 * SkeletonStats: Stat / KPI metric cards row.
 */
export const SkeletonStats = ({
  count = 4,
  cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  className = '',
}) => {
  return (
    <div className={`grid ${cols} gap-4 ${className}`} role="status">
      <span className="sr-only">Loading metrics...</span>
      {[...Array(count)].map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
};

/**
 * SkeletonList: Vertical list item skeleton.
 */
export const SkeletonList = ({
  count = 6,
  className = '',
}) => {
  return (
    <div
      className={`divide-y divide-[var(--border-color)] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden ${className}`}
      role="status"
    >
      <span className="sr-only">Loading list items...</span>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4" aria-hidden="true">
          <div className="flex items-center gap-3 flex-1">
            <SkeletonAvatar size="sm" />
            <div className="space-y-1.5 flex-1">
              <Skeleton variant="text" className="w-1/3 h-4" />
              <Skeleton variant="text" className="w-1/4 h-3" />
            </div>
          </div>
          <Skeleton variant="rectangular" className="w-16 h-6 rounded-full" />
        </div>
      ))}
    </div>
  );
};

/**
 * SkeletonDashboard: Pixel-accurate skeleton for `src/pages/Dashboard.jsx`.
 */
export const SkeletonDashboard = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`} role="status">
      <span className="sr-only">Loading dashboard workspace...</span>
      {/* Page Header */}
      <SkeletonPageHeader hasAction={true} />

      {/* Operational Channels Banner */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Skeleton variant="rounded" className="w-12 h-12 shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton variant="text" className="w-40 h-5" />
                <Skeleton variant="rectangular" className="w-32 h-5 rounded-full" />
              </div>
              <Skeleton variant="text" className="w-96 max-w-full h-3.5" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton variant="rectangular" className="w-32 h-8 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <SkeletonStats count={4} />

      {/* Filter Row Placeholder */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" className="w-44 h-10 rounded-xl" />
          <Skeleton variant="rectangular" className="w-36 h-10 rounded-xl" />
        </div>
        <Skeleton variant="rectangular" className="w-28 h-10 rounded-xl" />
      </div>

      {/* Recent Appointments Table */}
      <SkeletonTable rows={5} columns={6} />
    </div>
  );
};

/**
 * SkeletonPage: Full page application shell skeleton (Sidebar + Topbar + Page content).
 */
export const SkeletonPage = ({
  text = 'Loading application workspace...',
  className = '',
}) => {
  return (
    <div className={`min-h-screen w-full bg-[var(--bg-app)] flex overflow-hidden ${className}`} role="status">
      <span className="sr-only">{text}</span>
      {/* Sidebar preview */}
      <aside className="hidden md:flex w-64 border-r border-[var(--border-color)] bg-[var(--bg-card)]/50 p-5 flex-col justify-between shrink-0" aria-hidden="true">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton variant="rounded" className="w-9 h-9" />
            <Skeleton variant="text" className="w-28 h-5" />
          </div>
          <div className="space-y-3 pt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <SkeletonAvatar size="xs" />
                <Skeleton variant="text" className="w-24 h-3.5" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-color)]">
          <SkeletonAvatar size="sm" />
          <div className="space-y-1 flex-1">
            <Skeleton variant="text" className="w-20 h-3.5" />
            <Skeleton variant="text" className="w-14 h-2.5" />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar preview */}
        <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-card)]/50 px-6 flex items-center justify-between shrink-0" aria-hidden="true">
          <Skeleton variant="text" className="w-36 h-5" />
          <div className="flex items-center gap-3">
            <Skeleton variant="rectangular" className="w-48 h-9 rounded-xl hidden sm:block" />
            <SkeletonAvatar size="sm" />
            <SkeletonAvatar size="sm" />
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-w-7xl w-full mx-auto" aria-hidden="true">
          {text && (
            <div className="flex items-center gap-2.5 p-3 px-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-500 w-fit animate-pulse motion-reduce:animate-none">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping motion-reduce:animate-none" />
              <span>{text}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton variant="text" className="w-48 h-7" />
              <Skeleton variant="text" className="w-72 h-3.5" />
            </div>
            <SkeletonButton size="md" />
          </div>

          <SkeletonStats count={4} />
          <SkeletonTable rows={10} columns={5} />
        </main>
      </div>
    </div>
  );
};

// Sub-component attachments for namespaced usage: <Skeleton.Table />, <Skeleton.Card />, etc.
Skeleton.Text = SkeletonText;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Button = SkeletonButton;
Skeleton.Card = SkeletonCard;
Skeleton.StatCard = SkeletonStatCard;
Skeleton.PageHeader = SkeletonPageHeader;
Skeleton.Grid = SkeletonGrid;
Skeleton.Table = SkeletonTable;
Skeleton.TableRow = SkeletonTableRow;
Skeleton.Form = SkeletonForm;
Skeleton.Profile = SkeletonProfile;
Skeleton.Detail = SkeletonProfile;
Skeleton.Stats = SkeletonStats;
Skeleton.List = SkeletonList;
Skeleton.Page = SkeletonPage;
Skeleton.Dashboard = SkeletonDashboard;

export default Skeleton;
