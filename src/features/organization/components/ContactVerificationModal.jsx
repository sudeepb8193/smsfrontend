import { useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { Modal } from '../../../components/common/Modal/Modal';
import { Input } from '../../../components/common/Input/Input';
import { Button } from '../../../components/common/Button/Button';

export const ContactVerificationModal = ({ orgId, contact, verifyType, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [tokenInput, setTokenInput] = useState('');
  const [devToken, setDevToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!contact) return null;

  const handleRequestToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        verifyType === 'email'
          ? await organizationApi.requestEmailVerification(orgId, contact.id)
          : await organizationApi.requestPhoneVerification(orgId, contact.id);

      setDevToken(res.token);
      setSuccessMsg(`Verification token generated and sent to ${verifyType === 'email' ? contact.email : contact.phoneNumber}!`);
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Failed to generate verification token');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (verifyType === 'email') {
        await organizationApi.verifyEmail(orgId, contact.id, tokenInput);
      } else {
        await organizationApi.verifyPhone(orgId, contact.id, tokenInput);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid or expired verification token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Verify ${verifyType === 'email' ? 'Email Address' : 'Phone Number'}`}
      size="small"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'request' ? (
          <div className="space-y-4 text-center py-2">
            <p className="text-xs text-[var(--text-secondary)]">
              Send a 24-hour verification token to verify contact {verifyType === 'email' ? contact.email : `${contact.phoneCountryCode || ''} ${contact.phoneNumber}`}.
            </p>
            <Button
              type="button"
              variant="success"
              fullWidth
              onClick={handleRequestToken}
              loading={loading}
              icon={ShieldCheck}
            >
              Send Verification Token
            </Button>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            {devToken && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs">
                <span className="font-bold">Dev Verification Code:</span> <code className="font-mono bg-[var(--bg-input)] border border-[var(--border-color)] px-2 py-0.5 rounded text-[var(--text-primary)]">{devToken}</code>
              </div>
            )}

            <Input
              label="Enter Verification Token"
              required
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste token string..."
              className="font-mono text-sm"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleRequestToken}
                disabled={loading}
              >
                Resend Token
              </Button>
              <Button
                type="submit"
                variant="success"
                fullWidth
                disabled={loading || !tokenInput}
                loading={loading}
                icon={CheckCircle2}
              >
                Verify Now
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
