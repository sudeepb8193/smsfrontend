import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import CustomSelector from '../../../../components/shared/CustomSelector';
import DatePicker from '../../../../components/shared/DatePicker';

export function AddBranchAssignmentModal({
  isOpen,
  onClose,
  branches = [],
  currentBranchId,
  onSave,
  loading,
}) {
  const eligibleBranches = branches.filter(
    (b) => b.id !== currentBranchId && b.status !== 'permanently_closed',
  );

  const [branchId, setBranchId] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [effectiveTo, setEffectiveTo] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!branchId) errs.branchId = 'Please select a target branch';
    if (!effectiveFrom) errs.effectiveFrom = 'Effective date is required';
    if (effectiveFrom && effectiveTo && effectiveTo < effectiveFrom) {
      errs.effectiveTo = 'Effective to date cannot be before effective from date';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSave({
      branchId,
      assignmentType: 'secondary',
      effectiveFrom,
      effectiveTo: effectiveTo || undefined,
    });
  };

  const branchOptions = eligibleBranches.map((b) => ({
    value: b.id,
    label: `${b.name} (${b.code})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Secondary Branch"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="assign-branch-form"
            onClick={handleSubmit}
            variant="primary"
            loading={loading}
          >
            Assign Branch
          </Button>
        </div>
      }
    >
      <form id="assign-branch-form" noValidate onSubmit={handleSubmit} className="space-y-4 pb-12">
        <p className="text-sm text-[var(--text-secondary)]">
          Secondary branch access allows the employee to take appointments and shifts at another branch while retaining their designated Home Branch.
        </p>

        <div>
          <CustomSelector
            label="Target Branch"
            placeholder="Search and select branch..."
            value={branchId}
            onChange={(val) => {
              setBranchId(val);
              if (errors.branchId) setErrors((prev) => ({ ...prev, branchId: undefined }));
            }}
            options={branchOptions}
            isSearchable={true}
            isClearable={false}
            error={errors.branchId}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <DatePicker
              label="Effective From"
              value={effectiveFrom}
              onChange={(val) => {
                setEffectiveFrom(val?.target?.value ?? val);
                if (errors.effectiveFrom) setErrors((prev) => ({ ...prev, effectiveFrom: undefined }));
              }}
              error={errors.effectiveFrom}
              required
            />
          </div>

          <div>
            <DatePicker
              label="Effective To (Optional)"
              value={effectiveTo}
              onChange={(val) => {
                setEffectiveTo(val?.target?.value ?? val);
                if (errors.effectiveTo) setErrors((prev) => ({ ...prev, effectiveTo: undefined }));
              }}
              error={errors.effectiveTo}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default AddBranchAssignmentModal;
