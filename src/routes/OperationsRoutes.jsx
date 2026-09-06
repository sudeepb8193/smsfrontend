import React from 'react';
import { Route } from 'react-router-dom';
import Card from '../components/common/Card/Card';
import PageHeader from '../components/layout/PageHeader/PageHeader';
import {
  Users,
  Calendar,
  Sparkles,
  ShoppingBag,
  Boxes,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';

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

export const OperationsRoutes = [
  <Route key="customers" path="/customers" element={<ModulePlaceholder title="Customers Management" description="Manage salon clients, loyalty points, and visit history." icon={Users} />} />,
  <Route key="appointments" path="/appointments" element={<ModulePlaceholder title="Appointment Booking" description="Real-time appointment calendar and booking queue." icon={Calendar} />} />,
  <Route key="services" path="/services" element={<ModulePlaceholder title="Salon Services" description="Service catalog, pricing tiers, and duration setup." icon={Sparkles} />} />,
  <Route key="products" path="/products" element={<ModulePlaceholder title="Product Catalog" description="Retail haircare and beauty products inventory." icon={ShoppingBag} />} />,
  <Route key="inventory" path="/inventory" element={<ModulePlaceholder title="Inventory & Stock" description="Stock levels, reorder alerts, and supplier logs." icon={Boxes} />} />,
  <Route key="billing" path="/billing" element={<ModulePlaceholder title="Billing & POS" description="Point-of-sale checkout, invoices, and payment processing." icon={Receipt} />} />,
  <Route key="reports" path="/reports" element={<ModulePlaceholder title="Business Reports" description="Revenue analytics, staff performance, and tax reports." icon={BarChart3} />} />,
  <Route key="settings" path="/settings" element={<ModulePlaceholder title="System Settings" description="General salon preferences, security policies, and scopes." icon={SettingsIcon} />} />,
];
