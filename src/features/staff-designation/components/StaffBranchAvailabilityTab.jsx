import React, { useState } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import EmptyState from '../../../components/shared/EmptyState';
import BranchOverrideModal from './modals/BranchOverrideModal';
import { usePermission } from '../../../hooks/usePermission';
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Plus,
  HelpCircle,
  Filter,
} from 'lucide-react';

export default function StaffBranchAvailabilityTab({
  staffId,
  assignedBranches = [],
  matrix = [],
  onSetOverride,
  onRemoveOverride,
  loading = false,
  readOnly = false,
}) {
  const { can } = usePermission();

  const [selectedBranchId, setSelectedBranchId] = useState('ALL');
  const [modalContext, setModalContext] = useState(null); // { staffServiceId, serviceName, branch, currentAvailability }
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canCreateOverride = !readOnly && can('staff_service_branch.create');
  const canDeleteOverride = !readOnly && can('staff_service_branch.delete');

  const totalExceptions = matrix.reduce((acc, curr) => acc + (curr.exceptionsCount || 0), 0);

  const handleOpenModal = (staffServiceId, serviceName, branchAvail) => {
    setErrorMsg('');
    setModalContext({
      staffServiceId,
      serviceName,
      branch: {
        id: branchAvail.branchId,
        name: branchAvail.branchName,
        code: branchAvail.branchCode,
        isHomeBranch: branchAvail.isHomeBranch,
      },
      currentAvailability: branchAvail,
    });
  };

  const handleSaveOverride = async (payload) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onSetOverride(modalContext.staffServiceId, payload);
      setModalContext(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to update branch exception');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveOverride = async (staffServiceId, branchId) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onRemoveOverride(staffServiceId, branchId);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to restore default availability');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
              Branch-Wise Service Availability
            </h2>
            <Badge variant={totalExceptions > 0 ? 'warning' : 'primary'} size="xs">
              {totalExceptions} Exception{totalExceptions !== 1 ? 's' : ''}
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Exception-based availability rules. By default, services are available at all branches assigned to this employee.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Assigned Branches Banner */}
      <Card className="p-4.5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)] block">
              Assigned Workplace Branches ({assignedBranches.length})
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {assignedBranches.map((b) => (
                <div
                  key={b.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xs font-semibold border ${
                    b.isHomeBranch
                      ? 'bg-primary-500/10 text-primary-600 border-primary-500/20'
                      : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-color)]'
                  }`}
                >
                  <Building2 size={13} />
                  <span>{b.name}</span>
                  {b.isHomeBranch && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary-600">
                      (Home)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {assignedBranches.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Filter branch:</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
              >
                <option value="ALL">All Assigned Branches</option>
                {assignedBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.isHomeBranch ? '(Home)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Services and their branch availability */}
      {matrix.length > 0 ? (
        <div className="space-y-4">
          {matrix.map((row) => (
            <Card
              key={row.staffServiceId}
              className="p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs"
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)] mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                    {row.serviceName}
                  </h4>
                  {row.exceptionsCount > 0 ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/20">
                      {row.exceptionsCount} branch limitation
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                      Available across all assigned branches
                    </span>
                  )}
                </div>
              </div>

              {/* Branch list for this service */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {row.branchAvailability
                  .filter((b) => selectedBranchId === 'ALL' || b.branchId === selectedBranchId)
                  .map((b) => {
                    const isAvailable = b.isAvailable;
                    const isOverride = b.isOverride;

                    return (
                      <div
                        key={b.branchId}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isAvailable
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-rose-500/5 border-rose-500/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--text-primary)]">
                              <Building2 size={13} className="text-[var(--text-muted)]" />
                              <span>{b.branchName}</span>
                              {b.isHomeBranch && (
                                <span className="text-[9px] font-extrabold uppercase bg-primary-500/10 text-primary-600 px-1 py-0.2 rounded">
                                  Home
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 mt-2">
                              {isAvailable ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600">
                                  <CheckCircle2 size={13} />
                                  Available {isOverride ? '(Override)' : '(Inherited)'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600">
                                  <XCircle size={13} />
                                  Unavailable (Exception)
                                </span>
                              )}
                            </div>

                            {b.reason && (
                              <p className="text-[10px] text-[var(--text-muted)] mt-1 italic">
                                "{b.reason}"
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {isOverride ? (
                              canDeleteOverride && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOverride(row.staffServiceId, b.branchId)}
                                  disabled={actionLoading}
                                  className="text-[11px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-primary-500/10 transition-colors"
                                  title="Restore inherited default availability"
                                >
                                  <RotateCcw size={11} />
                                  Restore Default
                                </button>
                              )
                            ) : (
                              canCreateOverride && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenModal(row.staffServiceId, row.serviceName, b)}
                                  disabled={actionLoading}
                                  className="text-[11px] font-bold text-[var(--text-secondary)] hover:text-rose-600 py-1 px-2 rounded-lg hover:bg-[var(--bg-main)] transition-colors"
                                >
                                  Set Unavailable
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 border border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)]">
          <EmptyState
            icon={Building2}
            title="No Services to Configure"
            description="Assign services to this employee in the Services tab first before configuring branch availability exceptions."
          />
        </Card>
      )}

      {/* Override Modal */}
      {modalContext && (
        <BranchOverrideModal
          isOpen={true}
          onClose={() => setModalContext(null)}
          onSave={handleSaveOverride}
          serviceName={modalContext.serviceName}
          branch={modalContext.branch}
          currentAvailability={modalContext.currentAvailability}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
