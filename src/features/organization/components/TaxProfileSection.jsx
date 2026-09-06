import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { Button } from '../../../components/common/Button/Button';
import { Input } from '../../../components/common/Input/Input';
import { Select } from '../../../components/common/Select/Select';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { Loader } from '../../../components/common/Loader/Loader';

export const TaxProfileSection = ({ organizationId, isReadOnly }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Inline Form State
  const [formData, setFormData] = useState({
    taxIdentifierType: 'gstin',
    taxIdentifierNumber: '',
    registeredBusinessName: '',
    taxRegistrationDate: '',
    isTaxExempt: false,
    documentUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizationApi.getTaxProfiles(organizationId);
      setProfiles(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load tax profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) loadProfiles();
  }, [organizationId]);

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      const p = profiles[0];
      setFormData({
        taxIdentifierType: p.taxIdentifierType || 'gstin',
        taxIdentifierNumber: p.taxIdentifierNumber || '',
        registeredBusinessName: p.registeredBusinessName || '',
        taxRegistrationDate: p.taxRegistrationDate ? p.taxRegistrationDate.substring(0, 10) : '',
        isTaxExempt: p.isTaxExempt || false,
        documentUrl: p.documentUrl || '',
      });
    }
  }, [profiles]);

  const handleVerify = async (taxId) => {
    setActionLoading(taxId);
    try {
      await organizationApi.verifyTaxProfile(organizationId, taxId);
      loadProfiles();
    } catch (err) {
      alert(err.message || 'Failed to verify tax profile');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (taxId) => {
    const notes = window.prompt('Enter rejection reason notes:');
    if (!notes) return;
    setActionLoading(taxId);
    try {
      await organizationApi.rejectTaxProfile(organizationId, taxId, notes);
      loadProfiles();
    } catch (err) {
      alert(err.message || 'Failed to reject tax profile');
    } finally {
      setActionLoading(null);
    }
  };

  const handleInlineSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await organizationApi.createTaxProfile(organizationId, formData);
      setFormData({
        taxIdentifierType: 'gstin',
        taxIdentifierNumber: '',
        registeredBusinessName: '',
        taxRegistrationDate: '',
        isTaxExempt: false,
        documentUrl: '',
      });
      setIsAddOpen(false);
      loadProfiles();
    } catch (err) {
      setFormError(err.message || 'Failed to create tax profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FileText size={20} className="text-primary-500" />
            Tax Information & Registration Profiles
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Manage GSTIN, PAN, EIN, VAT registration codes and document verification
          </p>
        </div>
        {!isReadOnly && !isAddOpen && (
          <Button
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            icon={Plus}
            size="medium"
          >
            Add Tax Profile
          </Button>
        )}
      </div>

      {/* Embedded Inline Form Card */}
      {isAddOpen && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-5 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <FileText size={18} className="text-primary-500" />
              Add Tax Registration Profile
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
              <Button type="button" variant="secondary" size="small" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="small" loading={submitting} icon={Sparkles}>
                Save Tax Profile
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Loader text="Loading tax profiles..." size="large" />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
          {error}
        </div>
      ) : profiles.length === 0 && !isAddOpen ? (
        <EmptyState
          icon={FileText}
          title="No tax registration profiles added"
          description="Configure GSTIN, EIN or VAT profiles for tax billing suppression rules."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 hover:border-primary-500/50 transition"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-500 border border-primary-500/30 text-xs font-bold uppercase tracking-wider">
                  {p.taxIdentifierType}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    p.verificationStatus === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : p.verificationStatus === 'rejected'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {p.verificationStatus === 'verified' && <CheckCircle2 size={12} />}
                  {p.verificationStatus === 'rejected' && <XCircle size={12} />}
                  {p.verificationStatus === 'pending' && <Clock size={12} />}
                  {p.verificationStatus}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                <p className="text-[var(--text-primary)] font-mono text-base font-bold tracking-wider">{p.taxIdentifierNumber}</p>
                <p className="text-[var(--text-primary)] font-medium">{p.registeredBusinessName}</p>
                {p.isTaxExempt && (
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                    Tax Exempt Entity
                  </span>
                )}
                {p.verificationNotes && (
                  <p className="text-rose-400 text-[11px]">Rejection note: {p.verificationNotes}</p>
                )}
                {p.documentUrl && (
                  <a
                    href={p.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-500 hover:underline pt-1"
                  >
                    View Attached Tax Document <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {!isReadOnly && p.verificationStatus === 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
                  <Button
                    type="button"
                    variant="success"
                    size="sm"
                    fullWidth
                    onClick={() => handleVerify(p.id)}
                    isLoading={actionLoading === p.id}
                    icon={ShieldCheck}
                  >
                    Verify Profile
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    fullWidth
                    onClick={() => handleReject(p.id)}
                    disabled={actionLoading === p.id}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaxProfileSection;
