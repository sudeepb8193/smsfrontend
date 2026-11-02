import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import RoleGuard from './RoleGuard';
import StaffListPage from '../features/staff/pages/StaffListPage';
import StaffCreatePage from '../features/staff/pages/StaffCreatePage';
import StaffDetailsPage from '../features/staff/pages/StaffDetailsPage';
import StaffSelfProfilePage from '../features/staff/pages/StaffSelfProfilePage';
import StaffServicesPage from '../features/staff/pages/StaffServicesPage';
import StaffDesignationWorkspacePage from '../features/staff-designation/pages/StaffDesignationWorkspacePage';
import { UserManagementPage } from '../features/user/pages/UserManagementPage';
import { useAuth } from '../hooks/useAuth';

function StaffIndexRedirect() {
  const { user, role } = useAuth();
  const rawRole =
    role ||
    user?.role ||
    user?.roleSlug ||
    user?.roleName ||
    (Array.isArray(user?.roles) ? user.roles[0] : '') ||
    '';
  const normRole = String(rawRole).toUpperCase().replace(/[\s_-]+/g, '_');
  const allRoles = (user?.roles || []).map((r) => String(r).toUpperCase().replace(/[\s_-]+/g, '_'));
  const isManagement = ['SUPER_ADMIN', 'OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT', 'FRONT_DESK'].some(
    (m) => normRole === m || allRoles.includes(m),
  );
  const isServiceStaff =
    (normRole === 'SERVICE_STAFF' ||
      normRole === 'STAFF' ||
      allRoles.includes('SERVICE_STAFF') ||
      allRoles.includes('STAFF')) &&
    !isManagement;

  if (isServiceStaff) {
    return <Navigate to="/staff/me" replace />;
  }
  return <Navigate to="/staff/directory" replace />;
}

export const StaffRoutes = (
  <>
    {/* Staff Root Smart Redirector */}
    <Route path="/staff" element={<StaffIndexRedirect />} />

    {/* Dedicated Service Staff Self-Profile Page */}
    <Route
      element={
        <RoleGuard
          requiredPermission="staff.view"
          resourceName="My Profile"
          allowedRoles={[
            'SERVICE_STAFF',
            'STAFF',
            'OWNER',
            'SUPER_ADMIN',
            'BRANCH_MANAGER',
            'ACCOUNTANT',
            'FRONT_DESK',
          ]}
        />
      }
    >
      <Route path="/staff/me" element={<StaffSelfProfilePage />} />
      <Route path="/staff/my-services" element={<StaffServicesPage />} />
    </Route>

    {/* Staff Management Directory (HR Management View) */}
    <Route
      element={
        <RoleGuard
          requiredPermission="staff.view"
          resourceName="Staff Management"
          allowedRoles={[
            'OWNER',
            'SUPER_ADMIN',
            'BRANCH_MANAGER',
            'ACCOUNTANT',
            'FRONT_DESK',
          ]}
        />
      }
    >
      <Route path="/staff/directory" element={<StaffListPage />} />
      <Route path="/staff/:id" element={<StaffDetailsPage />} />
      <Route path="/staff/:id/assignments" element={<StaffDesignationWorkspacePage />} />
      <Route path="/staff/:id/designations" element={<StaffDesignationWorkspacePage />} />
    </Route>

    {/* Create Staff Record */}
    <Route
      element={
        <RoleGuard
          requiredPermission="staff.create"
          resourceName="Add Staff"
          allowedRoles={['OWNER', 'SUPER_ADMIN', 'BRANCH_MANAGER']}
        />
      }
    >
      <Route path="/staff/create" element={<StaffCreatePage />} />
    </Route>

    {/* User Management via Staff submenu */}
    <Route
      element={
        <RoleGuard
          requiredPermission="users.view"
          resourceName="User Management"
          allowedRoles={['OWNER', 'SUPER_ADMIN', 'BRANCH_MANAGER']}
        />
      }
    >
      <Route path="/staff/users" element={<UserManagementPage />} />
    </Route>
  </>
);

export default StaffRoutes;
