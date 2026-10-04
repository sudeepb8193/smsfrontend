import React from 'react';
import { Route } from 'react-router-dom';
import RoleGuard from './RoleGuard';
import OrganisationListPage from '../features/organisation/pages/OrganisationListPage';
import CreateOrganisationPage from '../features/organisation/pages/CreateOrganisationPage';
import OrganisationDetailsPage from '../features/organisation/pages/OrganisationDetailsPage';
import EditOrganisationPage from '../features/organisation/pages/EditOrganisationPage';

export const OrganizationRoutes = (
  <Route element={<RoleGuard allowedRoles={['SUPER_ADMIN', 'Super Admin']} />}>
    <Route path="/super-admin/organisations" element={<OrganisationListPage />} />
    <Route path="/super-admin/organisations/create" element={<CreateOrganisationPage />} />
    <Route path="/super-admin/organisations/:organisationId" element={<OrganisationDetailsPage />} />
    <Route path="/super-admin/organisations/:organisationId/edit" element={<EditOrganisationPage />} />
  </Route>
);

export default OrganizationRoutes;
