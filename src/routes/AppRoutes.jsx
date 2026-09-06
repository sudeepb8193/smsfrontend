import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthRoutes } from './AuthRoutes';
import { OrganizationRoutes } from './OrganizationRoutes';
import { UserRoutes } from './UserRoutes';
import { StaffRoutes } from './StaffRoutes';
import { AuditRoutes } from './AuditRoutes';
import { OperationsRoutes } from './OperationsRoutes';
import { ProtectedRoute } from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root & Public Auth Routes */}
      {AuthRoutes}

      {/* Protected Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Modularized Sub-Routes */}
          {OrganizationRoutes}
          {UserRoutes}
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
