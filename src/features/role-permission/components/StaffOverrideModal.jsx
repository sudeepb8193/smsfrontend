import React, { useState } from 'react';
import Modal from '../../../components/shared/Modal';
import Input from '../../../components/shared/Input';
import Textarea from '../../../components/shared/Textarea';
import CustomSelector from '../../../components/shared/CustomSelector';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import {
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Building,
  Info,
  Clock,
} from 'lucide-react';

export const StaffOverrideModal = ({
  isOpen,
  onClose,
  onSubmit,
  staff,
  permissionsCatalog = [],
  branches = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    permissionKey: '',
    overrideType: 'grant',
    branchId: '',
    reason: '',
    expiresAt: '',
  });
  const [errors, setErrors] = useState({});

  const permissionOptions = [
    { value: '', label: 'Select a permission...' },
    ...permissionsCatalog.map((p) => ({
      value: p.permissionKey,
      label: `[${p.moduleLabel}] ${p.label} (${p.permissionKey})`,
    })),
  ];

  const branchOptions = [
    { value: '', label: 'All Branches (Organization-wide)' },
    ...branches.map((b) => ({
      value: b.id,
      label: `${b.name} (${b.code})`,
    })),
  ];

  const handleSetPresetExpiry = (hours) => {
    if (!hours) {
      setFormData((prev) => ({ ...prev, expiresAt: '' }));
      return;
    }
    const d = new Date(Date.now() + hours * 60 * 60 * 1000);
    // Format to YYYY-MM-DDTHH:mm
    const isoString = d.toISOString().slice(0, 16);
    setFormData((prev) => ({ ...prev, expiresAt: isoString }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.permissionKey) {
      nextErrors.permissionKey = 'Please select a permission';
    }
    if (!formData.reason.trim()) {
      nextErrors.reason = 'A mandatory reason is required for every permission exception';
    } else if (formData.reason.trim().length < 3) {
      nextErrors.reason = 'Reason must be at least 3 characters';
    }

    if (formData.expiresAt) {
      const exp = new Date(formData.expiresAt);
      if (isNaN(exp.getTime()) || exp <= new Date()) {
        nextErrors.expiresAt = 'Expiration date must be in the future';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validate()) return;

    onSubmit({
      staffId: staff.id,
      permissionKey: formData.permissionKey,
      overrideType: formData.overrideType,
      branchId: formData.branchId || undefined,
      reason: formData.reason.trim(),
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Staff Permission Exception"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Staff Summary Header */}
        <div className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-[var(--text-primary)]">{staff?.fullName}</div>
            <div className="text-[11px] text-[var(--text-muted)] font-mono">
              Employee Code: {staff?.employeeCode} • Home Branch: {staff?.homeBranch?.name || 'N/A'}
            </div>
          </div>
          <Badge variant="primary" size="small">
            Individual Override
          </Badge>
        </div>

        {/* Override Type Segmented Control */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Override Action Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, overrideType: 'grant' })}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                formData.overrideType === 'grant'
                  ? 'bg-success-500/15 border-success-500 text-success-300 shadow-xs'
                  : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
              }`}
            >
              <ShieldCheck size={18} className="text-success-400" />
              <div className="text-left">
                <div>Grant Exception</div>
                <div className="text-[10px] font-normal text-success-300/70">
                  Adds an extra permission not given by role
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, overrideType: 'revoke' })}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer ${
                formData.overrideType === 'revoke'
                  ? 'bg-danger-500/15 border-danger-500 text-danger-300 shadow-xs'
                  : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
              }`}
            >
              <ShieldAlert size={18} className="text-danger-400" />
              <div className="text-left">
                <div>Revoke Exception</div>
                <div className="text-[10px] font-normal text-danger-300/70">
                  Denies a permission even if role grants it
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Target Permission */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Target Permission <span className="text-danger-500">*</span>
          </label>
          <CustomSelector
            options={permissionOptions}
            value={formData.permissionKey}
            onChange={(val) => setFormData({ ...formData, permissionKey: val })}
            error={errors.permissionKey}
            placeholder="Select a permission..."
            isClearable={false}
          />
        </div>

        {/* Branch Scope */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
            <Building size={13} className="text-primary-500" />
            Branch Scope (Optional)
          </label>
          <CustomSelector
            options={branchOptions}
            value={formData.branchId}
            onChange={(val) => setFormData({ ...formData, branchId: val })}
            placeholder="All Branches (Organization-wide)"
            isClearable={true}
          />
          <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
            Scope exception to a specific branch or leave blank for all organization branches.
          </span>
        </div>

        {/* Expiration Date & Presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
              <Calendar size={13} className="text-primary-500" />
              Expiration Date & Time (Optional)
            </label>
            <div className="flex items-center gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => handleSetPresetExpiry(24)}
                className="px-1.5 py-0.5 rounded bg-[var(--bg-input)] border border-[var(--border-color)] hover:bg-white/10 text-[var(--text-secondary)] cursor-pointer"
              >
                +24h
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetExpiry(24 * 7)}
                className="px-1.5 py-0.5 rounded bg-[var(--bg-input)] border border-[var(--border-color)] hover:bg-white/10 text-[var(--text-secondary)] cursor-pointer"
              >
                +7d
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetExpiry(24 * 30)}
                className="px-1.5 py-0.5 rounded bg-[var(--bg-input)] border border-[var(--border-color)] hover:bg-white/10 text-[var(--text-secondary)] cursor-pointer"
              >
                +30d
              </button>
              <button
                type="button"
                onClick={() => handleSetPresetExpiry(null)}
                className="px-1.5 py-0.5 rounded bg-[var(--bg-input)] border border-[var(--border-color)] hover:bg-white/10 text-[var(--text-secondary)] cursor-pointer"
              >
                Permanent
              </button>
            </div>
          </div>
          <Input
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            error={errors.expiresAt}
          />
        </div>

        {/* Mandatory Reason */}
        <Textarea
          label="Mandatory Justification / Reason"
          placeholder="Document the operational reason for granting or revoking this permission exception (e.g. Temporary leave coverage, audit restriction)..."
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          error={errors.reason}
          rows={3}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            Apply Permission Exception
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffOverrideModal;
