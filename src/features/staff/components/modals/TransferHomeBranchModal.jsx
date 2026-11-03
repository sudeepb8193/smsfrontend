import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import CustomSelector from '../../../../components/shared/CustomSelector';
import DatePicker from '../../../../components/shared/DatePicker';
import Input from '../../../../components/shared/Input';

export function TransferHomeBranchModal({
  isOpen,
  onClose,
  branches = [],
  currentHomeBranch,
  onTransfer,
  loading,
}) {
  const eligibleBranches = branches.filter(
    (b) => b.id !== currentHomeBranch?.id && b.status !== 'permanently_closed',
  );

  const [newBranchId, setNewBranchId] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!newBranchId) errs.newBranchId = 'Please select a new destination Home Branch';
    if (!effectiveFrom) errs.effectiveFrom = 'Effective transfer date is required';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onTransfer({
      newBranchId,
      effectiveFrom,
      reason: reason || undefined,
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
      title="Transfer Home Branch"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="transfer-branch-form"
            onClick={handleSubmit}
            variant="primary"
            loading={loading}
          >
            Confirm Transfer
          </Button>
        </div>
      }
    >
      <form id="transfer-branch-form" noValidate onSubmit={handleSubmit} className="space-y-4 pb-12">
        <div className="p-3 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] text-sm">
          <span className="text-[var(--text-muted)]">Current Home Branch:</span>{' '}
          <strong className="text-[var(--text-primary)]">
            {currentHomeBranch?.name} ({currentHomeBranch?.code})
          </strong>
        </div>

        <div>
          <CustomSelector
            label="New Home Branch"
            placeholder="Search and select new home branch..."
            value={newBranchId}
            onChange={(val) => {
              setNewBranchId(val);
              if (errors.newBranchId) setErrors((prev) => ({ ...prev, newBranchId: undefined }));
            }}
            options={branchOptions}
            isSearchable={true}
            isClearable={false}
            error={errors.newBranchId}
            required
          />
        </div>

        <div>
          <DatePicker
            label="Effective Transfer Date"
            value={effectiveFrom}
            onChange={(val) => {
              setEffectiveFrom(val?.target?.value ?? val);
              if (errors.effectiveFrom) setErrors((prev) => ({ ...prev, effectiveFrom: undefined }));
            }}
            error={errors.effectiveFrom}
            required
            helperText="If future-dated, this transfer will be scheduled and become effective on the designated date."
          />
        </div>

        <div>
          <Input
            label="Transfer Reason (Optional)"
            value={reason}
            maxLength={255}
            showCharCount
            onChange={(e) => setReason(e.target.value.slice(0, 255))}
            placeholder="e.g. Relocation, Branch opening requirement, Staff reassignment"
          />
        </div>
      </form>
    </Modal>
  );
}

export default TransferHomeBranchModal;
