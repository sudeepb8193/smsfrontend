import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import ProficiencyDots from '../common/ProficiencyDots';
import { ShieldCheck, Award } from 'lucide-react';

export default function VerifySkillModal({
  isOpen,
  onClose,
  onVerify,
  skill = null,
  loading = false,
}) {
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify(note.trim());
  };

  if (!skill) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Employee Skill Proficiency"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
              {skill.skillName}
            </h4>
            <div className="mt-1">
              <ProficiencyDots level={skill.proficiencyLevel} />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-2">
              Verifying this skill establishes it as an authorized management credential. Verified Master/Expert ratings appear as trust badges on customer-facing booking profiles.
            </p>
          </div>
        </div>

        <div>
          <Input
            type="text"
            label="Verification Note (Optional)"
            placeholder="e.g. Evaluated on live client work. Exceptional color graduation."
            value={note}
            maxLength={255}
            showCharCount
            onChange={(e) => setNote(e.target.value.slice(0, 255))}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            <Award size={15} className="mr-1.5" />
            Approve & Verify
          </Button>
        </div>
      </form>
    </Modal>
  );
}

