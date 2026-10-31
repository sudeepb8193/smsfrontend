import React from 'react';
import { Building2 } from 'lucide-react';
import OrganisationForm from '../components/OrganisationForm';
import { useOrganisationCreate } from '../hooks/useOrganisation';

export const CreateOrganisationPage = () => {
  const { loading, serverError, handleSubmit } = useOrganisationCreate();

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary-500" />
          Create New Organisation
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
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
