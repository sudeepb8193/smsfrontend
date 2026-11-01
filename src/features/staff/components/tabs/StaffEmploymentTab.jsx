import React, { useState } from 'react';
import Card from '../../../../components/shared/Card';
import Button from '../../../../components/shared/Button';
import Badge from '../../../../components/shared/Badge';
import { usePermission } from '../../../../hooks/usePermission';
import { RecordEmploymentChangeModal } from '../modals/RecordEmploymentChangeModal';
import {
  Briefcase,
  Calendar,
  Clock,
  TrendingUp,
  User,
  Plus,
  CheckCircle,
} from 'lucide-react';

export function StaffEmploymentTab({
  staff,
  history = [],
  onRecordChange,
  loading,
}) {
  const { can } = usePermission();
  const branchId = staff?.homeBranchId;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const current = staff?.currentEmployment || history[0] || {};
  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Current Position Highlights */}
      <Card>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Current Employment Status
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Active title and operational position within the salon hierarchy.
            </p>
          </div>
          {(can('staff_employment.create', branchId) ||
            can('staff_employment.manage', branchId)) && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={14} className="mr-1.5" />
              Record a Change
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
            <span className="text-xs text-[var(--text-muted)] block mb-1">Designation</span>
            <p className="text-base font-bold text-[var(--text-primary)]">
              {current.designation || 'Staff Member'}
            </p>
            <Badge variant="primary" size="xs" className="mt-2">
              Current Title
            </Badge>
          </div>

          <div className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
            <span className="text-xs text-[var(--text-muted)] block mb-1">Department</span>
            <p className="text-base font-bold text-[var(--text-primary)]">
              {current.department || 'Operations'}
            </p>
            <span className="text-xs text-[var(--text-muted)] block mt-2">Functional unit</span>
          </div>

          <div className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
            <span className="text-xs text-[var(--text-muted)] block mb-1">Employment Type</span>
            <p className="text-base font-bold text-[var(--text-primary)] capitalize">
              {(current.employmentType || 'full_time').replace('_', ' ')}
            </p>
            <span className="text-xs text-[var(--text-muted)] block mt-2">Contractual basis</span>
          </div>

          <div className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)]">
            <span className="text-xs text-[var(--text-muted)] block mb-1">Joining Date</span>
            <p className="text-base font-bold text-[var(--text-primary)]">
              {current.joiningDate
                ? new Date(current.joiningDate).toLocaleDateString()
                : new Date(staff.createdAt).toLocaleDateString()}
            </p>
            {current.confirmationDate && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 block mt-2">
                Confirmed: {new Date(current.confirmationDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Employment History Timeline */}
      <Card>
        <div className="mb-6 pb-4 border-b border-[var(--border-color)]">
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Employment History & Promotion Timeline
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Immutable historical audit record of all role changes, promotions, and department transfers.
          </p>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4">No historical records available.</p>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {history.map((item, idx) => {
              const effectiveDate = new Date(item.effectiveFrom);
              const isFuture = effectiveDate > now;
              const isCurrent = idx === 0 && !isFuture;

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline bullet */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isCurrent
                        ? 'bg-primary-500 border-white dark:border-slate-900 text-white shadow-sm'
                        : isFuture
                        ? 'bg-amber-500 border-white dark:border-slate-900 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-400 text-[var(--text-muted)]'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>

                  <div className="p-4 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl border border-[var(--border-color)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-[var(--text-primary)] text-sm">
                          {item.designation}
                        </h4>
                        <span className="text-xs text-[var(--text-muted)]">in</span>
                        <span className="text-xs font-semibold text-[var(--text-secondary)]">
                          {item.department}
                        </span>
                        {isCurrent && <Badge variant="primary" size="xs">Active</Badge>}
                        {isFuture && <Badge variant="warning" size="xs">Future Effective</Badge>}
                      </div>
                      <Badge variant="neutral" size="xs" className="capitalize self-start sm:self-auto">
                        {(item.changeReason || 'promotion').replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[var(--text-muted)] pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                      <div>
                        <span>Effective From:</span>{' '}
                        <strong className="text-[var(--text-secondary)]">
                          {new Date(item.effectiveFrom).toLocaleDateString()}
                        </strong>
                      </div>
                      <div>
                        <span>Type:</span>{' '}
                        <span className="capitalize text-[var(--text-secondary)]">
                          {(item.employmentType || '').replace('_', ' ')}
                        </span>
                      </div>
                      {item.recordedBy && (
                        <div className="col-span-2 text-right">
                          <span>Recorded by:</span>{' '}
                          <span className="text-[var(--text-secondary)] font-medium">
                            {item.recordedBy.displayName || item.recordedBy.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Record a Change Modal */}
      <RecordEmploymentChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staff={staff}
        loading={loading}
        onRecord={async (data) => {
          await onRecordChange(data);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}

export default StaffEmploymentTab;
