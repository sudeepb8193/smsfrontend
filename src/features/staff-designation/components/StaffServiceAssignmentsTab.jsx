import React, { useState, useMemo } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import EmptyState from '../../../components/shared/EmptyState';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import AssignServicesModal from './modals/AssignServicesModal';
import DurationOverrideModal from './modals/DurationOverrideModal';
import { usePermission } from '../../../hooks/usePermission';
import {
  Scissors,
  Clock,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Tag,
  CheckCircle2,
  XCircle,
  Building2,
} from 'lucide-react';

export default function StaffServiceAssignmentsTab({
  staffId,
  assignments = [],
  availableCatalog = [],
  onAssignBulk,
  onUpdateAssignment,
  onUnassign,
  onNavigateToBranchAvailability,
  loading = false,
  readOnly = false,
}) {
  const { can } = usePermission();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingDurationAssignment, setEditingDurationAssignment] = useState(null);
  const [unassigningAssignment, setUnassigningAssignment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canAssign = !readOnly && can('staff_service.create');
  const canManage = !readOnly && can('staff_service.manage');
  const canUpdate = !readOnly && can('staff_service.update');
  const canDelete = !readOnly && can('staff_service.delete');

  // Group assigned services by category
  const categories = useMemo(() => {
    const set = new Set();
    assignments.forEach((a) => {
      if (a.categoryName) set.add(a.categoryName);
    });
    return Array.from(set).sort();
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchSearch =
        !searchTerm ||
        a.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat =
        selectedCategory === 'ALL' || a.categoryName === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [assignments, searchTerm, selectedCategory]);

  // Suggested services from catalog that are not yet assigned
  const suggestedUnassigned = useMemo(() => {
    return availableCatalog.filter((s) => s.isSuggested && !s.isAssigned);
  }, [availableCatalog]);

  const handleBulkAssign = async (data) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onAssignBulk(data);
      setIsAssignModalOpen(false);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to assign services');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveDuration = async (data) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onUpdateAssignment(editingDurationAssignment.id, data);
      setEditingDurationAssignment(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to update duration override');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (assignment) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onUpdateAssignment(assignment.id, { isActive: !assignment.isActive });
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to toggle service status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmUnassign = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onUnassign(unassigningAssignment.id);
      setUnassigningAssignment(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to unassign service');
    } finally {
      setActionLoading(false);
    }
  };

  const activeCount = assignments.filter((a) => a.isActive).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
              Authorized Service Assignments
            </h2>
            <Badge variant="primary" size="xs">
              {activeCount} Active / {assignments.length} Assigned
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Bookable service catalog items authorized for this employee, along with customized duration overrides.
          </p>
        </div>
        {canAssign && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
            disabled={loading || actionLoading}
          >
            <Plus size={16} className="mr-1.5" />
            Assign Services
          </Button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Suggested Services Banner */}
      {suggestedUnassigned.length > 0 && canAssign && (
        <Card className="p-4 border-2 border-dashed border-amber-500/30 bg-amber-500/5 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[var(--text-primary)]">
                  {suggestedUnassigned.length} Suggested Services Based on Employee Credentials
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Suggested from active Stylist designations and verified techniques. Review and confirm before assigning.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsAssignModalOpen(true)}
              className="text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 shrink-0"
            >
              Review Suggestions
            </Button>
          </div>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search assigned services or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]"
          >
            <option value="ALL">All Categories ({assignments.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Services List */}
      {filteredAssignments.length > 0 ? (
        <div className="space-y-3">
          {filteredAssignments.map((a) => {
            const hasOverride = !!a.durationOverrideMinutes;
            const effectiveDuration = a.durationOverrideMinutes || a.catalogDurationMinutes;

            return (
              <Card
                key={a.id}
                className={`p-4 rounded-3xl border transition-all ${
                  a.isActive
                    ? 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-primary-500/30'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-primary-500/10 text-primary-600 flex items-center justify-center shrink-0">
                      <Scissors size={18} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                          {a.serviceName}
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] font-semibold">
                          {a.categoryName}
                        </span>
                        {!a.isActive && (
                          <Badge variant="warning" size="xs">
                            Inactive / Paused
                          </Badge>
                        )}
                        {a.branchOverridesCount > 0 && (
                          <button
                            type="button"
                            onClick={() => onNavigateToBranchAvailability?.(a.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                          >
                            <Building2 size={11} />
                            {a.branchOverridesCount} branch exception(s)
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                        <span className="font-mono font-bold text-[var(--text-primary)]">
                          ₹{a.basePriceAmount}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} />
                          <span>Duration:</span>
                          <span className="font-bold text-[var(--text-primary)]">
                            {effectiveDuration} mins
                          </span>
                          {hasOverride ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 font-bold border border-purple-500/20">
                              Override (+{a.durationOverrideMinutes - a.catalogDurationMinutes}m)
                            </span>
                          ) : (
                            <span className="text-[10px] text-[var(--text-muted)]">
                              (Catalog standard)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {canUpdate && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setEditingDurationAssignment(a)}
                        title="Customize service duration for this employee"
                      >
                        <Clock size={12} className="mr-1" />
                        Duration
                      </Button>
                    )}

                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleToggleActive(a)}
                        className={a.isActive ? 'text-amber-600' : 'text-emerald-600'}
                      >
                        {a.isActive ? 'Pause' : 'Activate'}
                      </Button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setUnassigningAssignment(a)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                        title="Unassign service"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 border border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)]">
          <EmptyState
            icon={Scissors}
            title={searchTerm ? 'No Matching Services' : 'No Services Assigned'}
            description={
              searchTerm
                ? `No service assignments matching "${searchTerm}".`
                : 'Connect active services from Module 11 to this employee to enable customer and front-desk booking.'
            }
            action={
              canAssign && !searchTerm ? (
                <Button variant="primary" onClick={() => setIsAssignModalOpen(true)}>
                  <Plus size={16} className="mr-1.5" />
                  Assign Services
                </Button>
              ) : null
            }
          />
        </Card>
      )}

      {/* Assign Services Modal */}
      {isAssignModalOpen && (
        <AssignServicesModal
          isOpen={true}
          onClose={() => setIsAssignModalOpen(false)}
          onAssignBulk={handleBulkAssign}
          catalogServices={availableCatalog}
          loading={actionLoading}
        />
      )}

      {/* Duration Override Modal */}
      {editingDurationAssignment && (
        <DurationOverrideModal
          isOpen={true}
          onClose={() => setEditingDurationAssignment(null)}
          onSave={handleSaveDuration}
          assignment={editingDurationAssignment}
          loading={actionLoading}
        />
      )}

      {/* Unassign Confirm Dialog */}
      {unassigningAssignment && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setUnassigningAssignment(null)}
          onConfirm={handleConfirmUnassign}
          title={`Unassign Service – ${unassigningAssignment.serviceName}`}
          message={`Are you sure you want to unassign "${unassigningAssignment.serviceName}"? Any branch availability exceptions for this service will also be removed.`}
          confirmText="Unassign Service"
          cancelText="Cancel"
          variant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
}
