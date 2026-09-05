import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { Modal } from '../../../components/common/Modal/Modal';
import { Input } from '../../../components/common/Input/Input';
import { Select } from '../../../components/common/Select/Select';
import { Button } from '../../../components/common/Button/Button';

export const AddAddressModal = ({ orgId, isOpen, onClose, onSuccess, registeredAddress }) => {
  const [formData, setFormData] = useState({
    addressType: 'registered',
    sameAsRegistered: false,
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    countryCode: 'US',
    latitude: '',
    longitude: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };
      await organizationApi.createAddress(orgId, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add address');
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
        form="add-address-form"
        variant="primary"
        loading={loading}
        icon={Sparkles}
      >
        Save Address
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Organization Address"
      size="medium"
      footer={footerButtons}
    >
      <form id="add-address-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Address Type"
            value={formData.addressType}
            onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
            options={[
              { value: 'registered', label: 'Registered Office' },
              { value: 'billing', label: 'Billing Office' },
            ]}
          />

          <div className="flex items-center pt-5">
            {formData.addressType === 'billing' && registeredAddress && (
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sameAsRegistered}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sameAsRegistered: e.target.checked,
                      addressLine1: e.target.checked ? registeredAddress.addressLine1 : formData.addressLine1,
                      addressLine2: e.target.checked ? registeredAddress.addressLine2 || '' : formData.addressLine2,
                      landmark: e.target.checked ? registeredAddress.landmark || '' : formData.landmark,
                      city: e.target.checked ? registeredAddress.city : formData.city,
                      state: e.target.checked ? registeredAddress.state : formData.state,
                      postalCode: e.target.checked ? registeredAddress.postalCode : formData.postalCode,
                      countryCode: e.target.checked ? registeredAddress.countryCode : formData.countryCode,
                    })
                  }
                  className="rounded border-[var(--border-color)] text-primary-600 focus:ring-0 bg-[var(--bg-input)]"
                />
                <span>Same as Registered Office</span>
              </label>
            )}
          </div>
        </div>

        <Input
          label="Address Line 1"
          required={!formData.sameAsRegistered}
          value={formData.addressLine1}
          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          placeholder="e.g. 500 Fifth Avenue, Suite 1200"
        />

        <Input
          label="Address Line 2 (Optional)"
          value={formData.addressLine2}
          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
          placeholder="Building B, Floor 3"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            required={!formData.sameAsRegistered}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="New York"
          />
          <Input
            label="State / Province"
            required={!formData.sameAsRegistered}
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="NY"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Postal / Zip Code"
            required={!formData.sameAsRegistered}
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            placeholder="10018"
          />
          <Select
            label="Country (ISO 2-letter)"
            value={formData.countryCode}
            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
            options={[
              { value: 'US', label: 'United States (US)' },
              { value: 'IN', label: 'India (IN)' },
              { value: 'GB', label: 'United Kingdom (GB)' },
              { value: 'CA', label: 'Canada (CA)' },
              { value: 'AU', label: 'Australia (AU)' },
              { value: 'AE', label: 'United Arab Emirates (AE)' },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
};
