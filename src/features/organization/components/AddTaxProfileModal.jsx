import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { Modal } from '../../../components/common/Modal/Modal';
import { Input } from '../../../components/common/Input/Input';
import { Select } from '../../../components/common/Select/Select';
import { Button } from '../../../components/common/Button/Button';

export const AddTaxProfileModal = ({ orgId, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    taxIdentifierType: 'gstin',
    taxIdentifierNumber: '',
    registeredBusinessName: '',
    taxRegistrationDate: '',
    isTaxExempt: false,
    documentUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await organizationApi.createTaxProfile(orgId, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create tax profile');
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
        form="add-tax-form"
        variant="primary"
        loading={loading}
        icon={Sparkles}
      >
        Save Profile
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Tax Registration Profile"
      size="medium"
      footer={footerButtons}
    >
      <form id="add-tax-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tax Identifier Type"
            value={formData.taxIdentifierType}
            onChange={(e) => setFormData({ ...formData, taxIdentifierType: e.target.value })}
            options={[
              { value: 'gstin', label: 'GSTIN (India)' },
              { value: 'pan', label: 'PAN (India)' },
              { value: 'ein', label: 'EIN (US)' },
              { value: 'vat', label: 'VAT (UK/EU)' },
              { value: 'tin', label: 'TIN' },
              { value: 'other', label: 'Other' },
            ]}
          />

          <Input
            label="Tax Number / Code"
            required
            value={formData.taxIdentifierNumber}
            onChange={(e) => setFormData({ ...formData, taxIdentifierNumber: e.target.value.toUpperCase() })}
            placeholder="e.g. 22AAAAA0000A1Z5"
          />
        </div>

        <Input
          label="Registered Business Name for Tax"
          required
          value={formData.registeredBusinessName}
          onChange={(e) => setFormData({ ...formData, registeredBusinessName: e.target.value })}
          placeholder="Legal entity registered with tax department"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tax Registration Date"
            type="date"
            value={formData.taxRegistrationDate}
            onChange={(e) => setFormData({ ...formData, taxRegistrationDate: e.target.value })}
          />

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isTaxExempt}
                onChange={(e) => setFormData({ ...formData, isTaxExempt: e.target.checked })}
                className="rounded border-[var(--border-color)] text-primary-600 focus:ring-0 bg-[var(--bg-input)]"
              />
              <span>Is Tax Exempt Entity</span>
            </label>
          </div>
        </div>

        <Input
          label="Supporting Document URL (PDF/Image)"
          type="url"
          value={formData.documentUrl}
          onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
          placeholder="https://storage.salon.com/tax-cert.pdf"
        />
      </form>
    </Modal>
  );
};
