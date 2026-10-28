import React from 'react';
import { usePermission } from '../../hooks/usePermission';

/**
 * HasPermission Component
 * 
 * Conditionally renders children if the authenticated user holds the required permission.
 * Supports:
 * <HasPermission permission="branches.create">
 *   <button>Add Branch</button>
 * </HasPermission>
 * 
 * Or:
 * <HasPermission module="branches" action="create">
 *   <button>Add Branch</button>
 * </HasPermission>
 */
export const HasPermission = ({
  permission,
  module,
  action,
  branchId = null,
  fallback = null,
  children,
}) => {
  const { can } = usePermission();

  const targetPerm = permission || (module && action ? `${module}.${action}` : null);
  if (!targetPerm) return <>{children}</>;

  const allowed = can(targetPerm, branchId);
  if (!allowed) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default HasPermission;
