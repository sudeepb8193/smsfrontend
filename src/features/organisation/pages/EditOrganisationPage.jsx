import React from 'react';
import { Building2, Loader2 } from 'lucide-react';
import OrganisationForm from '../components/OrganisationForm';
import { useOrganisationEdit } from '../hooks/useOrganisation';

export const EditOrganisationPage = () => {
  const {
    organisation,
    fetchLoading,
    loading,
    serverError,
    handleSubmit,
  } = useOrganisationEdit();

  if (fetchLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-[var(--text-muted)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-2" />
        <p className="text-sm font-medium">Loading Organisation Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary-500" />
          Edit Organisation: {organisation?.name}
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Update profile information, address, business details, and subscription parameters
        </p>
      </div>

      {/* Form */}
      <OrganisationForm
        initialValues={organisation}
        onSubmit={handleSubmit}
        isEditMode={true}
        loading={loading}
        serverError={serverError}
      />
    </div>
  );
};

export default EditOrganisationPage;
