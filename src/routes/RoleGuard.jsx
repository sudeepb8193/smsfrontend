import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RoleGuard = ({ allowedRoles = [] }) => {
  const { user, role: contextRole } = useAuth();
  const userRole = contextRole || user?.role || user?.roleSlug || user?.roleName || '';
  const normUserRole = String(userRole).toUpperCase().replace(/\s+/g, '_');

  const isAllowed = allowedRoles.some(
    (r) => r.toUpperCase().replace(/\s+/g, '_') === normUserRole
  );

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
