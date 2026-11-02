import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import { Clock, RotateCcw } from 'lucide-react';

export default function DurationOverrideModal({
  isOpen,
  onClose,
  onSave,
  assignment = null,
  loading = false,
}) {
  const [durationMinutes, setDurationMinutes] = useState(
    assignment?.durationOverrideMinutes !== null && assignment?.durationOverrideMinutes !== undefined
      ? assignment.durationOverrideMinutes
      : '',
  );
  const [error, setError] = useState('');

  const catalogDuration = assignment?.catalogDurationMinutes || 60;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (durationMinutes === '' || durationMinutes === null) {
      // Revert to catalog
      onSave({ durationOverrideMinutes: null });
      return;
    }

    const val = parseInt(durationMinutes, 10);
    if (isNaN(val) || val <= 0 || val > 720) {
      setError('Duration override must be a positive number between 1 and 720 minutes');
      return;
    }

    onSave({ durationOverrideMinutes: val });
  };

  const handleResetToCatalog = () => {
    setDurationMinutes('');
    onSave({ durationOverrideMinutes: null });
  };

  if (!assignment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Staff Duration Override"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <span className="text-xs font-extrabold text-[var(--text-primary)] block">
            {assignment.serviceName}
          </span>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
            <Clock size={13} />
            <span>Catalog Standard Duration:</span>
            <span className="font-bold text-[var(--text-primary)]">
              {catalogDuration} minutes
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Staff-Specific Duration (Minutes)
          </label>
          <Input
            type="number"
            min={1}
            max={720}
            placeholder={`Catalog default (${catalogDuration})`}
            value={durationMinutes}
            onChange={(e) => {
              setDurationMinutes(e.target.value);
              setError('');
            }}
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Booking engine uses this customized duration instead of the standard service catalog duration when scheduling this staff member.
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
          {assignment.durationOverrideMinutes && (
            <Button
              variant="ghost"
              size="xs"
              type="button"
              onClick={handleResetToCatalog}
              disabled={loading}
              className="text-amber-600 hover:bg-amber-500/10"
            >
              <RotateCcw size={12} className="mr-1" />
              Reset to Catalog
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Save Override
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

