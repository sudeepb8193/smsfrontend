import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, UserX, Circle } from 'lucide-react';

export const UserStatusBadge = ({ status }) => {
  const getBadgeConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          bg: 'var(--success-light)',
          color: 'var(--success)',
          border: 'rgba(16, 185, 129, 0.4)',
          Icon: CheckCircle2,
        };
      case 'pending':
        return {
          label: 'Invite Sent — Awaiting Setup',
          bg: 'var(--warning-light)',
          color: 'var(--warning)',
          border: 'rgba(245, 158, 11, 0.4)',
          Icon: Clock,
        };
      case 'expired':
        return {
          label: 'Invite Expired',
          bg: 'var(--danger-light)',
          color: 'var(--danger)',
          border: 'rgba(239, 68, 68, 0.4)',
          Icon: AlertTriangle,
        };
      case 'deactivated':
        return {
          label: 'Deactivated',
          bg: 'rgba(107, 114, 128, 0.18)',
          color: 'var(--text-muted)',
          border: 'rgba(107, 114, 128, 0.4)',
          Icon: UserX,
        };
      default:
        return {
          label: status || 'Unknown',
          bg: 'rgba(107, 114, 128, 0.15)',
          color: 'var(--text-muted)',
          border: 'rgba(107, 114, 128, 0.3)',
          Icon: Circle,
        };
    }
  };

  const config = getBadgeConfig(status);
  const StatusIcon = config.Icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '0.78rem',
        fontWeight: '700',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
      }}
      aria-label={`Status: ${config.label}`}
    >
      <StatusIcon size={14} />
      {config.label}
    </span>
  );
};
