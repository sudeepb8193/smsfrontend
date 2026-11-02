import React, { useState, useMemo } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Input from '../../../components/shared/Input';
import EmptyState from '../../../components/shared/EmptyState';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import ProficiencyDots from './common/ProficiencyDots';
import AddEditSkillModal from './modals/AddEditSkillModal';
import VerifySkillModal from './modals/VerifySkillModal';
import { usePermission } from '../../../hooks/usePermission';
import { useAuth } from '../../../hooks/useAuth';
import {
  Award,
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';

export default function StaffSkillRatingsTab({
  staffId,
  skills = [],
  onAddSkill,
  onUpdateSkill,
  onVerifySkill,
  onRejectSkill,
  onDeleteSkill,
  loading = false,
  readOnly = false,
  staffUserId = null,
}) {
  const { user } = useAuth();
  const { can } = usePermission();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, VERIFIED, SELF_DECLARED
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [verifyingSkill, setVerifyingSkill] = useState(null);
  const [rejectingSkill, setRejectingSkill] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isSelf = user?.id && staffUserId && user.id === staffUserId;

  const canCreate = !readOnly && can('staff_skill_rating.create');
  const canUpdate = !readOnly && can('staff_skill_rating.update');
  const canDelete = !readOnly && can('staff_skill_rating.delete');
  const canVerify = !readOnly && !isSelf && can('staff_skill_rating.approve');
  const canReject = !readOnly && !isSelf && can('staff_skill_rating.reject');

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const matchSearch =
        !searchTerm || s.skillName.toLowerCase().includes(searchTerm.toLowerCase());
      const isVerified = s.verificationStatus === 'manager_verified';
      if (filterStatus === 'VERIFIED') return matchSearch && isVerified;
      if (filterStatus === 'SELF_DECLARED') return matchSearch && !isVerified;
      return matchSearch;
    });
  }, [skills, searchTerm, filterStatus]);

  const verifiedCount = skills.filter((s) => s.verificationStatus === 'manager_verified').length;

  const handleCreate = async (data) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onAddSkill(data);
      setIsAddModalOpen(false);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to add skill');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onUpdateSkill(editingSkill.id, data);
      setEditingSkill(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to update skill');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmVerify = async (note) => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onVerifySkill(verifyingSkill.id, note);
      setVerifyingSkill(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to verify skill');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onRejectSkill(rejectingSkill.id, 'Skill does not meet verification criteria');
      setRejectingSkill(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to reject verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      await onDeleteSkill(deletingSkill.id);
      setDeletingSkill(null);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to delete skill');
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
              Skill Proficiency & Verification
            </h2>
            <Badge variant="primary" size="xs">
              {verifiedCount} / {skills.length} Verified
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Individual technique proficiencies, distinction between self-declared and manager-verified certifications.
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
            Add Skill
          </Button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search skills (e.g. Balayage, Keratin)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--border-color)]">
          {['ALL', 'VERIFIED', 'SELF_DECLARED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {st === 'ALL' ? 'All Skills' : st === 'VERIFIED' ? 'Verified' : 'Self-Declared'}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Table / Cards */}
      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((sk) => {
            const isVerified = sk.verificationStatus === 'manager_verified';

            return (
              <Card
                key={sk.id}
                className="p-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs flex flex-col justify-between hover:border-primary-500/20 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-extrabold text-base text-[var(--text-primary)] tracking-tight">
                      {sk.skillName}
                    </h4>

                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 shrink-0">
                        <ShieldCheck size={13} className="text-emerald-500" />
                        Manager Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-600 border border-amber-500/20 shrink-0">
                        <ShieldAlert size={13} className="text-amber-500" />
                        Self-Declared
                      </span>
                    )}
                  </div>

                  <div className="my-3">
                    <ProficiencyDots level={sk.proficiencyLevel} />
                  </div>

                  {isVerified && sk.verifiedBy && (
                    <div className="text-[11px] text-[var(--text-muted)] bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10 mb-2">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">
                        Verified by: {sk.verifiedBy.displayName || sk.verifiedBy.email}
                      </span>
                      {sk.verifiedAt && (
                        <span>On {new Date(sk.verifiedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!isVerified && canVerify && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setVerifyingSkill(sk)}
                        className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        <CheckCircle2 size={13} className="mr-1" />
                        Verify
                      </Button>
                    )}
                    {isVerified && canReject && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setRejectingSkill(sk)}
                        className="text-rose-500 hover:bg-rose-500/10"
                      >
                        <XCircle size={13} className="mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canUpdate && (
                      <button
                        type="button"
                        onClick={() => setEditingSkill(sk)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-primary-600 hover:bg-primary-500/10 transition-colors"
                        title="Edit Skill"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeletingSkill(sk)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                        title="Remove Skill"
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
            icon={Award}
            title={searchTerm ? 'No Matching Skills' : 'No Skills Registered'}
            description={
              searchTerm
                ? `No technique proficiencies matched "${searchTerm}".`
                : 'Register employee service specialties and specific styling/spa techniques.'
            }
            action={
              canCreate && !searchTerm ? (
                <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                  <Plus size={16} className="mr-1.5" />
                  Add First Skill
                </Button>
              ) : null
            }
          />
        </Card>
      )}

      {/* Add / Edit Skill Modal */}
      {(isAddModalOpen || editingSkill) && (
        <AddEditSkillModal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingSkill(null);
          }}
          onSave={editingSkill ? handleUpdate : handleCreate}
          initialData={editingSkill}
          loading={actionLoading}
          isManager={canVerify}
        />
      )}

      {/* Verify Skill Modal */}
      {verifyingSkill && (
        <VerifySkillModal
          isOpen={true}
          onClose={() => setVerifyingSkill(null)}
          onVerify={handleConfirmVerify}
          skill={verifyingSkill}
          loading={actionLoading}
        />
      )}

      {/* Reject / Revoke Confirm Dialog */}
      {rejectingSkill && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setRejectingSkill(null)}
          onConfirm={handleConfirmReject}
          title={`Revoke Verification – ${rejectingSkill.skillName}`}
          message={`Are you sure you want to revoke the manager verification status for "${rejectingSkill.skillName}"? The skill rating will revert to self-declared.`}
          confirmText="Revoke Verification"
          cancelText="Cancel"
          variant="danger"
          loading={actionLoading}
        />
      )}

      {/* Delete Skill Confirm Dialog */}
      {deletingSkill && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingSkill(null)}
          onConfirm={handleConfirmDelete}
          title={`Delete Skill – ${deletingSkill.skillName}`}
          message={`Are you sure you want to remove "${deletingSkill.skillName}" from this employee's profile?`}
          confirmText="Delete Skill"
          cancelText="Cancel"
          variant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
}
