import React from 'react';
import { Route } from 'react-router-dom';
import RoleGuard from './RoleGuard';
import BranchListPage from '../features/branch/pages/BranchListPage';
import BranchCreatePage from '../features/branch/pages/BranchCreatePage';
import BranchDetailsPage from '../features/branch/pages/BranchDetailsPage';
import BranchEditPage from '../features/branch/pages/BranchEditPage';

// Route definitions are consumed by AppRoutes
export const BranchRoutes = (
  <>
    <Route
      element={
        <RoleGuard
          requiredPermission="branches.view"
          allowedRoles={['OWNER', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'FRONT_DESK']}
        />
      }
    >
      <Route path="/branches" element={<BranchListPage />} />
      <Route path="/branches/:branchId" element={<BranchDetailsPage />} />
    </Route>

    <Route
      element={
        <RoleGuard
          requiredPermission="branches.create"
          allowedRoles={['OWNER', 'SUPER_ADMIN']}
        />
      }
    >
      <Route path="/branches/create" element={<BranchCreatePage />} />
    </Route>

    <Route
      element={
        <RoleGuard
          requiredPermission="branches.edit"
          allowedRoles={['OWNER', 'SUPER_ADMIN', 'BRANCH_MANAGER']}
        />
      }
    >
      <Route path="/branches/:branchId/edit" element={<BranchEditPage />} />
    </Route>
  </>
);

export default BranchRoutes;
