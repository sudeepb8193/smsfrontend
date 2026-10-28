import { useMemo } from 'react';
import { useAuth } from './useAuth';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '../utils/permissionUtils';

/**
 * usePermission Hook
 * 
 * Provides reactive authorization checks for buttons, pages, and UI components.
 * Supports all 7 standard actions:
 * - View / view
 * - Create / create
 * - Edit / edit
 * - Delete / delete
 * - Approve / approve
 * - Export / export
 * - Print / print
 */
export const usePermission = () => {
  const { user } = useAuth();

  const roleSlug = String(
    user?.roleSlug || user?.role || user?.roleName || '',
  ).toLowerCase().replace(/[\s_-]+/g, '-');
  const userRoles = (user?.roles || []).map((r) =>
    String(r).toLowerCase().replace(/[\s_-]+/g, '-'),
  );

  const isSuperAdmin = roleSlug === 'super-admin' || userRoles.includes('super-admin');
  const isOwner = roleSlug === 'owner' || userRoles.includes('owner');

  const permissions = useMemo(() => {
    return Array.isArray(user?.permissions) ? user.permissions : [];
  }, [user?.permissions]);

  /**
   * Generic permission check: can('branches.create') or can('branch.create', branchId)
   */
  const can = (permissionKey, branchId = null) => {
    return hasPermission(user, permissionKey, branchId);
  };

  /**
   * Check if user has any of the listed permissions
   */
  const canAny = (permissionKeys, branchId = null) => {
    return hasAnyPermission(user, permissionKeys, branchId);
  };

  /**
   * Check if user has all of the listed permissions
   */
  const canAll = (permissionKeys, branchId = null) => {
    return hasAllPermissions(user, permissionKeys, branchId);
  };

  /**
   * Action-specific CRUD helpers for any module
   * e.g. canView('branches'), canCreate('branches'), canEdit('branches'), etc.
   */
  const canView = (moduleCode, branchId = null) => can(`${moduleCode}.view`, branchId);
  const canCreate = (moduleCode, branchId = null) => can(`${moduleCode}.create`, branchId);
  const canEdit = (moduleCode, branchId = null) => can(`${moduleCode}.edit`, branchId);
  const canDelete = (moduleCode, branchId = null) => can(`${moduleCode}.delete`, branchId);
  const canApprove = (moduleCode, branchId = null) => can(`${moduleCode}.approve`, branchId);
  const canExport = (moduleCode, branchId = null) => can(`${moduleCode}.export`, branchId);
  const canPrint = (moduleCode, branchId = null) => can(`${moduleCode}.print`, branchId);

  return {
    can,
    canAny,
    canAll,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canApprove,
    canExport,
    canPrint,
    isSuperAdmin,
    isOwner,
    user,
    permissions,
  };
};

export default usePermission;
