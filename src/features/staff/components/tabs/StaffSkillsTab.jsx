import React, { useState } from 'react';
import Card from '../../../../components/shared/Card';
import Button from '../../../../components/shared/Button';
import Badge from '../../../../components/shared/Badge';
import Input from '../../../../components/shared/Input';
import { usePermission } from '../../../../hooks/usePermission';
import { AddQualificationModal } from '../modals/AddQualificationModal';
import {
  Award,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';

export function StaffSkillsTab({
  skills = [],
  qualifications = [],
  onAddSkill,
  onRemoveSkill,
  onAddQualification,
  onRemoveQualification,
  loading,
}) {
  const { can } = usePermission();
  const [newSkillText, setNewSkillText] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddSkillSubmit = (e) => {
    e.preventDefault();
    if (!newSkillText.trim()) return;
    onAddSkill({
      recordType: 'skill_tag',
      title: newSkillText.trim(),
    });
    setNewSkillText('');
  };

  return (
    <div className="space-y-6">
      {/* Skill Tags Section */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="text-primary-500" size={18} />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Skills & Capabilities
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Practical techniques, styles, and salon specialties declared for this employee.
            </p>
          </div>
        </div>

        {/* Add Skill Tag Input */}
        {(can('staff_qualification.create') || can('staff_qualification.manage')) && (
          <form onSubmit={handleAddSkillSubmit} className="flex gap-2 mb-4 max-w-md items-end">
            <Input
              value={newSkillText}
              maxLength={150}
              showCharCount
              onChange={(e) => setNewSkillText(e.target.value.slice(0, 150))}
              placeholder="e.g. Balayage, Bridal Makeup, Keratin..."
              className="flex-1"
            />
            <Button type="submit" variant="primary" size="sm" disabled={!newSkillText.trim() || loading} className="mb-0.5">
              <Plus size={14} className="mr-1" />
              Add Tag
            </Button>
          </form>
        )}

        {/* Skill Chips */}
        {skills.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-2">
            No skill tags added yet. Add specialties above to highlight capabilities.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-800"
              >
                <span>{skill.title}</span>
                {(can('staff_qualification.delete') || can('staff_qualification.manage')) && (
                  <button
                    type="button"
                    onClick={() => onRemoveSkill(skill.id)}
                    className="hover:text-rose-500 ml-1 rounded-full p-0.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Formal Certifications & Qualifications Section */}
      <Card>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="text-blue-500" size={18} />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Formal Qualifications & Certifications
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Verified diplomas, accreditations, and certifications with validity tracking.
            </p>
          </div>
          {(can('staff_qualification.create') || can('staff_qualification.manage')) && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={14} className="mr-1.5" />
              Add Qualification
            </Button>
          )}
        </div>

        {qualifications.length === 0 ? (
          <div className="p-8 text-center bg-[var(--bg-input)] border border-dashed border-[var(--border-color)] rounded-xl">
            <Award className="mx-auto text-[var(--text-muted)] mb-2" size={32} />
            <p className="text-sm font-semibold text-[var(--text-secondary)]">
              No formal qualifications recorded
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Add diplomas, licenses, or styling certificates to maintain compliance records.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qualifications.map((q) => {
              const isExpired = q.isExpired;
              const isExpiringSoon = q.isExpiringSoon;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isExpired
                      ? 'bg-rose-50/40 border-rose-300 dark:bg-rose-950/20 dark:border-rose-900'
                      : isExpiringSoon
                      ? 'bg-amber-50/40 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900'
                      : 'bg-white dark:bg-slate-900/40 border-[var(--border-color)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)] text-sm">
                        {q.title}
                      </h4>
                      {q.issuingInstitution && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {q.issuingInstitution}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {isExpired ? (
                        <Badge variant="danger" size="xs">
                          Expired
                        </Badge>
                      ) : isExpiringSoon ? (
                        <Badge variant="warning" size="xs">
                          Expires in {q.daysRemaining}d
                        </Badge>
                      ) : q.expiryDate ? (
                        <Badge variant="success" size="xs">
                          Valid
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="xs">
                          No Expiry
                        </Badge>
                      )}
                      {(can('staff_qualification.delete') ||
                        can('staff_qualification.manage')) && (
                        <button
                          type="button"
                          onClick={() => onRemoveQualification(q.id)}
                          className="p-1 text-[var(--text-muted)] hover:text-rose-500 cursor-pointer"
                          title="Delete Qualification"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5 text-xs">
                    {q.certificateNumber && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">License/Cert #:</span>
                        <span className="font-mono text-[var(--text-secondary)] font-semibold">
                          {q.certificateNumber}
                        </span>
                      </div>
                    )}

                    {q.issueDate && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Issue Date:</span>
                        <span className="text-[var(--text-secondary)]">
                          {new Date(q.issueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {q.expiryDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Expiry Date:</span>
                        <span
                          className={`font-medium ${
                            isExpired
                              ? 'text-rose-600 dark:text-rose-400'
                              : isExpiringSoon
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {new Date(q.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {q.documentUrl && (
                      <div className="pt-1 flex justify-end">
                        <a
                          href={q.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-primary-500 hover:underline"
                        >
                          <FileCheck size={12} />
                          <span>View Certificate</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Qualification Modal */}
      <AddQualificationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        loading={loading}
        onSave={async (data) => {
          await onAddQualification(data);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}

export default StaffSkillsTab;
