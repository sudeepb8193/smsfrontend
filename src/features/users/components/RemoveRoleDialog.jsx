import React, { useState, useEffect } from 'react';
import { userApi } from '../../../services/user.api';
import { AlertTriangle, Trash2, X, ShieldAlert, CheckCircle2, ShieldCheck } from 'lucide-react';

export const RemoveRoleDialog = ({ isOpen, onClose, userId, roleId, onRoleRemoved }) => {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId && roleId) {
      fetchImpact();
    }
  }, [isOpen, userId, roleId]);

  const fetchImpact = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userApi.getRoleRemovalImpact(userId, roleId);
      setImpact(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to load role impact summary.');
    }
  };

  if (!isOpen) return null;

  const isLastRole = impact && impact.activeRolesCount <= 1;
  const isPrimaryRole = impact && impact.isPrimary;
  const isBlocked = isLastRole || isPrimaryRole;

  const handleConfirmRemove = async () => {
    if (isBlocked) return;
    try {
      setSubmitting(true);
      setError('');
      const res = await userApi.removeRole(userId, roleId);
      setSubmitting(false);
      onRoleRemoved(res);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Failed to remove role.');
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
        zIndex: 1200,
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '20px',
          border: '1px solid #334155',
          width: '100%',
          maxWidth: '500px',
          padding: '28px',
          color: '#f8fafc',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
            <AlertTriangle size={22} />
            Remove {impact?.roleName || 'Role'}?
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
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
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
            Calculating permission impact...
          </div>
        ) : (
          <div>
            {/* Blocking Warnings */}
            {isLastRole && (
              <div
                style={{
                  padding: '14px 16px',
                  backgroundColor: '#451a1a',
                  border: '1px solid #ef4444',
                  borderRadius: '12px',
                  color: '#fca5a5',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>Cannot Remove Last Active Role</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '400', lineHeight: '1.4' }}>
                    A user must have at least one role. Deactivate the user if their access should be completely removed.
                  </div>
                </div>
              </div>
            )}

            {isPrimaryRole && !isLastRole && (
              <div
                style={{
                  padding: '14px 16px',
                  backgroundColor: '#3b2506',
                  border: '1px solid #f59e0b',
                  borderRadius: '12px',
                  color: '#fde68a',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#f59e0b' }} />
                <div>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>Primary Role Protection</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '400', lineHeight: '1.4' }}>
                    <strong>{impact.roleName}</strong> is currently the Primary role. Make another assigned role Primary before removing it.
                  </div>
                </div>
              </div>
            )}

            {!isBlocked && (
              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                Removing the <strong>{impact.roleName}</strong> role will immediately remove access provided exclusively by this role.
              </p>
            )}

            {/* Permission Impact Summary */}
            {impact && (
              <div
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #334155',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em', color: '#94a3b8', marginBottom: '12px' }}>
                  Permission Impact Summary
                </div>

                {/* Permissions Lost */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: '600', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <ShieldAlert size={15} />
                    Permissions Lost ({impact.lostPermissions.length}):
                  </div>
                  {impact.lostPermissions.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', paddingLeft: '20px' }}>
                      None — all permissions are shared with other active assigned roles.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '20px' }}>
                      {impact.lostPermissions.map((perm) => (
                        <span
                          key={perm}
                          style={{
                            padding: '3px 8px',
                            backgroundColor: '#451a1a',
                            color: '#fca5a5',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontFamily: 'monospace',
                          }}
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Permissions Preserved */}
                {impact.sharedPermissions.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: '600', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <ShieldCheck size={15} />
                      Preserved via other active roles ({impact.sharedPermissions.length}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '20px' }}>
                      {impact.sharedPermissions.map((perm) => (
                        <span
                          key={perm}
                          style={{
                            padding: '3px 8px',
                            backgroundColor: '#064e3b',
                            color: '#a7f3d0',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontFamily: 'monospace',
                          }}
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
              {!isBlocked && (
                <button
                  type="button"
                  onClick={handleConfirmRemove}
                  disabled={submitting}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.86rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Trash2 size={16} />
                  {submitting ? 'Removing...' : 'Remove Role'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
