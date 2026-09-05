import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { AddTaxProfileModal } from './AddTaxProfileModal';
import { Button } from '../../../components/common/Button/Button';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { Loader } from '../../../components/common/Loader/Loader';

export const TaxProfileSection = ({ organizationId, isReadOnly }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

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
        {!isReadOnly && (
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

      {loading ? (
        <Loader text="Loading tax profiles..." size="large" />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
          {error}
        </div>
      ) : profiles.length === 0 ? (
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
                    className="inline-flex items-center gap-1 text-xs text-[#8A4A52] hover:underline pt-1"
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

      <AddTaxProfileModal
        orgId={organizationId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadProfiles}
      />
    </div>
  );
};
