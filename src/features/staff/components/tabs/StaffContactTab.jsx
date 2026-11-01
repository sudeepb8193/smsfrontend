import React, { useState } from 'react';
import Card from '../../../../components/shared/Card';
import Button from '../../../../components/shared/Button';
import Badge from '../../../../components/shared/Badge';
import Input from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';
import Modal from '../../../../components/shared/Modal';
import { AddEmergencyContactModal } from '../modals/AddEmergencyContactModal';
import { usePermission } from '../../../../hooks/usePermission';
import {
  Phone,
  Mail,
  MapPin,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2,
  PhoneCall,
  AlertTriangle,
  Heart,
  UserCheck,
} from 'lucide-react';

export function StaffContactTab({
  staff,
  contacts,
  emergencyContacts = [],
  onUpdateContacts,
  onRevealNationalId,
  onCreateEmergencyContact,
  onUpdateEmergencyContact,
  onDeleteEmergencyContact,
  savingContacts,
  revealingNationalId,
}) {
  const { can } = usePermission();
  const branchId = staff?.homeBranchId;

  // Reveal state for national ID
  const [revealedNationalId, setRevealedNationalId] = useState(null);
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [isAddEmergencyModalOpen, setIsAddEmergencyModalOpen] = useState(false);
  const [editingEmergencyContact, setEditingEmergencyContact] = useState(null);

  // Edit contact form state
  const [formData, setFormData] = useState({
    personalPhone: contacts?.personalPhone || '',
    personalEmail: contacts?.personalEmail || '',
    addressLine1: contacts?.addressLine1 || '',
    addressLine2: contacts?.addressLine2 || '',
    city: contacts?.city || '',
    state: contacts?.state || '',
    postalCode: contacts?.postalCode || '',
    countryCode: contacts?.countryCode || 'IN',
    bloodGroup: contacts?.bloodGroup || '',
    maritalStatus: contacts?.maritalStatus || 'single',
    nationalIdNumber: '',
  });

  const handleReveal = async () => {
    if (revealedNationalId) {
      setRevealedNationalId(null);
      return;
    }
    const res = await onRevealNationalId();
    if (res?.nationalIdNumber) {
      setRevealedNationalId(res.nationalIdNumber);
    }
  };

  const handleSaveContacts = async (e) => {
    e.preventDefault();
    await onUpdateContacts(formData);
    setIsEditContactModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Personal Contact Details Card */}
      <Card>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Personal & Contact Information
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Personal contact details are stored securely and kept separate from system login credentials.
            </p>
          </div>
          {(can('staff_contact.update', branchId) || can('staff_contact.create', branchId)) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFormData({
                  personalPhone: contacts?.personalPhone || '',
                  personalEmail: contacts?.personalEmail || '',
                  addressLine1: contacts?.addressLine1 || '',
                  addressLine2: contacts?.addressLine2 || '',
                  city: contacts?.city || '',
                  state: contacts?.state || '',
                  postalCode: contacts?.postalCode || '',
                  countryCode: contacts?.countryCode || 'IN',
                  bloodGroup: contacts?.bloodGroup || '',
                  maritalStatus: contacts?.maritalStatus || 'single',
                  nationalIdNumber: '',
                });
                setIsEditContactModalOpen(true);
              }}
            >
              <Edit2 size={14} className="mr-1.5" />
              Edit Details
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <Phone className="text-slate-400 mt-1 shrink-0" size={18} />
            <div>
              <span className="text-xs text-[var(--text-muted)] block">Personal Phone</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {contacts?.personalPhone || 'Not provided'}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Mail className="text-slate-400 mt-1 shrink-0" size={18} />
            <div>
              <span className="text-xs text-[var(--text-muted)] block">Personal Email</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {contacts?.personalEmail || 'Not provided'}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Heart className="text-slate-400 mt-1 shrink-0" size={18} />
            <div>
              <span className="text-xs text-[var(--text-muted)] block">Blood Group</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 uppercase">
                {contacts?.bloodGroup || 'Not specified'}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <UserCheck className="text-slate-400 mt-1 shrink-0" size={18} />
            <div>
              <span className="text-xs text-[var(--text-muted)] block">Marital Status</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">
                {contacts?.maritalStatus?.replace('_', ' ') || 'Not specified'}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3 md:col-span-2">
            <MapPin className="text-slate-400 mt-1 shrink-0" size={18} />
            <div>
              <span className="text-xs text-[var(--text-muted)] block">Residential Address</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {[
                  contacts?.addressLine1,
                  contacts?.addressLine2,
                  contacts?.city,
                  contacts?.state,
                  contacts?.postalCode,
                  contacts?.countryCode,
                ]
                  .filter(Boolean)
                  .join(', ') || 'No address registered'}
              </span>
            </div>
          </div>
        </div>

        {/* Sensitive National ID Card */}
        <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
          <div className="p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  National ID (Encrypted at Rest)
                </p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="font-mono text-sm tracking-widest text-[var(--text-secondary)]">
                    {revealedNationalId ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {revealedNationalId}
                      </span>
                    ) : contacts?.nationalIdNumberMasked ? (
                      contacts.nationalIdNumberMasked
                    ) : (
                      'No National ID recorded'
                    )}
                  </span>
                  {contacts?.hasNationalId && (
                    <Badge variant="neutral" size="xs">
                      AES-256
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {contacts?.hasNationalId &&
              (can('staff_contact.manage', branchId) ||
                can('staff_contact.reveal_sensitive', branchId)) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReveal}
                  loading={revealingNationalId}
                >
                  {revealedNationalId ? (
                    <>
                      <EyeOff size={14} className="mr-1.5" />
                      Hide Number
                    </>
                  ) : (
                    <>
                      <Eye size={14} className="mr-1.5" />
                      Reveal ID (Audited)
                    </>
                  )}
                </Button>
              )}
          </div>
        </div>
      </Card>

      {/* Emergency Contacts Section */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Emergency Contacts
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Primary contact will be contacted first in case of workplace emergencies.
            </p>
          </div>
          {(can('staff_emergency.create', branchId) ||
            can('staff_emergency.manage', branchId)) && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setEditingEmergencyContact(null);
                setIsAddEmergencyModalOpen(true);
              }}
            >
              <Plus size={14} className="mr-1.5" />
              Add Emergency Contact
            </Button>
          )}
        </div>

        {emergencyContacts.length === 0 ? (
          <div className="p-6 text-center bg-amber-50/50 dark:bg-amber-950/20 border border-dashed border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertTriangle className="mx-auto text-amber-500 mb-2" size={24} />
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              No Emergency Contact Registered
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Active employees must have at least one emergency contact on file for compliance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 rounded-xl border border-[var(--border-color)] bg-white dark:bg-slate-900/40 relative flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-[var(--text-primary)]">
                      {contact.contactName}
                    </h4>
                    {contact.priority === 'primary' ? (
                      <Badge variant="primary">Primary</Badge>
                    ) : (
                      <Badge variant="neutral">Secondary</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {(can('staff_emergency.update', branchId) ||
                      can('staff_emergency.manage', branchId)) && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEmergencyContact(contact);
                          setIsAddEmergencyModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title="Edit Contact"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {(can('staff_emergency.delete', branchId) ||
                      can('staff_emergency.manage', branchId)) && (
                      <button
                        type="button"
                        onClick={() => onDeleteEmergencyContact(contact.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Delete Contact"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Relationship:</span>
                    <span className="text-[var(--text-secondary)] font-medium">
                      {contact.relationship || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-[var(--text-muted)]">Phone:</span>
                    <a
                      href={`tel:${contact.phoneNumber}`}
                      className="text-primary-500 font-medium flex items-center space-x-1"
                    >
                      <PhoneCall size={12} className="mr-1" />
                      {contact.phoneNumber}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Contacts Modal */}
      <Modal
        isOpen={isEditContactModalOpen}
        onClose={() => setIsEditContactModalOpen(false)}
        title="Edit Personal & Contact Details"
      >
        <form onSubmit={handleSaveContacts} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Personal Phone Number
              </label>
              <Input
                value={formData.personalPhone}
                onChange={(e) => setFormData({ ...formData, personalPhone: e.target.value })}
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Personal Email Address
              </label>
              <Input
                type="email"
                value={formData.personalEmail}
                onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                placeholder="stylist@personalmail.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Blood Group
              </label>
              <CustomSelector
                placeholder="Select blood group..."
                value={formData.bloodGroup}
                onChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                ]}
                isSearchable={false}
                isClearable={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Marital Status
              </label>
              <CustomSelector
                value={formData.maritalStatus}
                onChange={(val) => setFormData({ ...formData, maritalStatus: val })}
                options={[
                  { value: 'single', label: 'Single' },
                  { value: 'married', label: 'Married' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                ]}
                isSearchable={false}
                isClearable={false}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Address Line 1
            </label>
            <Input
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              placeholder="Street name, flat / building number"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                City
              </label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                State / Province
              </label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Postal Code
              </label>
              <Input
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="ZIP / Postal code"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-color)]">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              National ID Number (Update Encrypted Value)
            </label>
            <Input
              value={formData.nationalIdNumber}
              onChange={(e) => setFormData({ ...formData, nationalIdNumber: e.target.value })}
              placeholder={
                contacts?.hasNationalId
                  ? '•••• •••• •••• (Leave blank to keep existing)'
                  : 'Enter National ID / Aadhaar / SSN'
              }
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Values entered here are encrypted with AES-256 before storage and never stored as plaintext.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-[var(--border-color)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditContactModalOpen(false)}
              disabled={savingContacts}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingContacts}>
              Save Details
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Emergency Contact Modal */}
      <AddEmergencyContactModal
        isOpen={isAddEmergencyModalOpen}
        onClose={() => setIsAddEmergencyModalOpen(false)}
        initialData={editingEmergencyContact}
        onSave={(data) => {
          if (editingEmergencyContact) {
            onUpdateEmergencyContact(editingEmergencyContact.id, data);
          } else {
            onCreateEmergencyContact(data);
          }
          setIsAddEmergencyModalOpen(false);
        }}
      />
    </div>
  );
}

export default StaffContactTab;
