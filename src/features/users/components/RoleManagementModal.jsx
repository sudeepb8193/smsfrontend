import React from 'react';
import { RoleManagementSection } from './RoleManagementSection';
import { Shield, X } from 'lucide-react';

export const RoleManagementModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

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
        zIndex: 1050,
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '20px',
          border: '1px solid #334155',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          color: '#f8fafc',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={22} style={{ color: '#6366f1' }} />
              Role & Permission Management
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#94a3b8' }}>
              Assign and manage roles for <strong>{user.displayName}</strong> ({user.email || user.phoneNumber || `ID: ${user.id}`})
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <RoleManagementSection userId={user.id} displayName={user.displayName} />
      </div>
    </div>
  );
};
