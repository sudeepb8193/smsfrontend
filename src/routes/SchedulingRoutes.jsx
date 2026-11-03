import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import RoleGuard from './RoleGuard';
import StaffSchedulingWorkspacePage from '../features/staff-scheduling/pages/StaffSchedulingWorkspacePage';
import StaffSelfSchedulePage from '../features/staff-scheduling/pages/StaffSelfSchedulePage';
import { useAuth } from '../hooks/useAuth';

function SchedulingIndexRedirect() {
  const { user, role } = useAuth();
  const rawRole =
    role ||
    user?.role ||
    user?.roleSlug ||
    user?.roleName ||
    (Array.isArray(user?.roles) ? user.roles[0] : '') ||
    '';
  const normRole = String(rawRole).toUpperCase().replace(/[\s_-]+/g, '_');
  const allRoles = (user?.roles || []).map((r) =>
    String(r).toUpperCase().replace(/[\s_-]+/g, '_'),
  );

  const isManagement = ['SUPER_ADMIN', 'OWNER', 'BRANCH_MANAGER', 'FRONT_DESK'].some(
    (m) => normRole === m || allRoles.includes(m),
  );

  const isServiceStaff =
    (normRole === 'SERVICE_STAFF' ||
      normRole === 'STAFF' ||
      allRoles.includes('SERVICE_STAFF') ||
      allRoles.includes('STAFF')) &&
    !isManagement;

  if (isServiceStaff) {
    return <Navigate to="/scheduling/my-schedule" replace />;
  }
  return <StaffSchedulingWorkspacePage />;
}

export const SchedulingRoutes = (
  <>
    {/* Scheduling Root Smart Redirector */}
    <Route
      element={
        <RoleGuard
          requiredPermission="staff_schedule.view"
          resourceName="Staff Scheduling"
          allowedRoles={[
            'SUPER_ADMIN',
            'OWNER',
            'BRANCH_MANAGER',
            'FRONT_DESK',
            'SERVICE_STAFF',
            'STAFF',
          ]}
        />
      }
    >
      <Route path="/scheduling" element={<SchedulingIndexRedirect />} />
    </Route>

    {/* Service Staff Self-Service Schedule Portal */}
    <Route
      element={
        <RoleGuard
          requiredPermission="staff_schedule.view"
          resourceName="My Schedule"
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
      <Route path="/scheduling/my-schedule" element={<StaffSelfSchedulePage />} />
    </Route>

    {/* Manager / Admin Scheduling Hub */}
    <Route
      element={
        <RoleGuard
          requiredPermission="staff_schedule.view"
          resourceName="Staff Scheduling Hub"
          allowedRoles={['SUPER_ADMIN', 'OWNER', 'BRANCH_MANAGER', 'FRONT_DESK']}
        />
      }
    >
      <Route path="/scheduling/hub" element={<StaffSchedulingWorkspacePage />} />
    </Route>
  </>
);

export default SchedulingRoutes;

