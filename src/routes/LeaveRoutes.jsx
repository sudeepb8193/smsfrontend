import React from 'react';
import { Route } from 'react-router-dom';
import RoleGuard from './RoleGuard';
import StaffLeaveWorkspacePage from '../features/staff-leave/pages/StaffLeaveWorkspacePage';

export const LeaveRoutes = (
  <>
    {/* Staff Leave Main Workspace */}
    <Route
      element={
        <RoleGuard
          requiredPermission="staff_leave.view"
          resourceName="Staff Leave Management"
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
      <Route path="/leave" element={<StaffLeaveWorkspacePage />} />
      <Route path="/leave/my-leave" element={<StaffLeaveWorkspacePage />} />
    </Route>
  </>
);

export default LeaveRoutes;
