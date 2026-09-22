import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import OrganizationHubPage from '../features/organization/pages/OrganizationHubPage';
import BusinessHoursPage from '../features/organization/pages/BusinessHoursPage';
import CreateOrganizationPage from '../features/organization/pages/CreateOrganizationPage';
import HolidayCalendarPage from '../features/organization/pages/HolidayCalendarPage';

export const OrganizationRoutes = (
  <>
    <Route path="/organization" element={<Navigate to="/organization/setup" replace />} />
    <Route path="/organization/setup" element={<OrganizationHubPage initialTab="setup" />} />
    <Route path="/organization/create" element={<CreateOrganizationPage />} />
    <Route path="/organization/business-hours" element={<BusinessHoursPage />} />
    <Route path="/organization/holidays" element={<HolidayCalendarPage />} />
  </>
);

export default OrganizationRoutes;
