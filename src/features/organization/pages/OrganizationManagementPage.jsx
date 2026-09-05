import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  UserCheck,
  MapPin,
  FileText,
  Globe,
  Clock,
  Calendar,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../../../components/layout/PageHeader/PageHeader';
import { organizationApi } from '../../../services/organization.api';
import { apiClient } from '../../../services/apiClient';

import { BusinessProfileSection } from '../components/BusinessProfileSection';
import { ContactManagementSection } from '../components/ContactManagementSection';
import { AddressManagementSection } from '../components/AddressManagementSection';
import { TaxProfileSection } from '../components/TaxProfileSection';
import { RegionalSettingsSection } from '../components/RegionalSettingsSection';
import { BusinessHoursSection } from '../components/BusinessHoursSection';
import { HolidayCalendarSection } from '../components/HolidayCalendarSection';

import { Loader } from '../../../components/common/Loader/Loader';

export const OrganizationManagementPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = () => {
    if (location.pathname.includes('/organization/contacts')) return 'contacts';
    if (location.pathname.includes('/organization/addresses')) return 'addresses';
    if (location.pathname.includes('/organization/tax')) return 'tax';
    if (location.pathname.includes('/organization/settings')) return 'settings';
    if (location.pathname.includes('/organization/hours')) return 'hours';
    if (location.pathname.includes('/organization/holidays')) return 'holidays';
    return 'profile';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    navigate(`/organization/${tabId}`);
  };

  const isReadOnly = false;

  const loadOrganization = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizationApi.getOrganization(1);
      setOrganization(data);
    } catch (err) {
      if (err.status === 404 || err.message?.includes('not found')) {
        try {
          const created = await organizationApi.createOrganization({
            name: 'Main Salon & Spa',
            slug: 'main-salon',
            legalName: 'Main Salon & Spa LLC',
            businessType: 'salon',
            status: 'onboarding',
          });
          setOrganization(created);
          setError(null);
          return;
        } catch (createErr) {
          setError(createErr.message || 'Failed to initialize default organization profile');
        }
      } else {
        setError(err.message || 'Failed to load organization profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganization();
  }, []);

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: Building2 },
    { id: 'contacts', label: 'Contacts', icon: UserCheck },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'tax', label: 'Tax Profiles', icon: FileText },
    { id: 'settings', label: 'Regional Settings', icon: Globe },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'holidays', label: 'Holiday Calendar', icon: Calendar },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <PageHeader
          title="Organization & Business Setup"
          description="Root configuration module for salon identity, contacts, locations, tax, regional locale, and work calendar."
        />
      </div>

      {/* Main Tab Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] overflow-x-auto scrollbar-none pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl font-bold text-xs transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-primary-500 bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-primary-500' : ''} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Loader text="Loading organization configuration..." size="lg" />
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-semibold flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : (
        <div className="pt-2">
          {activeTab === 'profile' && (
            <BusinessProfileSection
              organization={organization}
              onUpdateSuccess={loadOrganization}
              isReadOnly={isReadOnly}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactManagementSection organizationId={organization?.id || 1} isReadOnly={isReadOnly} />
          )}

          {activeTab === 'addresses' && (
            <AddressManagementSection organizationId={organization?.id || 1} isReadOnly={isReadOnly} />
          )}

          {activeTab === 'tax' && (
            <TaxProfileSection organizationId={organization?.id || 1} isReadOnly={isReadOnly} />
          )}

          {activeTab === 'settings' && (
            <RegionalSettingsSection organizationId={organization?.id || 1} isReadOnly={isReadOnly} />
          )}

          {activeTab === 'hours' && (
            <BusinessHoursSection organizationId={organization?.id || 1} isReadOnly={isReadOnly} />
          )}

          {activeTab === 'holidays' && (
            <HolidayCalendarSection organizationId={organization?.id || 1} isReadOnly={isReadOnly} />
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationManagementPage;
