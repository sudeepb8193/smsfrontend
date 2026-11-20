import React from 'react';
import { Building2 } from 'lucide-react';
import Loader from '../../../components/shared/Loader';
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
    return <Loader type="form" text="Loading Organisation Data..." />;
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
