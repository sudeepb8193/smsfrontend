import React, { useState } from 'react';
import { userApi } from '../../../services/user.api';

export const AddUserModal = ({ isOpen, onClose, onUserCreated, currentUserRole = 'SUPER_ADMIN' }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    role: currentUserRole === 'BRANCH_MANAGER' ? 'FRONT_DESK' : 'FRONT_DESK',
    branchIds: [],
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdInviteUrl, setCreatedInviteUrl] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreatedInviteUrl('');

    // Client-side validation
    const trimmedName = formData.displayName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError('Display Name must be at least 2 characters.');
      return;
    }

    if (!formData.email.trim() && !formData.phoneNumber.trim()) {
      setError('Provide an email address or phone number.');
      return;
    }

    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        displayName: trimmedName,
        email: formData.email.trim() || undefined,
        phoneCountryCode: formData.phoneNumber.trim() ? formData.phoneCountryCode : undefined,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        role: formData.role,
        branchIds: formData.branchIds.length > 0 ? formData.branchIds : undefined,
      };

      const result = await userApi.createUser(payload);
      setLoading(false);

      if (result.invitationUrl) {
        setCreatedInviteUrl(result.invitationUrl);
      }
      onUserCreated(result);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to create user. Please check your inputs.');
    }
  };

  const allowedRoles =
    currentUserRole === 'BRANCH_MANAGER'
      ? [
          { value: 'FRONT_DESK', label: 'Front Desk' },
          { value: 'SERVICE_STAFF', label: 'Service Staff' },
        ]
      : [
          { value: 'SUPER_ADMIN', label: 'Super Admin / Owner' },
          { value: 'BRANCH_MANAGER', label: 'Branch Manager' },
          { value: 'ACCOUNTANT', label: 'Accountant' },
          { value: 'FRONT_DESK', label: 'Front Desk' },
          { value: 'SERVICE_STAFF', label: 'Service Staff' },
          { value: 'INVENTORY_MANAGER', label: 'Inventory Manager' },
          { value: 'MARKETING_MANAGER', label: 'Marketing Manager' },
        ];

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
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          width: '100%',
          maxWidth: '520px',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <h2 id="modal-title" style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            + Add New System User
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: '10px',
              color: 'var(--danger)',
              fontSize: '0.88rem',
              fontWeight: '600',
              marginBottom: '20px',
            }}
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}

        {createdInviteUrl ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
            <h3 style={{ color: 'var(--success)', margin: '0 0 10px 0' }}>User Created & Invited!</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              An invitation has been generated. The user must use the invitation link below to set their password.
            </p>
            <div
              style={{
                backgroundColor: 'var(--bg-input)',
                padding: '14px',
                borderRadius: '10px',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: 'var(--primary)',
                border: '1px solid var(--border-color)',
                marginBottom: '20px',
              }}
            >
              {window.location.origin}{createdInviteUrl}
            </div>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Display Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="e.g. Ravi Kumar"
                required
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. ravi@gmail.com"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Required if phone number is not provided</span>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Phone Number
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  name="phoneCountryCode"
                  value={formData.phoneCountryCode}
                  onChange={handleChange}
                  placeholder="+91"
                  style={{
                    width: '84px',
                    padding: '11px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                  }}
                />
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="9876543210"
                  style={{
                    flex: 1,
                    padding: '11px 16px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                System Role <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                }}
              >
                {allowedRoles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Creating...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
