import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, ArrowLeft, Loader2 } from 'lucide-react';
import {
  fetchOrganisationDetails,
  updateOrganisation,
} from '../api/organisationApi';
import OrganisationForm from '../components/OrganisationForm';

export const EditOrganisationPage = () => {
  const navigate = useNavigate();
  const { organisationId } = useParams();

  const [organisation, setOrganisation] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      setFetchLoading(true);
      try {
        const data = await fetchOrganisationDetails(organisationId);
        setOrganisation(data);
      } catch (err) {
        console.error('Failed to load organisation details:', err);
        setServerError('Failed to load organisation data');
      } finally {
        setFetchLoading(false);
      }
    };

    if (organisationId) {
      loadDetails();
    }
  }, [organisationId]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setServerError(null);

    try {
      await updateOrganisation(organisationId, payload);
      navigate(`/super-admin/organisations/${organisationId}`, {
        state: { message: 'Organisation updated successfully.' },
      });
    } catch (err) {
      console.error('Failed to update organisation:', err);
      setServerError(err.message || 'Failed to update organisation');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-2" />
        <p className="text-sm font-medium">Loading Organisation Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          Edit Organisation: {organisation?.name}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
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
