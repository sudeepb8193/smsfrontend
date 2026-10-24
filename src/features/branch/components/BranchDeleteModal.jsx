import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Loader2,
  Lock,
  Trash2,
  PauseCircle,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import Modal from '../../../components/shared/Modal';
import { fetchBranchBlockers, deleteBranch, updateBranch } from '../api/branchApi';
import { toast } from 'sonner';

export const BranchDeleteModal = ({
  isOpen,
  onClose,
  branch,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [blockersData, setBlockersData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && branch?.id) {
      loadBlockers();
    }
  }, [isOpen, branch?.id]);

  const loadBlockers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchBranchBlockers(branch.id);
      setBlockersData(res);
    } catch (err) {
      console.error('Failed to check branch blockers:', err);
      setError(err?.message || 'Failed to inspect branch dependencies');
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async () => {
    try {
      setActionLoading(true);
      await deleteBranch(branch.id);
      toast.success(`Branch "${branch.name}" was safely deleted.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete branch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setActionLoading(true);
      await updateBranch(branch.id, { status: newStatus });
      const statusLabel =
        newStatus === 'temporarily_closed' ? 'temporarily closed' : 'permanently closed';
      toast.success(`Branch "${branch.name}" status changed to ${statusLabel}.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to update branch status');
    } finally {
      setActionLoading(false);
    }
  };

  if (!branch) return null;

  const canDelete = blockersData?.canDelete ?? false;
  const blockers = blockersData?.blockers || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={canDelete ? 'Delete Branch' : 'Branch Deletion Protected'}
      size="md"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 text-[var(--text-muted)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-2" />
            <p className="text-sm">Verifying branch dependencies and active records...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
            {error}
          </div>
        ) : !canDelete ? (
          /* BLOCKED STATE: Explain why and offer closure */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <Lock className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  Deletion Blocked by Retention & Dependency Policy
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Branch <strong className="text-[var(--text-primary)]">{branch.name}</strong> ({branch.code}) contains active historical and operational records. To prevent orphan records and retain audit history, physical deletion is prohibited.
                </p>
              </div>
            </div>

            {/* Blockers list */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Active Dependent Records:
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Home / Assigned Staff</span>
                  <span className="font-bold text-amber-500">
                    {(blockers.homeStaffCount || 0) + (blockers.assignedStaffCount || 0)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Registered Clients</span>
                  <span className="font-bold text-blue-500">{blockers.customerCount || 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Branch Resources</span>
                  <span className="font-bold text-purple-500">{blockers.resourceCount || 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Package Purchases</span>
                  <span className="font-bold text-emerald-500">{blockers.packageCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Alternative Closure Actions */}
            <div className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-2">
              <h5 className="text-xs font-bold text-[var(--text-primary)]">
                Recommended Permitted Alternative:
              </h5>
              <p className="text-xs text-[var(--text-secondary)]">
                Close this location to immediately stop new appointments while preserving complete historical records and reporting.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  disabled={actionLoading || branch.status === 'temporarily_closed'}
                  onClick={() => handleStatusChange('temporarily_closed')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:text-white border border-orange-500/30 transition-all disabled:opacity-50"
                >
                  <PauseCircle size={15} />
                  <span>Temporarily Close</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading || branch.status === 'permanently_closed'}
                  onClick={() => handleStatusChange('permanently_closed')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/30 transition-all disabled:opacity-50"
                >
                  <XCircle size={15} />
                  <span>Permanently Close</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* UNBLOCKED STATE: Safe to soft-delete */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
              <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  Confirm Branch Deletion
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Are you sure you want to delete <strong className="text-[var(--text-primary)]">{branch.name}</strong> ({branch.code})? This branch has 0 dependent staff or appointments and will be soft-deleted.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-color)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSoftDelete}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-colors disabled:opacity-50"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                <Trash2 size={14} />
                <span>Confirm Soft Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        {!canDelete && (
          <div className="flex justify-end pt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-color)] transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BranchDeleteModal;
