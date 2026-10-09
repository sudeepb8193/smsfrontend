import { useState } from 'react';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import OrganisationSetupForm from '../components/OrganisationSetupForm';
import useOrganisationSetup from '../hook/useOrganisationSetup';

export default function OrganisationSetupPage() {
  const navigate = useNavigate();
  const { organisationId } = useParams();
  const { user } = useAuth();
  const [saveMessage, setSaveMessage] = useState('');
  const role = String(user?.roleSlug || user?.role || user?.roleName || '').toLowerCase().replace(/_/g, '-');
  const isOwner = role === 'owner';
  const isSuperAdmin = role === 'super-admin';
  const overviewRoute = isOwner ? '/dashboard' : `/super-admin/organisations/${organisationId}`;
  const { organisation, loading, saving, error, save, checkSlugAvailability } =
    useOrganisationSetup(organisationId, isOwner);

  const handleSave = async (payload) => {
    await save(payload);
    if (isOwner) setSaveMessage('Organization setup saved successfully.');
    else {
      navigate(`/super-admin/organisations/${organisationId}`, {
        state: { message: 'Organization setup saved successfully.' },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center text-slate-500">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary-600" />
        <p className="text-sm font-semibold">Loading organization setup...</p>
      </div>
    );
  }

  if (!organisation) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <Building2 className="mx-auto mb-3 h-9 w-9 text-rose-500" />
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Organization not found</h1>
        <p className="mt-2 text-sm text-slate-500">{error || 'This organization could not be loaded.'}</p>
        <button type="button" onClick={() => navigate(isOwner ? '/dashboard' : '/super-admin/organisations')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white">
          <ArrowLeft className="h-4 w-4" />{isOwner ? 'Back to dashboard' : 'Back to organizations'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">{isOwner ? 'My organization settings' : 'Module 01 • Organization / Business Setup'}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{organisation.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{isOwner ? 'Update your organization profile, contacts, addresses, hours, and regional preferences.' : 'Configure identity, communication, legal, regional, and schedule defaults.'}</p>
        </div>
        {!isOwner && (
          <button type="button" onClick={() => navigate(overviewRoute)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <ArrowLeft className="mr-1 inline h-4 w-4" />Organization overview
          </button>
        )}
      </header>
      {saveMessage && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{saveMessage}</p>}
      <OrganisationSetupForm
        organisation={organisation}
        saving={saving}
        serverError={error}
        onSave={handleSave}
        onCancel={() => navigate(overviewRoute)}
        onCheckSlugAvailability={checkSlugAvailability}
        isOwner={isOwner}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
