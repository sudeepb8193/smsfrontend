import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';
import { UserManagementPage } from '../features/users/pages/UserManagementPage';
import { OrganizationManagementPage } from '../features/organization/pages/OrganizationManagementPage';
import Card from '../components/common/Card/Card';
import PageHeader from '../components/layout/PageHeader/PageHeader';
import {
  Users,
  Scissors,
  Calendar,
  Sparkles,
  ShoppingBag,
  Boxes,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
  ShieldAlert,
  Sliders,
  Image as ImageIcon,
  FileText,
  Clock,
  Building2,
} from 'lucide-react';

const ModulePlaceholder = ({ title, description, icon: Icon }) => (
  <div className="space-y-6">
    <PageHeader title={title} description={description} />
    <Card>
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#8A4A52]/15 text-[#8A4A52] flex items-center justify-center mb-4">
          <Icon size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-[#8E7A86] max-w-md">
          {description || 'This feature module is ready for business logic integration.'}
        </p>
      </div>
    </Card>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/organization/profile" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Organization Routes */}
        <Route path="/organization/profile" element={<OrganizationManagementPage />} />
        <Route path="/organization/contacts" element={<OrganizationManagementPage />} />
        <Route path="/organization/addresses" element={<OrganizationManagementPage />} />
        <Route path="/organization/tax" element={<OrganizationManagementPage />} />
        <Route path="/organization/settings" element={<OrganizationManagementPage />} />
        <Route path="/organization/hours" element={<OrganizationManagementPage />} />
        <Route path="/organization/holidays" element={<OrganizationManagementPage />} />
        <Route path="/organization/branding" element={<OrganizationManagementPage />} />
        <Route path="/organization" element={<Navigate to="/organization/profile" replace />} />

        {/* User Management Routes */}
        <Route path="/users/credentials" element={<UserManagementPage />} />
        <Route path="/users/roles" element={<ModulePlaceholder title="Role Permissions & Scopes" description="Granular role-based access control (RBAC) permission rules." icon={Sliders} />} />
        <Route path="/users/security" element={<ModulePlaceholder title="Session Security & 2FA" description="Two-factor authentication policies and active session security." icon={ShieldAlert} />} />
        <Route path="/users" element={<Navigate to="/users/credentials" replace />} />

        {/* Staff Routes */}
        <Route path="/staff/directory" element={<ModulePlaceholder title="Staff HR Directory" description="Manage hair stylists, staff employee records, and designations." icon={Scissors} />} />
        <Route path="/staff/rosters" element={<ModulePlaceholder title="Shift Rosters & Schedules" description="Weekly staff work rosters and shift scheduling interface." icon={Clock} />} />
        <Route path="/staff" element={<Navigate to="/staff/directory" replace />} />

        {/* Audit & Security Routes */}
        <Route path="/audit/history" element={<ModulePlaceholder title="Audit Activity History" description="Comprehensive system audit log history (Module 50 logging)." icon={FileText} />} />
        <Route path="/audit/incidents" element={<ModulePlaceholder title="Security Incident Log" description="Real-time security alert events and incident activity logs." icon={ShieldAlert} />} />
        <Route path="/audit" element={<Navigate to="/audit/history" replace />} />

        {/* Other Operations */}
        <Route path="/customers" element={<ModulePlaceholder title="Customers Management" description="Manage salon clients, loyalty points, and visit history." icon={Users} />} />
        <Route path="/appointments" element={<ModulePlaceholder title="Appointment Booking" description="Real-time appointment calendar and booking queue." icon={Calendar} />} />
        <Route path="/services" element={<ModulePlaceholder title="Salon Services" description="Service catalog, pricing tiers, and duration setup." icon={Sparkles} />} />
        <Route path="/products" element={<ModulePlaceholder title="Product Catalog" description="Retail haircare and beauty products inventory." icon={ShoppingBag} />} />
        <Route path="/inventory" element={<ModulePlaceholder title="Inventory & Stock" description="Stock levels, reorder alerts, and supplier logs." icon={Boxes} />} />
        <Route path="/billing" element={<ModulePlaceholder title="Billing & POS" description="Point-of-sale checkout, invoices, and payment processing." icon={Receipt} />} />
        <Route path="/reports" element={<ModulePlaceholder title="Business Reports" description="Revenue analytics, staff performance, and tax reports." icon={BarChart3} />} />
        <Route path="/settings" element={<ModulePlaceholder title="System Settings" description="General salon preferences, security policies, and scopes." icon={SettingsIcon} />} />

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
