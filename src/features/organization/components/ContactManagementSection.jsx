import { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ShieldCheck,
  Star,
  RefreshCw,
} from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { AddContactModal } from './AddContactModal';
import { ContactVerificationModal } from './ContactVerificationModal';
import { Button } from '../../../components/common/Button/Button';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { Loader } from '../../../components/common/Loader/Loader';

export const ContactManagementSection = ({ organizationId, isReadOnly }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [verifyModal, setVerifyModal] = useState({ isOpen: false, contact: null, type: 'email' });

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizationApi.getContacts(organizationId);
      setContacts(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) loadContacts();
  }, [organizationId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await organizationApi.deleteContact(organizationId, id);
      loadContacts();
    } catch (err) {
      alert(err.message || 'Failed to delete contact');
    }
  };

  const primaryContact = contacts.find((c) => c.contactType === 'primary');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <UserCheck size={20} className="text-primary-500" />
            Organization Contact Directory
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Manage primary, support, billing, and emergency contacts with phone/email verification
          </p>
        </div>
        {!isReadOnly && (
          <Button
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            icon={Plus}
            size="medium"
          >
            Add Contact Profile
          </Button>
        )}
      </div>

      {loading ? (
        <Loader text="Loading contacts..." size="large" />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
          {error}
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No contacts created yet"
          description="At least one Primary contact is required for salon activation."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 hover:border-primary-500/50 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{c.fullName}</h4>
                    {c.isDefaultPublic && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                        <Star size={10} /> Public Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{c.designation || 'No Designation'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.contactType === 'primary'
                        ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400 border border-primary-500/30'
                        : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}
                  >
                    {c.contactType}
                  </span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Contact"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {/* Phone verification row */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Phone size={14} className="text-primary-500" />
                    <span>{c.phoneCountryCode ? `${c.phoneCountryCode} ` : ''}{c.phoneNumber || 'No Phone'}</span>
                  </div>
                  {c.phoneNumber && (
                    c.phoneVerifiedAt ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    ) : (
                      !isReadOnly && (
                        <Button
                          type="button"
                          variant="warning"
                          size="xs"
                          onClick={() => setVerifyModal({ isOpen: true, contact: c, type: 'phone' })}
                          icon={ShieldCheck}
                        >
                          Verify Phone
                        </Button>
                      )
                    )
                  )}
                </div>

                {/* Email verification row */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Mail size={14} className="text-primary-500" />
                    <span className="truncate max-w-[180px]">{c.email || 'No Email'}</span>
                  </div>
                  {c.email && (
                    c.emailVerifiedAt ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    ) : (
                      !isReadOnly && (
                        <Button
                          type="button"
                          variant="warning"
                          size="xs"
                          onClick={() => setVerifyModal({ isOpen: true, contact: c, type: 'email' })}
                          icon={ShieldCheck}
                        >
                          Verify Email
                        </Button>
                      )
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddContactModal
        orgId={organizationId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadContacts}
        primaryContact={primaryContact}
      />

      <ContactVerificationModal
        orgId={organizationId}
        contact={verifyModal.contact}
        verifyType={verifyModal.type}
        isOpen={verifyModal.isOpen}
        onClose={() => setVerifyModal({ isOpen: false, contact: null, type: 'email' })}
        onSuccess={loadContacts}
      />
    </div>
  );
};
