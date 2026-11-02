import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';

const PROFICIENCY_OPTIONS = [
  { value: 'beginner', label: 'Beginner (Learning Basics)' },
  { value: 'intermediate', label: 'Intermediate (Competent Practitioner)' },
  { value: 'expert', label: 'Expert (Advanced Specialist)' },
  { value: 'master', label: 'Master (Master Artist / Trainer)' },
];

const SUGGESTED_SKILLS = [
  'Balayage',
  'Hair Coloring',
  'Keratin Treatment',
  'Bridal Hair',
  'Precision Bob Cut',
  'Gel Extensions',
  'Nail Art',
  'HydraFacial',
  'Deep Tissue Massage',
  'Microblading',
  'Threading',
  'Airbrush Makeup',
];

export default function AddEditSkillModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  loading = false,
  isManager = false,
}) {
  const [skillName, setSkillName] = useState(initialData?.skillName || '');
  const [proficiencyLevel, setProficiencyLevel] = useState(
    initialData?.proficiencyLevel || 'beginner',
  );
  const [verifyImmediately, setVerifyImmediately] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!skillName.trim()) {
      setError('Skill name is required');
      return;
    }

    onSave({
      skillName: skillName.trim(),
      proficiencyLevel,
      ...(isManager && verifyImmediately && !initialData
        ? { verificationStatus: 'manager_verified' }
        : {}),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Update Skill Proficiency' : 'Add Professional Technique / Skill'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Skill / Technique Name <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="e.g. Balayage, Keratin, Gel Extension"
            value={skillName}
            onChange={(e) => {
              setSkillName(e.target.value);
              setError('');
            }}
            required
          />

          {!initialData && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-[var(--text-muted)] py-0.5">Quick picks:</span>
              {SUGGESTED_SKILLS.slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSkillName(s)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-primary-500 hover:text-primary-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Proficiency Rating <span className="text-rose-500">*</span>
          </label>
          <CustomSelector
            options={PROFICIENCY_OPTIONS}
            value={proficiencyLevel}
            onChange={(val) => setProficiencyLevel(val)}
          />
        </div>

        {isManager && !initialData && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                Verify immediately as Manager
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Approve as Manager-Verified rather than Self-Declared.
              </span>
            </div>
            <input
              type="checkbox"
              checked={verifyImmediately}
              onChange={(e) => setVerifyImmediately(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {initialData ? 'Update Skill' : 'Save Skill'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

