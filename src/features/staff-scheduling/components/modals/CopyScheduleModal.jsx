import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import DatePicker from '../../../../components/shared/DatePicker';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { Copy, Users, ArrowRight, Check } from 'lucide-react';

export default function CopyScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  staffList = [],
  loading = false,
}) {
  const [sourceStaffId, setSourceStaffId] = useState('');
  const [targetStaffIds, setTargetStaffIds] = useState([]);
  const [effectiveFrom, setEffectiveFrom] = useState(() => {
    return new Date().toISOString().substring(0, 10);
  });
  const [effectiveTo, setEffectiveTo] = useState('');
  const [formError, setFormError] = useState(null);

  const staffOptions = staffList.map((s) => ({
    value: s.id,
    label: `${s.fullName} (${s.employeeCode || 'EMP'})`,
  }));

  const handleToggleTarget = (id) => {
    setTargetStaffIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAllTargets = () => {
    const eligible = staffList
      .filter((s) => s.id !== sourceStaffId)
      .map((s) => s.id);
    setTargetStaffIds(eligible);
  };

  const handleClearTargets = () => {
    setTargetStaffIds([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!sourceStaffId) {
      setFormError('Please select a source employee to copy schedule from');
      return;
    }
    if (targetStaffIds.length === 0) {
      setFormError('Please select at least one target employee');
      return;
    }
    if (!effectiveFrom) {
      setFormError('Effective from date is required');
      return;
    }

    onSubmit({
      sourceStaffId,
      targetStaffIds,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Copy Weekly Schedule to Team Members"
      size="medium"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="copy-schedule-form"
            variant="primary"
            loading={loading}
          >
            Copy Schedule
          </Button>
        </div>
      }
    >
      <form id="copy-schedule-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-500 font-medium">
            {formError}
          </div>
        )}

        {/* Source Employee */}
        <div>
          <CustomSelector
            label="Source Employee (Copy From) *"
            options={staffOptions}
            value={sourceStaffId}
            onChange={(val) => {
              setSourceStaffId(val);
              setTargetStaffIds((prev) => prev.filter((id) => id !== val));
            }}
            placeholder="Select Source Stylist/Employee..."
            isSearchable={false}
            isClearable={false}
          />
        </div>

        {/* Effective Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <DatePicker
              label="Effective From *"
              value={effectiveFrom}
              onChange={(val) => setEffectiveFrom(val)}
              required
            />
          </div>
          <div>
            <DatePicker
              label="Effective To (Optional)"
              value={effectiveTo}
              onChange={(val) => setEffectiveTo(val)}
              minDate={effectiveFrom}
              placeholder="Ongoing / Select date"
            />
          </div>
        </div>

        {/* Target Employees Multi-Select */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Target Employees ({targetStaffIds.length} selected) *
            </label>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={handleSelectAllTargets}
                className="text-primary-600 dark:text-primary-400 font-bold hover:underline cursor-pointer"
              >
                Select All
              </button>
              <span className="text-[var(--text-muted)]">|</span>
              <button
                type="button"
                onClick={handleClearTargets}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 p-2 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
            {staffList
              .filter((s) => s.id !== sourceStaffId)
              .map((s) => {
                const isSelected = targetStaffIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleToggleTarget(s.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-primary-500/15 text-primary-700 dark:text-primary-300 border border-primary-500/30 font-bold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{s.fullName}</span>
                    <span className="text-[11px] font-mono">
                      {isSelected ? (
                        <Check size={14} className="text-primary-600 dark:text-primary-400 font-bold" />
                      ) : (
                        s.employeeCode
                      )}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
