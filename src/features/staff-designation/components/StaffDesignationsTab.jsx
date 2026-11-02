import React, { useState } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import EmptyState from '../../../components/shared/EmptyState';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import AddEditDesignationModal from './modals/AddEditDesignationModal';
import { usePermission } from '../../../hooks/usePermission';
import {
  Scissors,
  Sparkles,
  Paintbrush,
  HeartHandshake,
  Hand,
  UserCheck,
  Star,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Briefcase,
} from 'lucide-react';

const DESIGNATION_META = {
  stylist: { label: 'Stylist', icon: Scissors, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
  beautician: { label: 'Beautician', icon: Sparkles, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
  makeup_artist: { label: 'Makeup Artist', icon: Paintbrush, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  hairdresser: { label: 'Hairdresser', icon: Scissors, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  therapist: { label: 'Therapist', icon: HeartHandshake, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  nail_technician: { label: 'Nail Technician', icon: Hand, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  other: { label: 'Specialist', icon: UserCheck, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
};

export default function StaffDesignationsTab({
  staffId,
  designations = [],
  primaryDesignation = null,
  onAddDesignation,
  onUpdateDesignation,
  onSetPrimary,
  onDeleteDesignation,
  loading = false,
  readOnly = false,
}) {
  const { can } = usePermission();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [deletingDesignation, setDeletingDesignation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canCreate = !readOnly && can('staff_designation.create');
  const canUpdate = !readOnly && can('staff_designation.update');
  const canDelete = !readOnly && can('staff_designation.delete');

  const handleCreate = async (data) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onAddDesignation(data);
      setIsAddModalOpen(false);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to add designation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onUpdateDesignation(editingDesignation.id, data);
      setEditingDesignation(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to update designation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDesignation) return;
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onDeleteDesignation(deletingDesignation.id);
      setDeletingDesignation(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to remove designation');
    } finally {
      setActionLoading(false);
    }
  };

  const getLabel = (d) => {
    if (d.designationType === 'other') {
      return d.customLabel || 'Other';
    }
    return DESIGNATION_META[d.designationType]?.label || d.designationType;
  };

  const getIcon = (type) => {
    const meta = DESIGNATION_META[type] || DESIGNATION_META.other;
    const IconComp = meta.icon;
    return <IconComp size={16} />;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
            Service Provider Designations
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Professional service delivery roles (Stylist, Colorist, Nail Tech) shown to customers on booking profiles.
          </p>
        </div>
        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            disabled={loading || actionLoading}
          >
            <Plus size={16} className="mr-1.5" />
            Add Designation
          </Button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Primary Designation Hero Card */}
      {primaryDesignation && (
        <Card className="p-6 border-2 border-primary-500/30 bg-gradient-to-r from-primary-500/10 via-[var(--bg-card)] to-transparent rounded-3xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/20 text-primary-600 flex items-center justify-center shadow-xs">
                {getIcon(primaryDesignation.designationType)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-[var(--text-primary)]">
                    {getLabel(primaryDesignation)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-600 border border-amber-500/20">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    Primary Designation
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-2">
                  <span>
                    {primaryDesignation.yearsOfExperience !== null && primaryDesignation.yearsOfExperience !== undefined
                      ? `${primaryDesignation.yearsOfExperience} yrs experience`
                      : 'Experience not set'}
                  </span>
                  <span>•</span>
                  <span>Featured on customer appointment portal & staff cards</span>
                </p>
              </div>
            </div>

            {canUpdate && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setEditingDesignation(primaryDesignation)}
                >
                  <Edit2 size={13} className="mr-1" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* All Designations List */}
      {designations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designations.map((des) => {
            const meta = DESIGNATION_META[des.designationType] || DESIGNATION_META.other;
            const isPrimary = des.isPrimary;

            return (
              <Card
                key={des.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isPrimary
                    ? 'border-primary-500/30 bg-primary-500/5'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-primary-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${meta.color}`}>
                      {getIcon(des.designationType)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                        {getLabel(des)}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {des.yearsOfExperience !== null && des.yearsOfExperience !== undefined
                          ? `${des.yearsOfExperience} years of experience`
                          : 'Experience not specified'}
                      </p>
                    </div>
                  </div>

                  {isPrimary && (
                    <Badge variant="primary" size="xs">
                      Primary
                    </Badge>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    {!isPrimary && canUpdate && (
                      <button
                        type="button"
                        onClick={() => onSetPrimary(des.id)}
                        disabled={actionLoading}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle size={13} />
                        Set as Primary
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canUpdate && (
                      <button
                        type="button"
                        onClick={() => setEditingDesignation(des)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-primary-600 hover:bg-primary-500/10 transition-colors"
                        title="Edit Designation"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeletingDesignation(des)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                        title="Remove Designation"
                      >
                        <Trash2 size={14} />
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
            icon={Briefcase}
            title="No Professional Designations"
            description="Assign service provider designations (such as Stylist, Beautician, or Colorist) to authorize this employee for service bookings."
            action={
              canCreate ? (
                <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                  <Plus size={16} className="mr-1.5" />
                  Add First Designation
                </Button>
              ) : null
            }
          />
        </Card>
      )}

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingDesignation) && (
        <AddEditDesignationModal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingDesignation(null);
          }}
          onSave={editingDesignation ? handleUpdate : handleCreate}
          initialData={editingDesignation}
          isFirst={designations.length === 0}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deletingDesignation && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingDesignation(null)}
          onConfirm={handleConfirmDelete}
          title={`Remove Designation – ${getLabel(deletingDesignation)}`}
          message={
            deletingDesignation.isPrimary
              ? `Are you sure you want to remove the Primary designation "${getLabel(
                  deletingDesignation,
                )}"? If other designations remain, the next designation will be automatically promoted to Primary.`
              : `Are you sure you want to remove "${getLabel(deletingDesignation)}"?`
          }
          confirmText="Remove Designation"
          cancelText="Cancel"
          variant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
}
