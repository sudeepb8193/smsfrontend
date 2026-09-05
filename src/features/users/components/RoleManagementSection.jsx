import React, { useState, useEffect } from 'react';
import { userApi } from '../../../services/user.api';
import { AddRoleModal } from './AddRoleModal';
import { RemoveRoleDialog } from './RemoveRoleDialog';
import {
  Shield,
  Star,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  Lock,
  KeyRound,
} from 'lucide-react';

export const RoleManagementSection = ({ userId, displayName }) => {
  const [roleData, setRoleData] = useState({
    activeRoles: [],
    historicalRoles: [],
    effectivePermissions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ type: '', text: '' });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removeDialogState, setRemoveDialogState] = useState({ isOpen: false, roleId: null });

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await userApi.getUserRoles(userId);
      setRoleData({
        activeRoles: res.activeRoles || [],
        historicalRoles: res.historicalRoles || [],
        effectivePermissions: res.effectivePermissions || [],
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to load user role assignments.');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserRoles();
    }
  }, [userId]);

  const handleMakePrimary = async (roleId) => {
    try {
      setNotification({ type: 'info', text: 'Updating primary role...' });
      const res = await userApi.makeRolePrimary(userId, roleId);
      setRoleData({
        activeRoles: res.activeRoles || [],
        historicalRoles: res.historicalRoles || [],
        effectivePermissions: res.effectivePermissions || [],
      });
      setNotification({ type: 'success', text: 'Primary role updated successfully.' });
    } catch (err) {
      setNotification({ type: 'error', text: err.message || 'Failed to change primary role.' });
    }
  };

  const handleRoleUpdated = (res) => {
    setRoleData({
      activeRoles: res.activeRoles || [],
      historicalRoles: res.historicalRoles || [],
      effectivePermissions: res.effectivePermissions || [],
    });
    setNotification({ type: 'success', text: 'Role assignments updated successfully.' });
  };

  if (loading) {
    return (
      <div style={{ padding: '30px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        Loading role assignments...
      </div>
    );
  }

  const activeRoleIds = roleData.activeRoles.map((r) => r.roleId);

  return (
    <div style={{ width: '100%', color: '#f8fafc' }}>
      {/* Toast notification */}
      {notification.text && (
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: notification.type === 'error' ? '#451a1a' : '#064e3b',
            border: `1px solid ${notification.type === 'error' ? '#ef4444' : '#10b981'}`,
            borderRadius: '10px',
            color: notification.type === 'error' ? '#fca5a5' : '#a7f3d0',
            fontSize: '0.84rem',
            fontWeight: '600',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{notification.text}</span>
          <button
            onClick={() => setNotification({ type: '', text: '' })}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#451a1a',
            border: '1px solid #ef4444',
            borderRadius: '10px',
            color: '#fca5a5',
            fontSize: '0.86rem',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {/* Active Roles Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: '#6366f1' }} />
              Active Roles ({roleData.activeRoles.length})
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
              Primary role determines default view. Effective permissions are the union of all active roles.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={15} /> Add Role
          </button>
        </div>

        {/* Role Chips */}
        {roleData.activeRoles.length === 0 ? (
          <div style={{ padding: '16px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px border #334155', color: '#ef4444', fontSize: '0.86rem' }}>
            No active roles assigned. An active user must have at least one role.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {roleData.activeRoles.map((role) => {
              const isPrimary = role.isPrimary;
              return (
                <div
                  key={role.id}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    backgroundColor: isPrimary ? 'rgba(99, 102, 241, 0.15)' : '#0f172a',
                    border: `1.5px solid ${isPrimary ? '#6366f1' : '#334155'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: isPrimary ? '0 0 12px rgba(99, 102, 241, 0.2)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star
                      size={18}
                      fill={isPrimary ? '#eab308' : 'none'}
                      color={isPrimary ? '#eab308' : '#64748b'}
                    />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {role.roleName}
                        {isPrimary && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: '800',
                              backgroundColor: '#eab308',
                              color: '#0f172a',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                            }}
                          >
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        {role.roleCode} {role.assignedByName ? `• By ${role.assignedByName}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
                    {!isPrimary && (
                      <button
                        onClick={() => handleMakePrimary(role.roleId)}
                        title="Set as Primary Role"
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#334155',
                          color: '#e2e8f0',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.74rem',
                          fontWeight: '600',
                        }}
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      onClick={() => setRemoveDialogState({ isOpen: true, roleId: role.roleId })}
                      title="Remove Role"
                      style={{
                        padding: '5px',
                        borderRadius: '6px',
                        backgroundColor: '#451a1a',
                        color: '#f87171',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Union of Effective Permissions */}
      <div style={{ marginBottom: '24px', backgroundColor: '#0f172a', borderRadius: '14px', padding: '18px', border: '1px solid #334155' }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KeyRound size={16} style={{ color: '#10b981' }} />
          Effective Permissions Union ({roleData.effectivePermissions.length})
        </h4>
        <p style={{ margin: '0 0 12px 0', fontSize: '0.76rem', color: '#94a3b8' }}>
          Combined permissions granted across all active roles (deduplicated).
        </p>

        {roleData.effectivePermissions.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
            No permissions active.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
            {roleData.effectivePermissions.map((perm) => (
              <span
                key={perm}
                style={{
                  padding: '3px 8px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: '#38bdf8',
                }}
              >
                {perm}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Role Assignment History */}
      {roleData.historicalRoles.length > 0 && (
        <div style={{ backgroundColor: '#0f172a', borderRadius: '14px', padding: '18px', border: '1px solid #334155' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} />
            Role Assignment History
          </h4>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '6px 8px' }}>Role</th>
                  <th style={{ padding: '6px 8px' }}>Assigned At</th>
                  <th style={{ padding: '6px 8px' }}>Removed At</th>
                  <th style={{ padding: '6px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {roleData.historicalRoles.map((h) => (
                  <tr key={h.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '8px', fontWeight: '600', color: '#f8fafc' }}>{h.roleName} ({h.roleCode})</td>
                    <td style={{ padding: '8px' }}>{new Date(h.assignedAt).toLocaleDateString()}</td>
                    <td style={{ padding: '8px', color: '#f87171' }}>{h.removedAt ? new Date(h.removedAt).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#334155', color: '#94a3b8', fontSize: '0.7rem' }}>
                        Removed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      <AddRoleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        userId={userId}
        activeRoleIds={activeRoleIds}
        onRoleAssigned={handleRoleUpdated}
      />

      {/* Remove Role Dialog */}
      <RemoveRoleDialog
        isOpen={removeDialogState.isOpen}
        onClose={() => setRemoveDialogState({ isOpen: false, roleId: null })}
        userId={userId}
        roleId={removeDialogState.roleId}
        onRoleRemoved={handleRoleUpdated}
      />
    </div>
  );
};
