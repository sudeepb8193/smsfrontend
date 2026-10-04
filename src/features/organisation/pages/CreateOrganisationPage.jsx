import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { createOrganisation } from '../api/organisationApi';
import OrganisationForm from '../components/OrganisationForm';

export const CreateOrganisationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setServerError(null);

    try {
      await createOrganisation(payload);
      navigate('/super-admin/organisations', {
        state: { message: 'Organisation created successfully.' },
      });
    } catch (err) {
      console.error('Failed to create organisation:', err);
      setServerError(err.message || 'Failed to create organisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          Create New Organisation
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Register a new salon tenant, owner account, default settings, and subscription entitlements
        </p>
      </div>

      {/* Form */}
      <OrganisationForm
        onSubmit={handleSubmit}
        loading={loading}
        serverError={serverError}
      />
    </div>
  );
};

export default CreateOrganisationPage;
