import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Building, RefreshCw, CheckCircle2 } from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { AddAddressModal } from './AddAddressModal';
import { Button } from '../../../components/common/Button/Button';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { Loader } from '../../../components/common/Loader/Loader';

export const AddressManagementSection = ({ organizationId, isReadOnly }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

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
        {!isReadOnly && (
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

      {loading ? (
        <Loader text="Loading addresses..." size="large" />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
          {error}
        </div>
      ) : addresses.length === 0 ? (
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

      <AddAddressModal
        orgId={organizationId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadAddresses}
        registeredAddress={registeredAddress}
      />
    </div>
  );
};
