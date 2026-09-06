import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Building, Sparkles, X } from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { Button } from '../../../components/common/Button/Button';
import { Input } from '../../../components/common/Input/Input';
import { Select } from '../../../components/common/Select/Select';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { Loader } from '../../../components/common/Loader/Loader';

export const AddressManagementSection = ({ organizationId, isReadOnly }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(true);

  // Inline Address Form State
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizationApi.getAddresses(organizationId);
      setAddresses(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) loadAddresses();
  }, [organizationId]);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const reg = addresses.find((a) => a.addressType === 'registered') || addresses[0];
      setFormData({
        addressType: reg.addressType || 'registered',
        sameAsRegistered: false,
        addressLine1: reg.addressLine1 || '',
        addressLine2: reg.addressLine2 || '',
        landmark: reg.landmark || '',
        city: reg.city || '',
        state: reg.state || '',
        postalCode: reg.postalCode || '',
        countryCode: reg.countryCode || 'US',
      });
    }
  }, [addresses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await organizationApi.deleteAddress(organizationId, id);
      loadAddresses();
    } catch (err) {
      alert(err.message || 'Failed to delete address');
    }
  };

  const registeredAddress = addresses.find((a) => a.addressType === 'registered');

  const handleInlineSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await organizationApi.createAddress(organizationId, formData);
      setFormData({
        addressType: 'registered',
        sameAsRegistered: false,
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        postalCode: '',
        countryCode: 'US',
      });
      setIsAddOpen(false);
      loadAddresses();
    } catch (err) {
      setFormError(err.message || 'Failed to add address');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <MapPin size={20} className="text-primary-500" />
            Organization Registered Addresses
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Configure registered office and billing addresses for invoices and regulatory tax compliance
          </p>
        </div>
        {!isReadOnly && !isAddOpen && (
          <Button
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            icon={Plus}
            size="medium"
          >
            Add Address Record
          </Button>
        )}
      </div>

      {/* Embedded Inline Form Card */}
      {isAddOpen && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-5 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MapPin size={18} className="text-primary-500" />
              Add Organization Address
            </h4>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition"
              title="Close form"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleInlineSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
              <Button type="button" variant="secondary" size="small" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="small" loading={submitting} icon={Sparkles}>
                Save Address
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Loader text="Loading addresses..." size="large" />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
          {error}
        </div>
      ) : addresses.length === 0 && !isAddOpen ? (
        <EmptyState
          icon={Building}
          title="No registered office address configured"
          description="A Registered Office address is mandatory for organization setup."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 hover:border-primary-500/50 transition"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    a.addressType === 'registered'
                      ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400 border border-primary-500/30'
                      : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                  }`}
                >
                  {a.addressType === 'registered' ? 'Registered Office' : 'Billing Office'}
                </span>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete Address"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                <p className="font-semibold text-[var(--text-primary)] text-sm">{a.addressLine1}</p>
                {a.addressLine2 && <p>{a.addressLine2}</p>}
                {a.landmark && <p className="text-[var(--text-muted)]">Landmark: {a.landmark}</p>}
                <p>
                  {a.city}, {a.state} {a.postalCode}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-[10px] font-bold">
                    ISO: {a.countryCode}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManagementSection;
