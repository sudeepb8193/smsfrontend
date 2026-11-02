import React, { useState } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import EmptyState from '../../../components/shared/EmptyState';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import CommissionOverrideModal from './modals/CommissionOverrideModal';
import { usePermission } from '../../../hooks/usePermission';
import {
  Percent,
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Download,
  Printer,
} from 'lucide-react';

export default function StaffCommissionRatesTab({
  staffId,
  isCommissionEligible = true,
  overrides = [],
  resolvedServices = [],
  onSetEligibility,
  onCreateOverride,
  onUpdateOverride,
  onDeleteOverride,
  loading = false,
  readOnly = false,
}) {
  const { can } = usePermission();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState(null);
  const [deletingOverride, setDeletingOverride] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canManage = !readOnly && can('staff_commission.manage');
  const canCreate = !readOnly && can('staff_commission.create');
  const canUpdate = !readOnly && can('staff_commission.update');
  const canDelete = !readOnly && can('staff_commission.delete');
  const canExport = !readOnly && can('staff_commission.export');
  const canPrint = !readOnly && can('staff_commission.print');

  const handleExportCsv = () => {
    const headers = [
      'Scope',
      'Service Name',
      'Commission Type',
      'Value',
      'Effective From',
      'Effective To',
      'Status',
    ];
    const rows = overrides.map((ov) => {
      const status = getOverrideStatus(ov).label;
      const scope = ov.serviceId ? 'Service Specific' : 'Staff Wide';
      const svcName = ov.service?.name || 'All Services';
      const val =
        ov.commissionType === 'percentage'
          ? `${ov.commissionValue}%`
          : `₹${ov.commissionValue}`;
      return [
        `"${scope}"`,
        `"${svcName}"`,
        `"${ov.commissionType}"`,
        `"${val}"`,
        `"${ov.effectiveFrom ? new Date(ov.effectiveFrom).toISOString().split('T')[0] : ''}"`,
        `"${ov.effectiveTo ? new Date(ov.effectiveTo).toISOString().split('T')[0] : 'Indefinite'}"`,
        `"${status}"`,
      ].join(',');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `commission-schedule-${staffId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleEligibility = async (newVal) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onSetEligibility(newVal);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to update commission eligibility');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onCreateOverride(data);
      setIsAddModalOpen(false);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to create commission override');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onUpdateOverride(editingOverride.id, data);
      setEditingOverride(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to update override');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onDeleteOverride(deletingOverride.id);
      setDeletingOverride(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to delete override');
    } finally {
      setActionLoading(false);
    }
  };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const getOverrideStatus = (ov) => {
    const from = new Date(ov.effectiveFrom).toISOString().split('T')[0];
    const to = ov.effectiveTo ? new Date(ov.effectiveTo).toISOString().split('T')[0] : null;

    if (from > todayStr) return { label: 'Scheduled (Future)', variant: 'warning' };
    if (to && to < todayStr) return { label: 'Expired', variant: 'neutral' };
    return { label: 'Active', variant: 'success' };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
              Commission Eligibility & Rate Overrides
            </h2>
            <Badge variant={isCommissionEligible ? 'success' : 'danger'} size="xs">
              {isCommissionEligible ? 'Eligible' : 'Not Eligible'}
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Configure employee commission qualification, staff-wide default overrides, and service-specific rates (consumed by Module 37).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canExport && overrides.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              title="Export commission schedules to CSV"
            >
              <Download size={15} className="mr-1.5" />
              Export
            </Button>
          )}
          {canPrint && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              title="Print commission report"
            >
              <Printer size={15} className="mr-1.5" />
              Print
            </Button>
          )}
          {canCreate && isCommissionEligible && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              disabled={loading || actionLoading}
            >
              <Plus size={16} className="mr-1.5" />
              Add Rate Override
            </Button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Commission Eligibility Banner */}
      <Card className="p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isCommissionEligible
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-rose-500/10 text-rose-600'
              }`}
            >
              {isCommissionEligible ? <Percent size={20} /> : <XCircle size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[var(--text-primary)]">
                  Commission Eligibility State
                </span>
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                    isCommissionEligible
                      ? 'bg-emerald-500/15 text-emerald-600'
                      : 'bg-rose-500/15 text-rose-600'
                  }`}
                >
                  {isCommissionEligible ? 'Eligible for Commission Payouts' : 'Excluded from Commission'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isCommissionEligible
                  ? 'This employee earns commission according to staff overrides or service-specific negotiated rates.'
                  : 'Salaried staff or non-earning roles. Disabling eligibility temporarily deactivates commission calculations in Module 37.'}
              </p>
            </div>
          </div>

          {canManage && (
            <Button
              variant={isCommissionEligible ? 'outline' : 'primary'}
              size="xs"
              onClick={() => handleToggleEligibility(!isCommissionEligible)}
              disabled={actionLoading}
              className="shrink-0"
            >
              {isCommissionEligible ? 'Mark as Not Eligible' : 'Enable Commission Eligibility'}
            </Button>
          )}
        </div>
      </Card>

      {!isCommissionEligible ? (
        <Card className="p-12 border border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
            <XCircle size={24} />
          </div>
          <h3 className="font-extrabold text-base text-[var(--text-primary)]">
            Employee is Marked as Commission-Ineligible
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Salaried stylists, trainees, or front desk staff marked as Not Eligible do not accrue commission regardless of override records on file. Historical and future overrides remain safely stored and will reactivate if eligibility is restored.
          </p>
        </Card>
      ) : (
        <>
          {/* Resolved Effective Rates Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  Live Resolved Rates per Assigned Service
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Calculated using business precedence: Service Override → Staff-Wide Override → Organization Default.
                </p>
              </div>
            </div>

            {resolvedServices.length > 0 ? (
              <div className="overflow-x-auto rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-main)] text-[var(--text-secondary)] border-b border-[var(--border-color)]">
                    <tr>
                      <th className="py-3 px-4 font-bold">Assigned Service</th>
                      <th className="py-3 px-4 font-bold">Category</th>
                      <th className="py-3 px-4 font-bold">Resolved Rate</th>
                      <th className="py-3 px-4 font-bold">Winning Rule / Source</th>
                      <th className="py-3 px-4 font-bold">Effective Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {resolvedServices.map((res) => {
                      const isServiceOverride = res.source === 'service_override';
                      const isStaffOverride = res.source === 'staff_override';

                      return (
                        <tr key={res.serviceId} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                            {res.serviceName}
                          </td>
                          <td className="py-3.5 px-4 text-[var(--text-muted)]">
                            {res.categoryName || 'General'}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-extrabold text-sm text-[var(--text-primary)]">
                            {res.effectiveValue}
                            {res.effectiveType === 'percentage' ? '%' : ' ₹'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                isServiceOverride
                                  ? 'bg-purple-500/15 text-purple-600 border-purple-500/20'
                                  : isStaffOverride
                                  ? 'bg-primary-500/15 text-primary-600 border-primary-500/20'
                                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-color)]'
                              }`}
                            >
                              {res.sourceLabel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[11px] text-[var(--text-muted)]">
                            {res.effectiveFrom
                              ? `${new Date(res.effectiveFrom).toLocaleDateString()} ${
                                  res.effectiveTo
                                    ? `→ ${new Date(res.effectiveTo).toLocaleDateString()}`
                                    : '(Ongoing)'
                                }`
                              : 'Catalog default'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)]">
                Assign services in the Services tab to view live resolved commission rates.
              </div>
            )}
          </div>

          {/* Configured Overrides List */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Configured Overrides & Scheduled Rates ({overrides.length})
            </h3>

            {overrides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overrides.map((ov) => {
                  const status = getOverrideStatus(ov);
                  const isStaffWide = !ov.serviceId;

                  return (
                    <Card
                      key={ov.id}
                      className="p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="font-extrabold text-sm text-[var(--text-primary)] block">
                              {isStaffWide
                                ? 'Staff-Wide Default Override'
                                : `Service Override: ${ov.service?.name}`}
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {isStaffWide
                                ? 'Applies to all eligible services'
                                : 'Specific service override'}
                            </span>
                          </div>

                          <Badge variant={status.variant} size="xs">
                            {status.label}
                          </Badge>
                        </div>

                        <div className="my-3 flex items-baseline gap-2">
                          <span className="text-2xl font-mono font-black text-primary-600 dark:text-primary-400">
                            {ov.commissionValue}
                            {ov.commissionType === 'percentage' ? '%' : ' ₹'}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            ({ov.commissionType === 'percentage' ? 'Percentage' : 'Fixed Flat Amount'})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-main)] p-2.5 rounded-xl border border-[var(--border-color)]">
                          <Calendar size={13} />
                          <span>
                            From {new Date(ov.effectiveFrom).toLocaleDateString()}{' '}
                            {ov.effectiveTo
                              ? `to ${new Date(ov.effectiveTo).toLocaleDateString()}`
                              : '(Ongoing)'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setEditingOverride(ov)}
                          >
                            <Edit2 size={13} className="mr-1" />
                            Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setDeletingOverride(ov)}
                            className="text-rose-500 hover:bg-rose-500/10"
                          >
                            <Trash2 size={13} className="mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)]">
                No custom commission overrides configured. The organization default (10%) applies across all eligible services.
              </div>
            )}
          </div>
        </>
      )}

      {/* Add / Edit Commission Override Modal */}
      {(isAddModalOpen || editingOverride) && (
        <CommissionOverrideModal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingOverride(null);
          }}
          onSave={editingOverride ? handleUpdate : handleCreate}
          assignedServices={resolvedServices}
          initialData={editingOverride}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirm */}
      {deletingOverride && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingOverride(null)}
          onConfirm={handleConfirmDelete}
          title="Remove Commission Override"
          message="Are you sure you want to remove this commission override? The employee will revert to the organization default or staff-wide rate."
          confirmText="Remove Override"
          cancelText="Cancel"
          variant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
}
