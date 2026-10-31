import React from 'react';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import OrganisationSetupForm from '../components/OrganisationSetupForm';
import { useOrganisationSetup } from '../hooks/useOrganisation';

export default function OrganisationSetupPage() {
  const {
    organisation,
    loading,
    saving,
    error,
    checkSlugAvailability,
    saveMessage,
    handleSave,
    isOwner,
    isSuperAdmin,
    overviewRoute,
    navigate,
  } = useOrganisationSetup();

  if (loading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center text-[var(--text-muted)]">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary-500" />
        <p className="text-sm font-semibold">Loading organization setup...</p>
      </div>
    );
  }

  if (!organisation) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center">
        <Building2 className="mx-auto mb-3 h-9 w-9 text-rose-500" />
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Organization not found</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{error || 'This organization could not be loaded.'}</p>
        <button
          type="button"
          onClick={() => navigate(isOwner ? '/dashboard' : '/super-admin/organisations')}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-500 hover:bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />{isOwner ? 'Back to dashboard' : 'Back to organizations'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {!isOwner && (
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{organisation.name}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Configure identity, communication, legal, regional, and schedule defaults.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(overviewRoute)}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="mr-1 inline h-4 w-4" />Organization overview
          </button>
        </header>
      )}
      {saveMessage && (
        <p role="status" className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm font-semibold text-emerald-400">
          {saveMessage}
        </p>
      )}
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
