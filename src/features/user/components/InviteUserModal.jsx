import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Copy,
  Check,
  Clock,
  Sparkles,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../../../components/shared/Modal';
import Button from '../../../components/shared/Button';
import Input from '../../../components/shared/Input';
import CustomSelector from '../../../components/shared/CustomSelector';
import ErrorMessage from '../../../components/shared/ErrorMessage';

export const InviteUserModal = ({
  isOpen,
  onClose,
  onInviteSuccess,
  availableRoles = [],
  availableBranches = [],
  targetOrganisationName = '',
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [roleId, setRoleId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Result state after successful invitation
  const [inviteResult, setInviteResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setDisplayName('');
    setEmail('');
    setPhoneCountryCode('+91');
    setPhoneNumber('');
    setRoleId('');
    setBranchId('');
    setErrorMsg('');
    setInviteResult(null);
    setCopied(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Validation
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

    if (!roleId) {
      setErrorMsg('Please assign a primary role to this user');
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
        roleId,
        branchId: branchId || undefined,
      };

      const result = await onInviteSuccess(payload);
      setInviteResult(result);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteResult?.inviteToken) return;
    const fullUrl = `${window.location.origin}/accept-invite?token=${inviteResult.inviteToken}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('Invitation link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const roleOptions = availableRoles
    .filter((r) => r.status === 'active')
    .map((role) => ({
      value: role.id,
      label: role.name,
      badge: role.roleType === 'system' ? 'System' : null,
    }));

  const branchOptions = [
    { value: '', label: 'No branch / Global access' },
    ...availableBranches.map((branch) => ({
      value: branch.id,
      label: branch.name,
      badge: branch.code || null,
    })),
  ];

  const footer = inviteResult ? (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="secondary" size="medium" onClick={handleReset}>
        Invite Another
      </Button>
      <Button variant="primary" size="medium" onClick={handleClose}>
        Done
      </Button>
    </div>
  ) : (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button
        variant="secondary"
        size="medium"
        onClick={handleClose}
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
        Send Invitation
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={inviteResult ? 'Invitation Generated' : 'Invite New User'}
      size="medium"
      footer={footer}
    >
      {inviteResult ? (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Sparkles size={16} />
              <span>Account Created & Invitation Ready</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              An account for <span className="font-bold text-[var(--text-primary)]">{inviteResult.displayName}</span> has been created in pending state. The single-use link expires in 7 days.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-secondary)]">
              Single-Use Setup Link
            </label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/accept-invite?token=${inviteResult.inviteToken}`}
                className="font-mono text-xs select-all flex-1"
              />
              <Button
                variant="primary"
                size="medium"
                icon={copied ? Check : Copy}
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
            <Clock size={14} className="text-amber-400 shrink-0" />
            <span>
              Expires on{' '}
              <strong className="text-[var(--text-secondary)]">
                {new Date(inviteResult.inviteExpiresAt).toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </strong>
              . The admin never sees or chooses the user's password.
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {errorMsg && <ErrorMessage message={errorMsg} />}

          {targetOrganisationName && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs text-primary-500 font-semibold">
              <Building size={14} className="shrink-0" />
              <span>Inviting to: <strong>{targetOrganisationName}</strong></span>
            </div>
          )}

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

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
              Phone Number
              <span className="text-xs text-[var(--text-muted)] font-normal">(Secondary / 2FA login identifier)</span>
            </label>
            <div className="flex gap-2">
              <div className="w-24 shrink-0">
                <Input
                  type="text"
                  placeholder="+91"
                  value={phoneCountryCode}
                  onChange={(e) => setPhoneCountryCode(e.target.value)}
                  className="text-center"
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
          </div>

          {/* Role Picker */}
          <CustomSelector
            label="Primary Access Role"
            required
            placeholder="Select a role..."
            searchPlaceholder="Search roles..."
            value={roleId}
            onChange={(val) => setRoleId(val)}
            options={roleOptions}
            isSearchable={true}
            isClearable={false}
          />

          {/* Home Branch Picker */}
          <CustomSelector
            label="Assigned Home Branch"
            helperText="(Optional context)"
            placeholder="No branch / Global access"
            searchPlaceholder="Search branches..."
            value={branchId}
            onChange={(val) => setBranchId(val)}
            options={branchOptions}
            isSearchable={true}
            isClearable={true}
          />

          {/* Notice */}
          <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)]">
            An invitation with a secure 7-day token will be generated. The user will be required to set their own password upon first access.
          </div>
        </div>
      )}
    </Modal>
  );
};

export default InviteUserModal;
