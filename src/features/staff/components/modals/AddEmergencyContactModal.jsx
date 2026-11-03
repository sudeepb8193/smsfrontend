import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';

export function AddEmergencyContactModal({
  isOpen,
  onClose,
  onSave,
  loading,
  initialData,
}) {
  const [contactName, setContactName] = useState(initialData?.contactName || '');
  const [relationship, setRelationship] = useState(initialData?.relationship || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [priority, setPriority] = useState(initialData?.priority || 'secondary');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!contactName.trim()) errs.contactName = 'Contact full name is required';
    if (!relationship.trim()) errs.relationship = 'Relationship is required';
    if (!phoneNumber.trim()) {
      errs.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(phoneNumber.trim())) {
      errs.phoneNumber = 'Please enter a valid phone number (at least 7 digits)';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSave({
      contactName: contactName.trim(),
      relationship: relationship.trim(),
      phoneNumber: phoneNumber.trim(),
      priority,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="emergency-contact-form"
            onClick={handleSubmit}
            variant="primary"
            loading={loading}
          >
            {initialData ? 'Update Contact' : 'Save Contact'}
          </Button>
        </div>
      }
    >
      <form id="emergency-contact-form" noValidate onSubmit={handleSubmit} className="space-y-4 pb-4">
        <div>
          <Input
            label="Contact Full Name"
            value={contactName}
            maxLength={120}
            showCharCount
            onChange={(e) => {
              setContactName(e.target.value.slice(0, 120));
              if (errors.contactName) setErrors((prev) => ({ ...prev, contactName: undefined }));
            }}
            placeholder="e.g. Jane Doe"
            error={errors.contactName}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Relationship"
              value={relationship}
              maxLength={60}
              showCharCount
              onChange={(e) => {
                setRelationship(e.target.value.slice(0, 60));
                if (errors.relationship) setErrors((prev) => ({ ...prev, relationship: undefined }));
              }}
              placeholder="e.g. Spouse, Parent, Sibling"
              error={errors.relationship}
              required
            />
          </div>

          <div>
            <Input
              label="Phone Number"
              value={phoneNumber}
              maxLength={20}
              showCharCount
              onChange={(e) => {
                setPhoneNumber(e.target.value.slice(0, 20));
                if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
              }}
              placeholder="+91 9876543210"
              error={errors.phoneNumber}
              required
            />
          </div>
        </div>

        <div>
          <CustomSelector
            label="Contact Priority"
            value={priority}
            onChange={(val) => setPriority(val)}
            options={[
              { value: 'primary', label: 'Primary Contact' },
              { value: 'secondary', label: 'Secondary Contact' },
            ]}
            isSearchable={false}
            isClearable={false}
            helperText="Setting this contact as Primary will automatically designate other contacts as Secondary."
          />
        </div>
      </form>
    </Modal>
  );
}

export default AddEmergencyContactModal;
