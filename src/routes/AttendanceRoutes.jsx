import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import RoleGuard from './RoleGuard';
import StaffAttendanceWorkspacePage from '../features/staff-attendance/pages/StaffAttendanceWorkspacePage';
import AttendanceKioskPage from '../features/staff-attendance/pages/AttendanceKioskPage';
import { useAuth } from '../hooks/useAuth';

function AttendanceIndexRedirect() {
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
    return <StaffAttendanceWorkspacePage />;
  }

  return <StaffAttendanceWorkspacePage />;
}

export const AttendanceRoutes = (
  <>
    {/* Staff Attendance Main Workspace */}
    <Route
      element={
        <RoleGuard
          requiredPermission="staff_attendance.view"
          resourceName="Staff Attendance"
          allowedRoles={[
            'SUPER_ADMIN',
            'OWNER',
            'BRANCH_MANAGER',
            'ACCOUNTANT',
            'FRONT_DESK',
            'SERVICE_STAFF',
            'STAFF',
          ]}
        />
      }
    >
      <Route path="/attendance" element={<AttendanceIndexRedirect />} />
      <Route path="/attendance/my-attendance" element={<StaffAttendanceWorkspacePage />} />
    </Route>

    {/* Front-Desk Kiosk Terminal */}
    <Route
      element={
        <RoleGuard
          resourceName="Attendance Kiosk"
          allowedRoles={[
            'SUPER_ADMIN',
            'OWNER',
            'BRANCH_MANAGER',
            'FRONT_DESK',
          ]}
        />
      }
    >
      <Route path="/attendance/kiosk" element={<AttendanceKioskPage />} />
    </Route>
  </>
);

export default AttendanceRoutes;
