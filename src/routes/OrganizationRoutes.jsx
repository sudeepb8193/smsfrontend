import { Route } from 'react-router-dom';
import RoleGuard from './RoleGuard';
import OrganisationListPage from '../features/organisation/pages/OrganisationListPage';
import CreateOrganisationPage from '../features/organisation/pages/CreateOrganisationPage';
import OrganisationDetailsPage from '../features/organisation/pages/OrganisationDetailsPage';
import EditOrganisationPage from '../features/organisation/pages/EditOrganisationPage';
import OrganisationSetupPage from '../features/organisation/pages/OrganisationSetupPage';

// Route definitions are consumed by AppRoutes rather than rendered as a standalone component.
// eslint-disable-next-line react-refresh/only-export-components
export const OrganizationRoutes = (
  <>
    <Route
      element={
        <RoleGuard
          requiredPermission="organizations.view"
          allowedRoles={['SUPER_ADMIN', 'Super Admin']}
        />
      }
    >
      <Route path="/super-admin/organisations" element={<OrganisationListPage />} />
      <Route path="/super-admin/organisations/:organisationId" element={<OrganisationDetailsPage />} />
    </Route>

    <Route
      element={
        <RoleGuard
          requiredPermission="organizations.create"
          allowedRoles={['SUPER_ADMIN', 'Super Admin']}
        />
      }
    >
      <Route path="/super-admin/organisations/create" element={<CreateOrganisationPage />} />
    </Route>

    <Route
      element={
        <RoleGuard
          requiredPermission="organizations.edit"
          allowedRoles={['SUPER_ADMIN', 'Super Admin']}
        />
      }
    >
      <Route path="/super-admin/organisations/:organisationId/setup" element={<OrganisationSetupPage />} />
      <Route path="/super-admin/organisations/:organisationId/edit" element={<EditOrganisationPage />} />
    </Route>

    <Route
      element={
        <RoleGuard
          requiredPermission="organizations.edit"
          allowedRoles={['OWNER', 'Owner', 'SUPER_ADMIN', 'Super Admin']}
        />
      }
    >
      <Route path="/owner/organisation/setup" element={<OrganisationSetupPage />} />
    </Route>
  </>
);

export default OrganizationRoutes;
