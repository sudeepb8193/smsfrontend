import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { OrganizationManagementPage } from '../features/organization/pages/OrganizationManagementPage';

export const OrganizationRoutes = [
  <Route key="org-profile" path="/organization/profile" element={<OrganizationManagementPage />} />,
  <Route key="org-contacts" path="/organization/contacts" element={<OrganizationManagementPage />} />,
  <Route key="org-addresses" path="/organization/addresses" element={<OrganizationManagementPage />} />,
  <Route key="org-tax" path="/organization/tax" element={<OrganizationManagementPage />} />,
  <Route key="org-settings" path="/organization/settings" element={<OrganizationManagementPage />} />,
  <Route key="org-hours" path="/organization/hours" element={<OrganizationManagementPage />} />,
  <Route key="org-holidays" path="/organization/holidays" element={<OrganizationManagementPage />} />,
  <Route key="org-branding" path="/organization/branding" element={<OrganizationManagementPage />} />,
  <Route key="org-redirect" path="/organization" element={<Navigate to="/organization/profile" replace />} />,
];
