import React, { useState, useEffect, useCallback } from 'react';
import { userApi } from '../../../services/user.api';
import { UserStatusBadge } from '../components/UserStatusBadge';
import { AddUserModal } from '../components/AddUserModal';
import { AcceptInviteModal } from '../components/AcceptInviteModal';
import { UserProfileModal } from '../components/UserProfileModal';
import {
  Users,
  Settings,
  Plus,
  Search,
  Mail,
  Phone,
  Shield,
  RotateCcw,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
  Clock,
} from 'lucide-react';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAcceptInviteOpen, setIsAcceptInviteOpen] = useState(false);
  const [selectedInviteToken, setSelectedInviteToken] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [resendNotification, setResendNotification] = useState({ type: '', text: '' });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await userApi.getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 10,
      });
      setUsers(res.data || []);
      setMeta(res.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to load user accounts.');
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleResendInvite = async (userId) => {
    try {
      setResendNotification({ type: 'info', text: 'Resending invitation...' });
      const res = await userApi.resendInvite(userId);
      setResendNotification({
        type: 'success',
        text: `Invitation resent! ${res.invitationUrl ? `Link: ${res.invitationUrl}` : ''}`,
      });
      fetchUsers();
    } catch (err) {
      setResendNotification({ type: 'error', text: err.message || 'Failed to resend invitation.' });
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user? They will not be able to sign in.')) {
      return;
    }
    try {
      await userApi.deactivateUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to deactivate user.');
    }
  };

  const handleReactivate = async (userId) => {
    try {
      await userApi.reactivateUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to reactivate user.');
    }
  };

  const formatLastLogin = (user) => {
    if (!user.lastLoginAt) return <span style={{ color: 'var(--text-muted)' }}>Never logged in</span>;
    const dateStr = new Date(user.lastLoginAt).toLocaleString();
    return (
      <div>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: '500' }}>{dateStr}</div>
        {user.lastLoginIp && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            IP: {user.lastLoginIp}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        color: 'var(--text-primary)',
        width: '100%',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={28} color="var(--primary)" /> User Management
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Manage staff credentials, invitations, roles, and authentication security.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Settings size={16} /> My Security
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      {/* Global Toast / Banner Message */}
      {resendNotification.text && (
        <div
          style={{
            padding: '14px 20px',
            backgroundColor:
              resendNotification.type === 'error'
                ? 'var(--danger-light)'
                : 'var(--success-light)',
            border: `1px solid ${
              resendNotification.type === 'error'
                ? 'var(--danger)'
                : 'var(--success)'
            }`,
            borderRadius: '12px',
            color: resendNotification.type === 'error' ? 'var(--danger)' : 'var(--success)',
            fontSize: '0.88rem',
            fontWeight: '600',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {resendNotification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {resendNotification.text}
          </span>
          <button
            onClick={() => setResendNotification({ type: '', text: '' })}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          padding: '18px 22px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'active', 'pending', 'expired', 'deactivated'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              style={{
                padding: '7px 16px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: statusFilter === st ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: statusFilter === st ? 'var(--primary)' : 'transparent',
                color: statusFilter === st ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '0.84rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Role Filters */}
        <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '520px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, or phone..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="BRANCH_MANAGER">Branch Manager</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="FRONT_DESK">Front Desk</option>
            <option value="SERVICE_STAFF">Service Staff</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '56px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ marginBottom: '12px', animation: 'spin 1s linear infinite' }} />
            <div>Loading user accounts...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '56px', textAlign: 'center', color: 'var(--danger)' }}>
            <AlertCircle size={32} style={{ marginBottom: '12px' }} />
            <div>{error}</div>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <Users size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No user accounts found</h3>
            <p style={{ margin: '0 0 20px 0', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {search || roleFilter || statusFilter !== 'all'
                ? 'Try adjusting your search or filter parameters.'
                : 'Create your first system user account to grant team access.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary"
            >
              + Create User
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  <th style={{ padding: '16px 24px' }}>User Details</th>
                  <th style={{ padding: '16px 24px' }}>Contact Info</th>
                  <th style={{ padding: '16px 24px' }}>Role</th>
                  <th style={{ padding: '16px 24px' }}>Account Status</th>
                  <th style={{ padding: '16px 24px' }}>Last Login</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.2s',
                    }}
                  >
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.96rem' }}>
                        {u.displayName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        UUID: {u.uuid ? u.uuid.substring(0, 18) : u.id}...
                      </div>
                    </td>

                    <td style={{ padding: '18px 24px', fontSize: '0.9rem' }}>
                      {u.email && (
                        <div style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={14} color="var(--text-muted)" /> {u.email}
                        </div>
                      )}
                      {u.phoneNumber && (
                        <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <Phone size={14} color="var(--text-muted)" /> {u.phoneCountryCode || ''} {u.phoneNumber}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '18px 24px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: '700',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          border: '1px solid var(--border-hover)',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td style={{ padding: '18px 24px' }}>
                      <UserStatusBadge status={u.status} />
                    </td>

                    <td style={{ padding: '18px 24px' }}>{formatLastLogin(u)}</td>

                    <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {(u.status === 'pending' || u.status === 'expired') && (
                          <button
                            onClick={() => handleResendInvite(u.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'var(--warning-light)',
                              color: 'var(--warning)',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <RotateCcw size={13} /> Resend Invite
                          </button>
                        )}

                        {u.status === 'deactivated' ? (
                          <button
                            onClick={() => handleReactivate(u.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'var(--success-light)',
                              color: 'var(--success)',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <UserCheck size={13} /> Reactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'var(--danger-light)',
                              color: 'var(--danger)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <UserX size={13} /> Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div
            style={{
              padding: '16px 24px',
              backgroundColor: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div>
              Page {meta.page} of {meta.totalPages} ({meta.total} users total)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserCreated={() => fetchUsers()}
      />

      <AcceptInviteModal
        isOpen={isAcceptInviteOpen}
        onClose={() => setIsAcceptInviteOpen(false)}
        defaultToken={selectedInviteToken}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
