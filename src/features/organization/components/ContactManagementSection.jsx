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
  Sparkles,
  X,
} from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { ContactVerificationModal } from './ContactVerificationModal';
import { Button } from '../../../components/common/Button/Button';
import { Input } from '../../../components/common/Input/Input';
import { Select } from '../../../components/common/Select/Select';
import { EmptyState } from '../../../components/common/EmptyState/EmptyState';
import { Loader } from '../../../components/common/Loader/Loader';

export const ContactManagementSection = ({ organizationId, isReadOnly }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(true);
  const [verifyModal, setVerifyModal] = useState({ isOpen: false, contact: null, type: 'email' });

  // Inline Form State
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
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

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

  useEffect(() => {
    if (contacts && contacts.length > 0) {
      const primary = contacts.find((c) => c.contactType === 'primary') || contacts[0];
      setFormData({
        contactType: primary.contactType || 'primary',
        sameAsPrimary: false,
        fullName: primary.fullName || '',
        designation: primary.designation || '',
        phoneCountryCode: primary.phoneCountryCode || '+1',
        phoneNumber: primary.phoneNumber || '',
        email: primary.email || '',
        isDefaultPublic: primary.isDefaultPublic || false,
      });
    }
  }, [contacts]);

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

  const handleInlineSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await organizationApi.createContact(organizationId, formData);
      setFormData({
        contactType: 'primary',
        sameAsPrimary: false,
        fullName: '',
        designation: '',
        phoneCountryCode: '+1',
        phoneNumber: '',
        email: '',
        isDefaultPublic: false,
      });
      setIsAddOpen(false);
      loadContacts();
    } catch (err) {
      setFormError(err.message || 'Failed to create contact');
    } finally {
      setSubmitting(false);
    }
  };

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
        {!isReadOnly && !isAddOpen && (
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

      {/* Embedded Inline Form Card */}
      {isAddOpen && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-5 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <UserCheck size={18} className="text-primary-500" />
              Add New Contact Profile
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Country Code"
                value={formData.phoneCountryCode}
                onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                placeholder="+1"
              />
              <div className="md:col-span-2">
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

            <label className="flex items-center gap-2 pt-1 text-xs text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefaultPublic}
                onChange={(e) => setFormData({ ...formData, isDefaultPublic: e.target.checked })}
                className="rounded border-[var(--border-color)] text-primary-600 focus:ring-0 bg-[var(--bg-input)]"
              />
              <span>Set as Default Public Contact for this type</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
              <Button type="button" variant="secondary" size="small" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="small" loading={submitting} icon={Sparkles}>
                Save Contact
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Loader text="Loading contacts..." size="large" />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
          {error}
        </div>
      ) : contacts.length === 0 && !isAddOpen ? (
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

export default ContactManagementSection;
