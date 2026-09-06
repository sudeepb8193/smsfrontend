import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { UserManagementPage } from '../features/users/pages/UserManagementPage';
import Card from '../components/common/Card/Card';
import PageHeader from '../components/layout/PageHeader/PageHeader';
import { Sliders, ShieldAlert } from 'lucide-react';

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

export const UserRoutes = [
  <Route key="users-credentials" path="/users/credentials" element={<UserManagementPage />} />,
  <Route key="users-roles" path="/users/roles" element={<ModulePlaceholder title="Role Permissions & Scopes" description="Granular role-based access control (RBAC) permission rules." icon={Sliders} />} />,
  <Route key="users-security" path="/users/security" element={<ModulePlaceholder title="Session Security & 2FA" description="Two-factor authentication policies and active session security." icon={ShieldAlert} />} />,
  <Route key="users-redirect" path="/users" element={<Navigate to="/users/credentials" replace />} />,
];
