import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { Clock, Tag, Sparkles, Building2 } from 'lucide-react';

const COLOR_PALETTE = [
  { key: 'blue', label: 'Blue', bg: 'bg-blue-500' },
  { key: 'green', label: 'Green', bg: 'bg-green-500' },
  { key: 'amber', label: 'Amber', bg: 'bg-amber-500' },
  { key: 'purple', label: 'Purple', bg: 'bg-purple-500' },
  { key: 'rose', label: 'Rose', bg: 'bg-rose-500' },
  { key: 'teal', label: 'Teal', bg: 'bg-teal-500' },
  { key: 'indigo', label: 'Indigo', bg: 'bg-indigo-500' },
  { key: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
  { key: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
  { key: 'default', label: 'Slate', bg: 'bg-slate-500' },
];

export default function ShiftTemplateModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  branches = [],
  loading = false,
}) {
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [hasBreak, setHasBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState('13:00');
  const [breakEndTime, setBreakEndTime] = useState('14:00');
  const [colorTag, setColorTag] = useState('blue');
  const [scope, setScope] = useState('org'); // 'org' | 'branch'
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState('active');
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setStartTime(initialData.startTime || '09:00');
      setEndTime(initialData.endTime || '17:00');
      if (initialData.breakStartTime && initialData.breakEndTime) {
        setHasBreak(true);
        setBreakStartTime(initialData.breakStartTime);
        setBreakEndTime(initialData.breakEndTime);
      } else {
        setHasBreak(false);
        setBreakStartTime('13:00');
        setBreakEndTime('14:00');
      }
      setColorTag(initialData.colorTag || 'default');
      if (initialData.branchId) {
        setScope('branch');
        setBranchId(initialData.branchId);
      } else {
        setScope('org');
        setBranchId('');
      }
      setStatus(initialData.status || 'active');
    } else {
      setName('');
      setStartTime('09:00');
      setEndTime('17:00');
      setHasBreak(false);
      setBreakStartTime('13:00');
      setBreakEndTime('14:00');
      setColorTag('blue');
      setScope('org');
      setBranchId('');
      setStatus('active');
    }
    setFormError(null);
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Template name is required');
      return;
    }
    if (!startTime || !endTime) {
      setFormError('Start time and End time are required');
      return;
    }
    if (endTime <= startTime) {
      setFormError('End time must be after start time');
      return;
    }
    if (hasBreak) {
      if (!breakStartTime || !breakEndTime) {
        setFormError('Break start and end times must both be specified');
        return;
      }
      if (breakEndTime <= breakStartTime) {
        setFormError('Break end time must be after break start time');
        return;
      }
      if (breakStartTime < startTime || breakEndTime > endTime) {
        setFormError('Break window must fall entirely within the shift working hours');
        return;
      }
    }
    if (scope === 'branch' && !branchId) {
      setFormError('Please select a branch for branch-specific scope');
      return;
    }

    const payload = {
      name: name.trim(),
      startTime,
      endTime,
      breakStartTime: hasBreak ? breakStartTime : null,
      breakEndTime: hasBreak ? breakEndTime : null,
      colorTag,
      branchId: scope === 'branch' ? branchId : null,
      ...(initialData ? { status } : {}),
    };

    onSubmit(payload);
  };

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: `${b.name} (${b.code || 'Branch'})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Shift Template' : 'Create New Shift Template'}
      size="medium"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="shift-template-form"
            variant="primary"
            loading={loading}
          >
            {initialData ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      }
    >
      <form id="shift-template-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-500 font-medium">
            {formError}
          </div>
        )}

        {/* Template Name */}
        <div>
          <Input
            label="Template Name"
            value={name}
            maxLength={80}
            showCharCount
            onChange={(e) => setName(e.target.value.slice(0, 80))}
            placeholder="e.g. Morning Shift, Evening 1-9, Weekend Rush"
            required
            autoFocus
          />
        </div>

        {/* Working Hours */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Break Window Toggle */}
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={hasBreak}
              onChange={(e) => setHasBreak(e.target.checked)}
              className="rounded border-[var(--border-color)] text-primary-600 focus:ring-primary-500"
            />
            <span>Include standard break window during shift</span>
          </label>

          {hasBreak && (
            <div className="grid grid-cols-2 gap-3 mt-2.5 p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <div>
                <Input
                  label="Break Start"
                  type="time"
                  value={breakStartTime}
                  onChange={(e) => setBreakStartTime(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="Break End"
                  type="time"
                  value={breakEndTime}
                  onChange={(e) => setBreakEndTime(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Scope Selection */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold text-[var(--text-primary)]">
            Template Scope
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setScope('org')}
              className={`p-3 rounded-2xl text-xs font-medium border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                scope === 'org'
                  ? 'bg-primary-500/10 border-primary-500/40 text-primary-700 dark:text-primary-300'
                  : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sparkles size={16} className="shrink-0 text-primary-500" />
              <div>
                <div className="font-bold text-[var(--text-primary)] text-xs">Org-Wide</div>
                <div className="text-[10px] text-[var(--text-muted)]">Available across all branches</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setScope('branch')}
              className={`p-3 rounded-2xl text-xs font-medium border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                scope === 'branch'
                  ? 'bg-primary-500/10 border-primary-500/40 text-primary-700 dark:text-primary-300'
                  : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Building2 size={16} className="shrink-0 text-primary-500" />
              <div>
                <div className="font-bold text-[var(--text-primary)] text-xs">Branch Specific</div>
                <div className="text-[10px] text-[var(--text-muted)]">Restricted to one location</div>
              </div>
            </button>
          </div>

          {scope === 'branch' && (
            <div className="pt-2">
              <CustomSelector
                label="Select Branch"
                options={branchOptions}
                value={branchId}
                onChange={setBranchId}
                placeholder="Choose branch location..."
                isSearchable={false}
                isClearable={false}
              />
            </div>
          )}
        </div>

        {/* Color Tag Picker */}
        <div className="pt-1">
          <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">
            Visual Color Tag
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setColorTag(c.key)}
                className={`w-7 h-7 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  c.bg
                } ${
                  colorTag === c.key
                    ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-[var(--bg-card)] scale-110 shadow-xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
