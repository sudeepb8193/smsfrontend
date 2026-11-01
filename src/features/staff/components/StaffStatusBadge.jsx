import React from 'react';
import Badge from '../../../components/shared/Badge';

export function StaffStatusBadge({ status }) {
  const normalized = (status || 'active').toLowerCase();

  switch (normalized) {
    case 'active':
      return <Badge variant="success">Active</Badge>;
    case 'on_leave':
      return <Badge variant="warning">On Leave</Badge>;
    case 'suspended':
      return <Badge variant="danger">Suspended</Badge>;
    case 'terminated':
      return <Badge variant="neutral">Terminated</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}

export default StaffStatusBadge;

