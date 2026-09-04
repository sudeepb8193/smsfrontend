import React, { useState, useEffect } from 'react';
import { userApi } from '../../../services/user.api';
import { Shield, Key, CheckCircle2, AlertTriangle, X, Lock } from 'lucide-react';

export const UserProfileModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('password'); // 'password' | '2fa'
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch2FAStatus();
    }
  }, [isOpen]);

  const fetch2FAStatus = async () => {
    try {
      const res = await userApi.get2FASettings();
      setTwoFactorEnabled(res.is2FAEnabled);
    } catch (e) {
      // ignore
    }
  };

  if (!isOpen) return null;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      setLoading(true);
      const res = await userApi.changePassword({ currentPassword, newPassword });
      setLoading(false);
      setMessage({ type: 'success', text: res.message || 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setLoading(false);
      setMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    }
  };

  const handleToggle2FA = async () => {
    try {
      setLoading(true);
      const targetState = !twoFactorEnabled;
      const res = await userApi.toggle2FA(targetState);
      setLoading(false);
      setTwoFactorEnabled(targetState);
      setMessage({ type: 'success', text: res.message });
    } catch (err) {
      setLoading(false);
      setMessage({ type: 'error', text: err.message || 'Failed to update 2FA status.' });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          width: '100%',
          maxWidth: '480px',
          padding: '32px',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--primary)" /> Account Security & Profile
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <button
            onClick={() => { setActiveTab('password'); setMessage({ type: '', text: '' }); }}
            style={{
              flex: 1,
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'password' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'password' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Key size={16} /> Change Password
          </button>
          <button
            onClick={() => { setActiveTab('2fa'); setMessage({ type: '', text: '' }); }}
            style={{
              flex: 1,
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === '2fa' ? '2px solid var(--primary)' : 'none',
              color: activeTab === '2fa' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Lock size={16} /> Two-Factor Auth (2FA)
          </button>
        </div>

        {message.text && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: message.type === 'error' ? 'var(--danger-light)' : 'var(--success-light)',
              border: `1px solid ${message.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
              borderRadius: '10px',
              color: message.type === 'error' ? 'var(--danger)' : 'var(--success)',
              fontSize: '0.86rem',
              fontWeight: '600',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            {message.text}
          </div>
        )}

        {activeTab === 'password' ? (
          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Shield size={48} color="var(--primary)" style={{ marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Two-Factor Authentication</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Enhance account security by requiring an authenticator code upon sign in.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                backgroundColor: 'var(--bg-input)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Status: {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <br />
            <button
              onClick={handleToggle2FA}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: twoFactorEnabled ? 'var(--danger)' : 'var(--success)',
                color: '#FFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Processing...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
