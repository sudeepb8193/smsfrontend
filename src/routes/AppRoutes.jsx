import { Routes, Route, Navigate } from 'react-router-dom';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import ContactEmailVerificationPage from '../features/auth/pages/ContactEmailVerificationPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { StaffRoutes } from './StaffRoutes';
import { AuditRoutes } from './AuditRoutes';
import { OrganizationRoutes } from './OrganizationRoutes';
import { BranchRoutes } from './BranchRoutes';
import { RolePermissionRoutes } from './RolePermissionRoutes';
import { OperationsRoutes } from './OperationsRoutes';
import { AcceptInvitePage } from '../features/user/pages/AcceptInvitePage';
import { UserManagementPage } from '../features/user/pages/UserManagementPage';
import DashboardLayout from '../components/layout/DashboardLayout/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root & Public Auth Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-contact-email" element={<ContactEmailVerificationPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />

      {/* Protected Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* User Management Route (Super Admin, Owner, Branch Manager only) */}
          <Route element={<RoleGuard requiredPermission="users.view" resourceName="User Management" allowedRoles={['SUPER_ADMIN', 'OWNER', 'BRANCH_MANAGER']} />}>
            <Route path="/users" element={<UserManagementPage />} />
          </Route>

          {/* Sub-Routes */}
          {OrganizationRoutes}
          {BranchRoutes}
          {RolePermissionRoutes}
          {StaffRoutes}
          {AuditRoutes}
          {OperationsRoutes}

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
