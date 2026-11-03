import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import CustomSelector from '../../../../components/shared/CustomSelector';
import Textarea from '../../../../components/shared/Textarea';

export function StatusChangeModal({ isOpen, onClose, staff, onConfirm, loading }) {
  const [status, setStatus] = useState(staff?.employmentStatus || 'active');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((status === 'terminated' || status === 'suspended') && !reason.trim()) {
      setError('A documented reason is required when suspending or terminating an employee');
      return;
    }
    setError('');
    onConfirm(status, reason.trim() || undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Change Employment Status – ${staff?.fullName || ''}`}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="status-change-form"
            onClick={handleSubmit}
            variant="primary"
            loading={loading}
          >
            Update Status
          </Button>
        </div>
      }
    >
      <form id="status-change-form" noValidate onSubmit={handleSubmit} className="space-y-4">
        <div>
          <CustomSelector
            label="Employment Status"
            value={status}
            onChange={(val) => {
              setStatus(val);
              if (error) setError('');
            }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'on_leave', label: 'On Leave' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'terminated', label: 'Terminated' },
            ]}
            isSearchable={false}
            isClearable={false}
          />
        </div>

        <div>
          <Textarea
            label="Reason for Status Change"
            value={reason}
            maxLength={255}
            showCharCount
            onChange={(e) => {
              setReason(e.target.value.slice(0, 255));
              if (error) setError('');
            }}
            placeholder="e.g. Parental leave, medical leave, resignation, contract completion..."
            rows={3}
            error={error}
            required={status === 'terminated' || status === 'suspended'}
          />
        </div>
      </form>
    </Modal>
  );
}

export default StatusChangeModal;
