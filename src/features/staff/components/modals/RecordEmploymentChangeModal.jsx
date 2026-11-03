import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';
import DatePicker from '../../../../components/shared/DatePicker';

export function RecordEmploymentChangeModal({
  isOpen,
  onClose,
  staff,
  onRecord,
  loading,
}) {
  const current = staff?.currentEmployment || {};

  const [designation, setDesignation] = useState(current.designation || '');
  const [department, setDepartment] = useState(current.department || '');
  const [employmentType, setEmploymentType] = useState(
    current.employmentType || 'full_time',
  );
  const [changeReason, setChangeReason] = useState('promotion');
  const [joiningDate, setJoiningDate] = useState(
    current.joiningDate ? current.joiningDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [confirmationDate, setConfirmationDate] = useState(
    current.confirmationDate ? current.confirmationDate.slice(0, 10) : '',
  );
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!designation.trim()) errs.designation = 'Designation is required';
    if (!department.trim()) errs.department = 'Department is required';
    if (!effectiveFrom) errs.effectiveFrom = 'Effective date is required';
    if (joiningDate && confirmationDate && confirmationDate < joiningDate) {
      errs.confirmationDate = 'Confirmation date cannot be before joining date';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onRecord({
      designation: designation.trim(),
      department: department.trim(),
      employmentType,
      changeReason,
      joiningDate,
      effectiveFrom,
      confirmationDate: confirmationDate || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Employment Change – ${staff?.fullName || ''}`}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="employment-change-form"
            onClick={handleSubmit}
            variant="primary"
            loading={loading}
          >
            Record Change
          </Button>
        </div>
      }
    >
      <form id="employment-change-form" noValidate onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <CustomSelector
              label="Change Reason"
              value={changeReason}
              onChange={(val) => setChangeReason(val)}
              options={[
                { value: 'promotion', label: 'Promotion' },
                { value: 'transfer', label: 'Department Transfer' },
                { value: 'restructure', label: 'Organizational Restructure' },
                { value: 'correction', label: 'Record Correction' },
              ]}
              isSearchable={false}
              isClearable={false}
              required
            />
          </div>

          <div>
            <CustomSelector
              label="Employment Type"
              value={employmentType}
              onChange={(val) => setEmploymentType(val)}
              options={[
                { value: 'full_time', label: 'Full-time' },
                { value: 'part_time', label: 'Part-time' },
                { value: 'contract', label: 'Contract' },
                { value: 'intern', label: 'Intern' },
              ]}
              isSearchable={false}
              isClearable={false}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="New / Updated Designation"
              value={designation}
              maxLength={100}
              showCharCount
              onChange={(e) => {
                setDesignation(e.target.value.slice(0, 100));
                if (errors.designation) setErrors((prev) => ({ ...prev, designation: undefined }));
              }}
              placeholder="e.g. Senior Master Stylist"
              error={errors.designation}
              required
            />
          </div>

          <div>
            <Input
              label="Department"
              value={department}
              maxLength={100}
              showCharCount
              onChange={(e) => {
                setDepartment(e.target.value.slice(0, 100));
                if (errors.department) setErrors((prev) => ({ ...prev, department: undefined }));
              }}
              placeholder="e.g. Hair Care, Skin & Spa"
              error={errors.department}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <DatePicker
              label="Effective Date"
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
              label="Original Joining Date"
              value={joiningDate}
              onChange={(val) => setJoiningDate(val?.target?.value ?? val)}
            />
          </div>

          <div>
            <DatePicker
              label="Confirmation Date"
              value={confirmationDate}
              onChange={(val) => {
                setConfirmationDate(val?.target?.value ?? val);
                if (errors.confirmationDate) setErrors((prev) => ({ ...prev, confirmationDate: undefined }));
              }}
              error={errors.confirmationDate}
            />
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-input)] p-2.5 rounded-lg border border-[var(--border-color)]">
          Past employment records are immutable. Recording a change preserves the complete career timeline without overwriting historical data.
        </p>
      </form>
    </Modal>
  );
}

export default RecordEmploymentChangeModal;
