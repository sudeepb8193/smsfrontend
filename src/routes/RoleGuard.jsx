import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasPermission } from '../utils/permissionUtils';

export const RoleGuard = ({
  allowedRoles = [],
  requiredPermission = null,
  requiredPermissions = [],
  redirectTo = '/unauthorized',
}) => {
  const { user, role: contextRole } = useAuth();
  const userRole = contextRole || user?.role || user?.roleSlug || user?.roleName || '';
  const normUserRole = String(userRole).toUpperCase().replace(/[\s-]+/g, '_');

  // Super Admin and Owner have full access
  if (normUserRole === 'SUPER_ADMIN' || normUserRole === 'OWNER') {
    return <Outlet />;
  }

  // 1. Permission check: requiredPermission
  if (requiredPermission) {
    if (hasPermission(user, requiredPermission)) {
      return <Outlet />;
    }
  }

  // 2. Permission check: requiredPermissions (all required)
  if (Array.isArray(requiredPermissions) && requiredPermissions.length > 0) {
    const hasAll = requiredPermissions.every((perm) => hasPermission(user, perm));
    if (hasAll) {
      return <Outlet />;
    }
  }

  // 3. Fallback: Role-based check
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.some(
      (r) => r.toUpperCase().replace(/[\s-]+/g, '_') === normUserRole,
    );
    if (isAllowed) {
      return <Outlet />;
    }
  }

  // If neither permission nor role is allowed
  return <Navigate to={redirectTo} replace />;
};

export default RoleGuard;
