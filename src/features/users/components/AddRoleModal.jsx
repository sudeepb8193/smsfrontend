import React, { useState, useEffect } from 'react';
import { userApi } from '../../../services/user.api';
import { Shield, Plus, X, AlertCircle, CheckCircle2, Star } from 'lucide-react';

export const AddRoleModal = ({ isOpen, onClose, userId, activeRoleIds = [], onRoleAssigned }) => {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableRoles();
      setSelectedRoleId('');
      setIsPrimary(false);
      setError('');
    }
  }, [isOpen]);

  const fetchAvailableRoles = async () => {
    try {
      setLoading(true);
      setError('');
      const roles = await userApi.getAvailableRoles();
      // Filter out roles that are inactive
      const activeRoles = roles.filter((r) => r.status === 'active');
      setAvailableRoles(activeRoles);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to load available roles.');
    }
  };

  if (!isOpen) return null;

  const assignableRoles = availableRoles.filter(
    (role) => !activeRoleIds.includes(role.id),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoleId) {
      setError('Please select a role to assign.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await userApi.assignRole(userId, {
        roleId: Number(selectedRoleId),
        isPrimary,
      });
      setSubmitting(false);
      onRoleAssigned(res);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Failed to assign role.');
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
        zIndex: 1100,
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface, #1e293b)',
          borderRadius: '20px',
          border: '1px solid var(--border-color, #334155)',
          width: '100%',
          maxWidth: '460px',
          padding: '28px',
          color: 'var(--text-primary, #f8fafc)',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Plus size={20} className="text-primary" style={{ color: '#6366f1' }} />
            Assign Role
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#451a1a',
              border: '1px solid #f87171',
              borderRadius: '10px',
              color: '#fca5a5',
              fontSize: '0.86rem',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
            Loading roles...
          </div>
        ) : assignableRoles.length === 0 ? (
          <div style={{ padding: '16px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
            All available organization roles are already assigned to this user.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                Select Role *
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              >
                <option value="">-- Choose a Role --</option>
                {assignableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.code}) {role.description ? `— ${role.description}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: '500',
                  color: '#e2e8f0',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#6366f1', cursor: 'pointer' }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={16} fill={isPrimary ? '#eab308' : 'none'} color={isPrimary ? '#eab308' : '#94a3b8'} />
                  Set as Primary Role
                </span>
              </label>
              <p style={{ margin: '4px 0 0 26px', fontSize: '0.76rem', color: '#94a3b8' }}>
                Primary role sets default dashboard context. Union of all roles determines permissions.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#334155',
                  color: '#f8fafc',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.86rem',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedRoleId}
                style={{
                  padding: '9px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  cursor: submitting || !selectedRoleId ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.86rem',
                  opacity: submitting || !selectedRoleId ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {submitting ? 'Assigning...' : 'Assign Role'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
