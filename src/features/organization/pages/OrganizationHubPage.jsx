import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '../hooks/useOrganization';
import OrganizationHeader from '../components/OrganizationHeader';
import UnifiedOrganizationForm from '../components/UnifiedOrganizationForm';
import BusinessHoursGrid from '../components/BusinessHoursGrid';
import HolidayCalendarManager from '../components/HolidayCalendarManager';
import Loader from '../../../components/common/Loader/Loader';
import ErrorMessage from '../../../components/common/ErrorMessage/ErrorMessage';

export const OrganizationHubPage = ({ initialTab = 'setup' }) => {
  const {
    profile,
    contacts,
    addresses,
    taxProfiles,
    settings,
    businessHours,
    holidays,
    loading,
    saving,
    error,
    successMessage,
    clearToast,
    updateProfile,
    uploadLogo,
    activateOrganization,
    createContact,
    updateContact,
    createAddress,
    updateAddress,
    createTaxProfile,
    updateTaxProfile,
    updateSettings,
    updateHours,
    createHoliday,
    updateHoliday,
    cancelHoliday,
    deleteHoliday,
  } = useOrganization();

  const navigate = useNavigate();

  if (loading && !profile) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[300px]">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1 sm:p-3 max-w-7xl mx-auto">
      {/* Toast Alert Notifications */}
      {error && (
        <ErrorMessage
          message={error}
          onClose={clearToast}
          className="animate-fadeIn mb-2"
        />
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-between animate-fadeIn mb-2">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={clearToast}
            className="hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <OrganizationHeader
        profile={profile}
        onActivate={activateOrganization}
        showActionButton={true}
        actionButtonLabel="Create New Organization"
        onAddNew={() => navigate('/organization/create')}
        saving={saving}
      />

      {/* Direct Section Rendering based on Route */}
      <div className="transition-all duration-200">
        {initialTab === 'setup' && (
          <UnifiedOrganizationForm
            profile={profile}
            contacts={contacts}
            addresses={addresses}
            taxProfiles={taxProfiles}
            settings={settings}
            onSaveProfile={updateProfile}
            onUploadLogo={uploadLogo}
            onSaveContact={{ create: createContact, update: updateContact }}
            onSaveAddress={{ create: createAddress, update: updateAddress }}
            onSaveTax={{ create: createTaxProfile, update: updateTaxProfile }}
            onSaveSettings={updateSettings}
            saving={saving}
          />
        )}

        {initialTab === 'business-hours' && (
          <BusinessHoursGrid
            businessHours={businessHours}
            onSave={(days) => updateHours(days)}
            saving={saving}
          />
        )}

        {initialTab === 'holidays' && (
          <HolidayCalendarManager
            holidays={holidays}
            onCreate={createHoliday}
            onUpdate={updateHoliday}
            onCancel={cancelHoliday}
            onDelete={deleteHoliday}
            saving={saving}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default OrganizationHubPage;
