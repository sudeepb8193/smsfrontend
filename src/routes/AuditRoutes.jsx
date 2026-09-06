import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import Card from '../components/common/Card/Card';
import PageHeader from '../components/layout/PageHeader/PageHeader';
import { FileText, ShieldAlert } from 'lucide-react';

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

export const AuditRoutes = [
  <Route key="audit-history" path="/audit/history" element={<ModulePlaceholder title="Audit Activity History" description="Comprehensive system audit log history (Module 50 logging)." icon={FileText} />} />,
  <Route key="audit-incidents" path="/audit/incidents" element={<ModulePlaceholder title="Security Incident Log" description="Real-time security alert events and incident activity logs." icon={ShieldAlert} />} />,
  <Route key="audit-redirect" path="/audit" element={<Navigate to="/audit/history" replace />} />,
];
