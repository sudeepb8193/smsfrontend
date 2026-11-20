import Spinner from './Spinner';
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonPageHeader,
  SkeletonGrid,
  SkeletonTable,
  SkeletonTableRow,
  SkeletonForm,
  SkeletonProfile,
  SkeletonStats,
  SkeletonList,
  SkeletonPage,
  SkeletonDashboard,
} from './Skeleton';

/**
 * Universal Shared Loader for Salon Management System (SMS)
 * Production-Level Skeleton Loading System.
 */
export const Loader = ({
  text,
  message,
  fullPage = false,
  size = 'large',
  type = 'skeleton', // 'skeleton' | 'table' | 'grid' | 'card' | 'form' | 'detail' | 'profile' | 'stats' | 'list' | 'page' | 'dashboard' | 'spinner'
  count,
  rows,
  columns,
  className = '',
  ...props
}) => {
  const label = text || message;

  // 1. Full Page / Workspace Boot Skeleton
  if (fullPage || type === 'page') {
    return <SkeletonPage text={label || 'Loading application workspace...'} className={className} {...props} />;
  }

  // 2. Dashboard Skeleton
  if (type === 'dashboard') {
    return <SkeletonDashboard className={className} {...props} />;
  }

  // 3. Table Data Skeleton (Defaults to 10 rows per pagination standards)
  if (type === 'table') {
    return (
      <div className={`w-full py-2 ${className}`}>
        {label && (
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[var(--text-muted)] animate-pulse motion-reduce:animate-none">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping motion-reduce:animate-none" />
            <span>{label}</span>
          </div>
        )}
        <SkeletonTable rows={rows || 10} columns={columns || 5} {...props} />
      </div>
    );
  }

  // 4. Grid of Cards Skeleton
  if (type === 'grid' || type === 'cards') {
    return (
      <div className={`w-full py-2 ${className}`}>
        {label && (
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[var(--text-muted)] animate-pulse motion-reduce:animate-none">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping motion-reduce:animate-none" />
            <span>{label}</span>
          </div>
        )}
        <SkeletonGrid count={count || 6} {...props} />
      </div>
    );
  }

  // 5. Single Card Skeleton
  if (type === 'card') {
    return (
      <div className={`w-full py-2 ${className}`}>
        {label && (
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[var(--text-muted)] animate-pulse motion-reduce:animate-none">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping motion-reduce:animate-none" />
            <span>{label}</span>
          </div>
        )}
        <SkeletonCard lines={rows || 3} {...props} />
      </div>
    );
  }

  // 6. Form Skeleton
  if (type === 'form') {
    return (
      <div className={`w-full py-2 ${className}`}>
        {label && (
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[var(--text-muted)] animate-pulse motion-reduce:animate-none">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping motion-reduce:animate-none" />
            <span>{label}</span>
          </div>
        )}
        <SkeletonForm fields={rows || count || 6} {...props} />
      </div>
    );
  }

  // 7. Detail / Profile Skeleton
  if (type === 'detail' || type === 'profile') {
    return (
      <div className={`w-full py-2 ${className}`}>
        {label && (
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[var(--text-muted)] animate-pulse motion-reduce:animate-none">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping motion-reduce:animate-none" />
            <span>{label}</span>
          </div>
        )}
        <SkeletonProfile {...props} />
      </div>
    );
  }

  // 8. Stat / Metric Cards Skeleton
  if (type === 'stats' || type === 'metrics') {
    return (
      <div className={`w-full py-2 ${className}`}>
        {label && (
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[var(--text-muted)] animate-pulse motion-reduce:animate-none">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping motion-reduce:animate-none" />
            <span>{label}</span>
          </div>
        )}
        <SkeletonStats count={count || 4} {...props} />
      </div>
    );
  }

  // 9. Vertical List Skeleton
  if (type === 'list') {
    return (
      <div className={`w-full py-2 ${className}`}>
        {label && (
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[var(--text-muted)] animate-pulse motion-reduce:animate-none">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping motion-reduce:animate-none" />
            <span>{label}</span>
          </div>
        )}
        <SkeletonList count={count || rows || 6} {...props} />
      </div>
    );
  }

  // 10. Legacy / Explicit Spinner (Available when explicitly requested)
  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center p-8 w-full ${className}`} role="status">
        <span className="sr-only">Loading...</span>
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <Spinner size={size} color="var(--primary, #F97316)" />
          {label && <p className="text-xs font-semibold text-[var(--text-secondary,#9E9EA7)]">{label}</p>}
        </div>
      </div>
    );
  }

  // 11. Default General Skeleton (Versatile animated card structure reflecting actual content layout)
  return (
    <div className={`w-full py-2 ${className}`} role="status">
      <span className="sr-only">{label || 'Loading...'}</span>
      {label && (
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[var(--text-muted)] animate-pulse motion-reduce:animate-none">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping motion-reduce:animate-none" />
          <span>{label}</span>
        </div>
      )}
      <SkeletonCard lines={rows || 3} {...props} />
    </div>
  );
};

// Sub-component attachments on Loader
Loader.Skeleton = Skeleton;
Loader.Text = SkeletonText;
Loader.Avatar = SkeletonAvatar;
Loader.Button = SkeletonButton;
Loader.Card = SkeletonCard;
Loader.StatCard = SkeletonStatCard;
Loader.PageHeader = SkeletonPageHeader;
Loader.Grid = SkeletonGrid;
Loader.Table = SkeletonTable;
Loader.TableRow = SkeletonTableRow;
Loader.Form = SkeletonForm;
Loader.Profile = SkeletonProfile;
Loader.Detail = SkeletonProfile;
Loader.Stats = SkeletonStats;
Loader.List = SkeletonList;
Loader.Page = SkeletonPage;
Loader.Dashboard = SkeletonDashboard;

// Export all companion skeleton modules
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonPageHeader,
  SkeletonGrid,
  SkeletonTable,
  SkeletonTableRow,
  SkeletonForm,
  SkeletonProfile,
  SkeletonStats,
  SkeletonList,
  SkeletonPage,
  SkeletonDashboard,
};

export default Loader;
