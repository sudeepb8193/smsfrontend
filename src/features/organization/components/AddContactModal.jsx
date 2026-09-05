import React, { useState } from 'react';
import { UserCheck, Sparkles } from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { Modal } from '../../../components/common/Modal/Modal';
import { Input } from '../../../components/common/Input/Input';
import { Select } from '../../../components/common/Select/Select';
import { Button } from '../../../components/common/Button/Button';

export const AddContactModal = ({ orgId, isOpen, onClose, onSuccess, primaryContact }) => {
  const [formData, setFormData] = useState({
    contactType: 'primary',
    sameAsPrimary: false,
    fullName: '',
    designation: '',
    phoneCountryCode: '+1',
    phoneNumber: '',
    email: '',
    isDefaultPublic: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await organizationApi.createContact(orgId, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create contact');
    } finally {
      setLoading(false);
    }
  };

  const footerButtons = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="add-contact-form"
        variant="primary"
        loading={loading}
        icon={Sparkles}
      >
        Save Contact
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Contact Profile"
      size="medium"
      footer={footerButtons}
    >
      <form id="add-contact-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Contact Type"
            value={formData.contactType}
            onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
            options={[
              { value: 'primary', label: 'Primary' },
              { value: 'support', label: 'Support' },
              { value: 'billing', label: 'Billing' },
              { value: 'emergency', label: 'Emergency' },
            ]}
          />

          <div className="flex items-center pt-5">
            {formData.contactType !== 'primary' && primaryContact && (
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sameAsPrimary}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sameAsPrimary: e.target.checked,
                      fullName: e.target.checked ? primaryContact.fullName : formData.fullName,
                      email: e.target.checked ? primaryContact.email || '' : formData.email,
                      phoneNumber: e.target.checked ? primaryContact.phoneNumber || '' : formData.phoneNumber,
                      phoneCountryCode: e.target.checked ? primaryContact.phoneCountryCode || '+1' : formData.phoneCountryCode,
                    })
                  }
                  className="rounded border-[var(--border-color)] text-primary-600 focus:ring-0 bg-[var(--bg-input)]"
                />
                <span>Same as Primary Contact</span>
              </label>
            )}
          </div>
        </div>

        <Input
          label="Full Name"
          required={!formData.sameAsPrimary}
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="e.g. Sarah Jenkins"
        />

        <Input
          label="Designation / Title"
          value={formData.designation}
          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          placeholder="e.g. General Salon Manager"
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Country Code"
            value={formData.phoneCountryCode}
            onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
            placeholder="+1"
          />
          <div className="col-span-2">
            <Input
              label="Phone Number (E.164)"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="5551234567"
            />
          </div>
        </div>

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="sarah@salon.com"
        />

        <label className="flex items-center gap-2 pt-2 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isDefaultPublic}
            onChange={(e) => setFormData({ ...formData, isDefaultPublic: e.target.checked })}
            className="rounded border-[var(--border-color)] text-primary-600 focus:ring-0 bg-[var(--bg-input)]"
          />
          <span>Set as Default Public Contact for this type</span>
        </label>
      </form>
    </Modal>
  );
};
