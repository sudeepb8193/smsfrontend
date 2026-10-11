import React from 'react';
import { Route } from 'react-router-dom';
import RoleGuard from './RoleGuard';
import SuperAdminRoleManagementPage from '../features/role-permission/pages/SuperAdminRoleManagementPage';
import RolePermissionsPage from '../features/role-permission/pages/RolePermissionsPage';
import PermissionCatalogPage from '../features/role-permission/pages/PermissionCatalogPage';
import StaffOverridesPage from '../features/role-permission/pages/StaffOverridesPage';

export const RolePermissionRoutes = (
  <>
    {/* Super Admin ONLY Protected Routes */}
    <Route element={<RoleGuard allowedRoles={['SUPER_ADMIN', 'Super Admin']} />}>
      <Route path="/super-admin/roles" element={<SuperAdminRoleManagementPage />} />
      <Route path="/super-admin/roles/:roleId/permissions" element={<RolePermissionsPage isSuperAdminView={true} />} />
      <Route path="/super-admin/permissions" element={<PermissionCatalogPage />} />
      <Route path="/super-admin/staff-overrides" element={<StaffOverridesPage />} />
    </Route>
  </>
);

export default RolePermissionRoutes;
