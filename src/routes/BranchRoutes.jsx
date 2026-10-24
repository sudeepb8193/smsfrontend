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
    <Route path="/branches" element={<BranchListPage />} />
    <Route
      element={
        <RoleGuard
          allowedRoles={['OWNER', 'Owner', 'SUPER_ADMIN', 'Super Admin', 'BRANCH_MANAGER', 'Branch Manager']}
        />
      }
    >
      <Route path="/branches/:branchId/edit" element={<BranchEditPage />} />
    </Route>
    <Route
      element={
        <RoleGuard
          allowedRoles={['OWNER', 'Owner', 'SUPER_ADMIN', 'Super Admin']}
        />
      }
    >
      <Route path="/branches/create" element={<BranchCreatePage />} />
    </Route>
    <Route path="/branches/:branchId" element={<BranchDetailsPage />} />
  </>
);

export default BranchRoutes;
