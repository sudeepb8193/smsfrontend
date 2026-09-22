import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { StaffRoutes } from './StaffRoutes';
import { AuditRoutes } from './AuditRoutes';
import { OperationsRoutes } from './OperationsRoutes';
import { OrganizationRoutes } from './OrganizationRoutes';
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

      {/* Protected Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Sub-Routes */}
          {OrganizationRoutes}
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
