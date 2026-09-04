import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../services/user.api';
import {
  Scissors,
  Lock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const LoginPage = () => {
  const { login, seedDemo } = useAuth();

  const [activeTab, setActiveTab] = useState('user'); // 'user' | 'secret-admin' | 'accept-invite'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Accept Invite form state
  const [inviteToken, setInviteToken] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteConfirm, setInviteConfirm] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier.trim() || !password) {
      setError('Please enter your email or phone number and password.');
      return;
    }

    try {
      setLoading(true);
      await login(identifier.trim(), password);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid credentials or account deactivated.');
    }
  };

  const handleDemoAdmin = async () => {
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      await seedDemo();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to authenticate demo admin.');
    }
  };

  const handleAcceptInviteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!inviteToken.trim()) {
      setError('Invitation token is required.');
      return;
    }

    if (invitePassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (invitePassword !== inviteConfirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await userApi.acceptInvite({
        token: inviteToken.trim(),
        password: invitePassword,
      });
      setLoading(false);
      setSuccess(res.message || 'Account setup complete! You can now log in.');
      setActiveTab('user');
      setIdentifier('');
      setPassword('');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to accept invitation.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F0F1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#E2E8F0',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#161625',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#6366F1',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Scissors size={28} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#FFF' }}>
            Salon Management System
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#94A3B8' }}>
            Sign in to access your organization portal
          </p>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#0F0F1A',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '24px',
          }}
        >
          <button
            onClick={() => { setActiveTab('user'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'user' ? '#6366F1' : 'transparent',
              color: activeTab === 'user' ? '#FFF' : '#94A3B8',
              fontWeight: '600',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('secret-admin'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'secret-admin' ? '#6366F1' : 'transparent',
              color: activeTab === 'secret-admin' ? '#FFF' : '#94A3B8',
              fontWeight: '600',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Lock size={13} /> Secret Admin
          </button>
          <button
            onClick={() => { setActiveTab('accept-invite'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'accept-invite' ? '#6366F1' : 'transparent',
              color: activeTab === 'accept-invite' ? '#FFF' : '#94A3B8',
              fontWeight: '600',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Accept Invite
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              color: '#F87171',
              fontSize: '0.86rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '8px',
              color: '#34D399',
              fontSize: '0.86rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        {activeTab === 'user' && (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: '#CBD5E1' }}>
                Email Address or Phone Number
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. admin@salon.com or 9876543210"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#0F0F1A',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#FFF',
                  fontSize: '0.92rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: '#CBD5E1' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#0F0F1A',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#FFF',
                  fontSize: '0.92rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: '#6366F1',
                color: '#FFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                marginBottom: '16px',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={handleDemoAdmin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#CBD5E1',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Zap size={16} color="#F59E0B" /> Quick Demo Sign In (Super Admin)
            </button>
          </form>
        )}

        {activeTab === 'secret-admin' && (
          <div>
            <div
              style={{
                padding: '14px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '0.84rem',
                color: '#818CF8',
              }}
            >
              <ShieldCheck size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              <strong>Secret Administrative Portal</strong>
              <br />
              Authorized Super Administrators can perform instant administrative bypass sign in below.
            </div>

            <button
              type="button"
              onClick={handleDemoAdmin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: '#10B981',
                color: '#FFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <KeyRound size={18} /> {loading ? 'Authenticating...' : 'Launch Super Admin Secret Session'}
            </button>
          </div>
        )}

        {activeTab === 'accept-invite' && (
          <form onSubmit={handleAcceptInviteSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: '#CBD5E1' }}>
                Invitation Token
              </label>
              <input
                type="text"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                placeholder="Paste invitation token received"
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  backgroundColor: '#0F0F1A',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#FFF',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: '#CBD5E1' }}>
                New Password
              </label>
              <input
                type="password"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  backgroundColor: '#0F0F1A',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#FFF',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', marginBottom: '6px', color: '#CBD5E1' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={inviteConfirm}
                onChange={(e) => setInviteConfirm(e.target.value)}
                placeholder="Re-enter password"
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  backgroundColor: '#0F0F1A',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#FFF',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#6366F1',
                color: '#FFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Submitting...' : 'Set Password & Activate'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
