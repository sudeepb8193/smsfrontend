import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import Card from '../components/common/Card/Card';
import PageHeader from '../components/layout/PageHeader/PageHeader';
import { Scissors, Clock } from 'lucide-react';

import { UserManagementPage } from '../features/user/pages/UserManagementPage';

const ModulePlaceholder = ({ title, description, icon: Icon }) => (
  <div className="space-y-6">
    <PageHeader title={title} description={description} />
    <Card>
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-500/15 text-primary-500 flex items-center justify-center mb-4">
          <Icon size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-[#8E7A86] max-w-md">
          {description || 'This feature module is ready for business logic integration.'}
        </p>
      </div>
    </Card>
  </div>
);

export const StaffRoutes = [
  <Route key="user-roles" path="/staff/users" element={<UserManagementPage />} />,
  <Route key="staff-directory" path="/staff/directory" element={<ModulePlaceholder title="Staff HR Directory" description="Manage hair stylists, staff employee records, and designations." icon={Scissors} />} />,
  <Route key="staff-rosters" path="/staff/rosters" element={<ModulePlaceholder title="Shift Rosters & Schedules" description="Weekly staff work rosters and shift scheduling interface." icon={Clock} />} />,
  <Route key="staff-redirect" path="/staff" element={<Navigate to="/staff/directory" replace />} />,
];
