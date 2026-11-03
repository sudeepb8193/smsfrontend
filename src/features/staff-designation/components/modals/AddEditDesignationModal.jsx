import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';

const DESIGNATION_OPTIONS = [
  { value: 'stylist', label: 'Stylist' },
  { value: 'beautician', label: 'Beautician' },
  { value: 'makeup_artist', label: 'Makeup Artist' },
  { value: 'hairdresser', label: 'Hairdresser' },
  { value: 'therapist', label: 'Therapist' },
  { value: 'nail_technician', label: 'Nail Technician' },
  { value: 'other', label: 'Other (Custom)' },
];

export default function AddEditDesignationModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  loading = false,
  isFirst = false,
}) {
  const [designationType, setDesignationType] = useState(
    initialData?.designationType || 'stylist',
  );
  const [customLabel, setCustomLabel] = useState(initialData?.customLabel || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(
    initialData?.yearsOfExperience !== undefined && initialData?.yearsOfExperience !== null
      ? initialData.yearsOfExperience
      : '',
  );
  const [isPrimary, setIsPrimary] = useState(
    isFirst ? true : initialData?.isPrimary || false,
  );
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (designationType === 'other' && !customLabel.trim()) {
      setError('Custom designation label is required when designation is Other');
      return;
    }

    const expNum =
      yearsOfExperience !== '' && yearsOfExperience !== null
        ? parseInt(yearsOfExperience, 10)
        : null;

    if (expNum !== null && (isNaN(expNum) || expNum < 0 || expNum > 60)) {
      setError('Years of experience must be a number between 0 and 60');
      return;
    }

    onSave({
      designationType,
      customLabel: designationType === 'other' ? customLabel.trim() : null,
      yearsOfExperience: expNum,
      isPrimary,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Professional Designation' : 'Add Professional Designation'}
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
            Designation Role <span className="text-rose-500">*</span>
          </label>
          <CustomSelector
            options={DESIGNATION_OPTIONS}
            value={designationType}
            onChange={(val) => {
              setDesignationType(val);
              setError('');
            }}
          />
        </div>

        {designationType === 'other' && (
          <div>
            <Input
              type="text"
              label="Custom Designation Title"
              placeholder="e.g. Bridal Specialist, Colorist"
              value={customLabel}
              maxLength={100}
              showCharCount
              onChange={(e) => setCustomLabel(e.target.value.slice(0, 100))}
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Years of Experience (in this role)
          </label>
          <Input
            type="number"
            min={0}
            max={60}
            placeholder="e.g. 5"
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value)}
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Displayed on client portal as professional credibility signal.
          </p>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)] block">
              Set as Primary Designation
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Appears on staff badge, appointments, and primary client filters.
            </span>
          </div>
          <input
            type="checkbox"
            checked={isPrimary || isFirst}
            disabled={isFirst}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {initialData ? 'Update Designation' : 'Add Designation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

