import React, { useState, useEffect } from 'react';
import { Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../../../components/shared/Modal';
import Button from '../../../components/shared/Button';
import Input from '../../../components/shared/Input';
import ErrorMessage from '../../../components/shared/ErrorMessage';

export const EditUserModal = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setPhoneCountryCode(user.phoneCountryCode || '+91');
      setPhoneNumber(user.phoneNumber || '');
      setErrorMsg('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!displayName.trim() || displayName.trim().length < 2) {
      setErrorMsg('Display name must be at least 2 characters');
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedEmail && !trimmedPhone) {
      setErrorMsg('At least one contact method (email or phone number) is required');
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        displayName: displayName.trim(),
        email: trimmedEmail || undefined,
        phoneCountryCode: trimmedEmail && !trimmedPhone ? undefined : phoneCountryCode,
        phoneNumber: trimmedPhone || undefined,
      };

      await onUserUpdated(user.id, payload);
      toast.success(`User "${displayName.trim()}" updated successfully`);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update user profile');
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button
        variant="secondary"
        size="medium"
        onClick={onClose}
        disabled={submitting}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        size="medium"
        onClick={handleSubmit}
        disabled={submitting}
        loading={submitting}
      >
        Save Changes
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User Profile"
      size="medium"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && <ErrorMessage message={errorMsg} />}

        {/* Display Name */}
        <Input
          label="Display Name"
          required
          placeholder="e.g. Rachel Green"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        {/* Email Address */}
        <Input
          label="Email Address"
          helperText="(Primary login identifier)"
          type="email"
          icon={Mail}
          placeholder="rachel@salongroup.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Phone Number with Country Code */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Phone Number
          </label>
          <div className="flex items-center gap-2">
            <div className="w-24 shrink-0">
              <Input
                placeholder="+91"
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                type="tel"
                icon={Phone}
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Optional secondary notification or login identifier
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;
