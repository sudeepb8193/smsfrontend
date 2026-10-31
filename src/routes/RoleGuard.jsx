import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasPermission } from '../utils/permissionUtils';
import UnauthorizedAccess from '../components/shared/UnauthorizedAccess';

export const RoleGuard = ({
  allowedRoles = [],
  requiredPermission = null,
  requiredPermissions = [],
  resourceName = null,
  renderInline = true,
  redirectTo = '/unauthorized',
}) => {
  const { user, role: contextRole } = useAuth();
  const userRole = contextRole || user?.role || user?.roleSlug || user?.roleName || '';
  const normUserRole = String(userRole).toUpperCase().replace(/[\s-]+/g, '_');

  // Super Admin platform role has full system bypass across multi-tenant platform
  if (normUserRole === 'SUPER_ADMIN') {
    return <Outlet />;
  }

  // 1. Permission check: requiredPermission (MANDATORY if specified)
  if (requiredPermission) {
    if (!hasPermission(user, requiredPermission)) {
      if (renderInline) {
        return (
          <UnauthorizedAccess
            title="Access Restricted"
            message="You do not have the necessary permissions required to view or access this feature."
            requiredPermission={requiredPermission}
            resourceName={resourceName}
          />
        );
      }
      return <Navigate to={redirectTo} replace />;
    }
  }

  // 2. Permission check: requiredPermissions (all required)
  if (Array.isArray(requiredPermissions) && requiredPermissions.length > 0) {
    const missingPerms = requiredPermissions.filter((perm) => !hasPermission(user, perm));
    if (missingPerms.length > 0) {
      if (renderInline) {
        return (
          <UnauthorizedAccess
            title="Access Restricted"
            message="You do not have the necessary permissions required to view or access this feature."
            requiredPermission={missingPerms.join(', ')}
            resourceName={resourceName}
          />
        );
      }
      return <Navigate to={redirectTo} replace />;
    }
  }

  // 3. Fallback: Role-based check (if allowedRoles is specified)
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.some(
      (r) => r.toUpperCase().replace(/[\s-]+/g, '_') === normUserRole,
    );
    if (!isAllowed) {
      if (renderInline) {
        return (
          <UnauthorizedAccess
            title="Role Restricted"
            message="Your current role does not have authorization to view this section."
            requiredRole={allowedRoles.join(' / ')}
            resourceName={resourceName}
          />
        );
      }
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <Outlet />;
};

export default RoleGuard;
