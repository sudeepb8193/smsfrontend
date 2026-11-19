import React from 'react';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import Pagination from '../../../components/shared/Pagination';
import SearchInput from '../../../components/shared/SearchInput';
import {
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export const PendingCorrectionsTab = ({
  data,
  isLoading,
  searchQuery,
  onSearchChange,
  page,
  onPageChange,
  onReviewCorrection,
  canApprove,
}) => {
  const items = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const formatTime = (iso) => {
    if (!iso) return 'None';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-[var(--text-primary)] text-base">
            Pending Attendance Corrections ({total})
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Audit-controlled employee requests to fix missing or incorrect punches.
          </p>
        </div>

        <div className="w-64 max-w-xs">
          <SearchInput
            placeholder="Search employee name or code..."
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
      </div>

      {/* Corrections Queue Cards / Table */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader size="lg" text="Loading pending corrections..." />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No pending correction requests"
            description="All staff attendance correction submissions have been reviewed."
          />
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {items.map((corr) => (
              <div
                key={corr.id}
                className="p-4 sm:p-5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-10 h-10 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0 border border-purple-500/20 overflow-hidden">
                    {corr.staff?.profilePhotoUrl ? (
                      <img
                        src={corr.staff.profilePhotoUrl}
                        alt={corr.staff.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      corr.staff?.fullName?.slice(0, 2).toUpperCase()
                    )}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)] text-sm">
                        {corr.staff?.fullName}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        ({corr.staff?.employeeCode})
                      </span>
                      <Badge variant="warning">Pending Sign-Off</Badge>
                      <span className="text-xs text-[var(--text-muted)]">
                        Date: {new Date(corr.correctionDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                      <div className="text-[var(--text-secondary)]">
                        Original:{' '}
                        <span className="font-mono text-[var(--text-primary)] font-medium">
                          {formatTime(corr.attendance?.checkInAt)} — {formatTime(corr.attendance?.checkOutAt)}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-primary-500" />
                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        Proposed:{' '}
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {formatTime(corr.requestedCheckInAt)} — {formatTime(corr.requestedCheckOutAt)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-[var(--text-secondary)] pt-1 italic bg-[var(--bg-app)] p-2.5 rounded-lg border border-[var(--border-color)] max-w-xl">
                      "{corr.reason}"
                    </div>

                    {corr.supportingDocumentUrl && (
                      <a
                        href={corr.supportingDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-primary-600 dark:text-primary-400 hover:underline pt-1 font-medium"
                      >
                        <ExternalLink size={12} /> View Attached Evidence
                      </a>
                    )}
                  </div>
                </div>

                {canApprove && (
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onReviewCorrection(corr)}
                      icon={CheckCircle2}
                    >
                      Review & Decide
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-3 border-t border-[var(--border-color)] flex justify-between items-center text-xs text-[var(--text-secondary)] bg-[var(--bg-app)]">
            <span>Page {page} of {totalPages}</span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingCorrectionsTab;
