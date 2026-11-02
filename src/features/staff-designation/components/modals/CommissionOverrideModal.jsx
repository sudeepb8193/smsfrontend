import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { DollarSign, Percent, Calendar } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed Amount (₹)' },
];

export default function CommissionOverrideModal({
  isOpen,
  onClose,
  onSave,
  assignedServices = [],
  initialData = null,
  loading = false,
}) {
  const [scope, setScope] = useState(initialData?.serviceId ? 'service' : 'staff_wide');
  const [serviceId, setServiceId] = useState(initialData?.serviceId || '');
  const [commissionType, setCommissionType] = useState(
    initialData?.commissionType || 'percentage',
  );
  const [commissionValue, setCommissionValue] = useState(
    initialData?.commissionValue !== undefined && initialData?.commissionValue !== null
      ? initialData.commissionValue
      : '',
  );
  const [effectiveFrom, setEffectiveFrom] = useState(
    initialData?.effectiveFrom
      ? new Date(initialData.effectiveFrom).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  );
  const [effectiveTo, setEffectiveTo] = useState(
    initialData?.effectiveTo
      ? new Date(initialData.effectiveTo).toISOString().split('T')[0]
      : '',
  );
  const [error, setError] = useState('');

  const serviceOptions = assignedServices.map((as) => ({
    value: as.serviceId,
    label: `${as.serviceName} (${as.categoryName || 'General'})`,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (scope === 'service' && !serviceId) {
      setError('Please select a service for service-specific override');
      return;
    }

    const val = parseFloat(commissionValue);
    if (isNaN(val) || val < 0) {
      setError('Please enter a valid positive commission value');
      return;
    }

    if (commissionType === 'percentage' && val > 100) {
      setError('Commission percentage cannot exceed 100%');
      return;
    }

    if (!effectiveFrom) {
      setError('Effective From date is required');
      return;
    }

    if (effectiveTo && effectiveTo < effectiveFrom) {
      setError('Effective To date cannot be earlier than Effective From date');
      return;
    }

    onSave({
      serviceId: scope === 'service' ? serviceId : null,
      commissionType,
      commissionValue: val,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Update Commission Override' : 'New Commission Override'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Scope Selector */}
        {!initialData && (
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Override Scope
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScope('staff_wide')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  scope === 'staff_wide'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-600 font-bold'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]'
                }`}
              >
                Staff-Wide Default
              </button>
              <button
                type="button"
                onClick={() => setScope('service')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  scope === 'service'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-600 font-bold'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)]'
                }`}
              >
                Specific Service
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              {scope === 'staff_wide'
                ? 'Applies to all eligible services unless overridden by a service-specific rate.'
                : 'Applies only to the selected service, taking precedence over the staff-wide rate.'}
            </p>
          </div>
        )}

        {scope === 'service' && !initialData && (
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Target Service <span className="text-rose-500">*</span>
            </label>
            <CustomSelector
              options={serviceOptions}
              value={serviceId}
              onChange={(val) => setServiceId(val)}
              placeholder="Select assigned service..."
            />
          </div>
        )}

        {/* Type & Value */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Commission Type
            </label>
            <CustomSelector
              options={TYPE_OPTIONS}
              value={commissionType}
              onChange={(val) => setCommissionType(val)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Rate Value <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0"
                max={commissionType === 'percentage' ? '100' : undefined}
                placeholder={commissionType === 'percentage' ? 'e.g. 12.5' : 'e.g. 250'}
                value={commissionValue}
                onChange={(e) => setCommissionValue(e.target.value)}
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">
                {commissionType === 'percentage' ? '%' : '₹'}
              </span>
            </div>
          </div>
        </div>

        {/* Effective Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Effective From <span className="text-rose-500">*</span>
            </label>
            <Input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Effective To (Optional)
            </label>
            <Input
              type="date"
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
            />
            <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
              Leave blank for ongoing.
            </span>
          </div>
        </div>

        {/* Live Preview */}
        {commissionValue && (
          <div className="p-3.5 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-xs">
            <span className="font-extrabold text-primary-700 dark:text-primary-300 block mb-0.5">
              Preview Resolution:
            </span>
            <span className="text-[var(--text-secondary)]">
              This staff member will earn{' '}
              <strong className="text-[var(--text-primary)]">
                {commissionValue}
                {commissionType === 'percentage' ? '%' : ' ₹'}
              </strong>{' '}
              commission on{' '}
              {scope === 'service'
                ? 'the selected service'
                : 'all eligible services'}{' '}
              effective from {effectiveFrom}{' '}
              {effectiveTo ? `until ${effectiveTo}` : '(ongoing)'}.
            </span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {initialData ? 'Update Override' : 'Save Override'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

