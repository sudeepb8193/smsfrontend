import React, { useState, useEffect } from 'react';
import {
  Building2,
  Briefcase,
  UserCheck,
  CreditCard,
  AlertCircle,
  Save,
  X,
  Upload,
  Loader2,
  Globe,
  Store,
  Check,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadImageFile } from '../api/organisationApi';
import Input from '../../../components/shared/Input';
import CustomSelector from '../../../components/shared/CustomSelector';
import DatePicker from '../../../components/shared/DatePicker';
import Button from '../../../components/shared/Button';
import Modal from '../../../components/shared/Modal';
import MediaUpload from '../../../components/shared/MediaUpload';

export const OrganisationForm = ({
  initialValues = null,
  onSubmit,
  isEditMode = false,
  loading = false,
  serverError = null,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    businessType: 'salon',
    operatingMode: 'INDIVIDUAL_WEBSITE',
    logoUrl: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    addressLine1: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',

    // Business Info
    gstNumber: '',
    taxNumber: '',
    registrationNumber: '',
    currency: 'INR',
    timeZone: 'Asia/Kolkata',

    // Owner Info
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerUsername: '',
    ownerPassword: 'Owner@123',

    // Subscription Info
    subscriptionPlan: 'Basic',
    subscriptionStartDate: new Date().toISOString().split('T')[0],
    subscriptionEndDate: '',
    maxBranches: 1,
    maxUsers: 5,
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showModeConfirmModal, setShowModeConfirmModal] = useState(false);
  const [pendingSubmitPayload, setPendingSubmitPayload] = useState(null);

  const businessTypeOptions = [
    { label: 'Salon', value: 'salon' },
    { label: 'Spa', value: 'spa' },
    { label: 'Unisex Salon', value: 'unisex_salon' },
    { label: 'Barbershop', value: 'barbershop' },
    { label: 'Wellness Center', value: 'wellness_center' },
    { label: 'Other', value: 'other' },
  ];

  const currencyOptions = [
    { label: 'INR (₹)', value: 'INR' },
    { label: 'USD ($)', value: 'USD' },
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'GBP (£)', value: 'GBP' },
    { label: 'AED (د.إ)', value: 'AED' },
  ];

  const timeZoneOptions = [
    { label: 'Asia/Kolkata (GMT+5:30)', value: 'Asia/Kolkata' },
    { label: 'UTC (GMT+0:00)', value: 'UTC' },
    { label: 'America/New_York (GMT-5:00)', value: 'America/New_York' },
    { label: 'Europe/London (GMT+0:00)', value: 'Europe/London' },
    { label: 'Asia/Dubai (GMT+4:00)', value: 'Asia/Dubai' },
  ];

  const subscriptionPlanOptions = [
    { label: 'Basic Plan', value: 'Basic' },
    { label: 'Pro Plan', value: 'Pro' },
    { label: 'Enterprise Plan', value: 'Enterprise' },
    { label: 'Custom Plan', value: 'Custom' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Suspended', value: 'suspended' },
  ];

  const handleLogoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set immediate client-side instant preview
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);

    setUploadingLogo(true);
    setLogoUploadError(null);

    try {
      const data = await uploadImageFile(file, 'organizations');
      const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const CLEAN_BASE = RAW_API_BASE.replace(/\/+$/, '');
      const API_BASE = CLEAN_BASE.endsWith('/sms') ? CLEAN_BASE : `${CLEAN_BASE}/sms`;
      const fileUrl = `${API_BASE}/storage/file?key=${encodeURIComponent(data.key)}`;
      handleChange('logoUrl', fileUrl);
    } catch (err) {
      console.error('Logo upload failed:', err);
      setLogoUploadError(err.message || 'Failed to upload file to cloud storage. Please try again later');
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    if (initialValues) {
      const owner = initialValues.users?.[0];
      const address = initialValues.organizationAddresses?.[0];
      const sub = initialValues.subscription;
      const settings = initialValues.organizationSettings;

      setFormData({
        name: initialValues.name || '',
        code: initialValues.code || '',
        businessType: initialValues.businessType || 'salon',
        logoUrl: initialValues.logoUrl || '',
        description: initialValues.description || '',
        email: initialValues.email || '',
        phone: initialValues.phone || '',
        website: initialValues.website || '',
        addressLine1: address?.addressLine1 || '',
        city: address?.city || '',
        state: address?.state || '',
        country: address?.country || 'India',
        pincode: address?.postalCode || '',

        // Business Info
        gstNumber: initialValues.organizationTaxProfiles?.[0]?.taxIdentifierNumber || '',
        taxNumber: '',
        registrationNumber: '',
        currency: settings?.currencyCode || 'INR',
        timeZone: settings?.timezone || 'Asia/Kolkata',

        // Owner Info
        ownerName: owner?.displayName || '',
        ownerEmail: owner?.email || '',
        ownerPhone: owner?.phoneNumber || '',
        ownerUsername: owner?.email || '',
        ownerPassword: '', // Don't expose password in edit mode

        // Subscription Info
        subscriptionPlan: sub?.planName || 'Basic',
        subscriptionStartDate: sub?.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : '',
        subscriptionEndDate: sub?.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : '',
        maxBranches: sub?.maxBranches || 1,
        maxUsers: sub?.maxUsers || 5,
        status: initialValues.status || 'active',
        operatingMode: initialValues.operatingMode || 'INDIVIDUAL_WEBSITE',
      });
    }
  }, [initialValues]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Organisation Name is required';
    if (!formData.code.trim()) newErrors.code = 'Organisation Code is required';
    if (!formData.businessType) newErrors.businessType = 'Business Type is required';
    
    if (!formData.operatingMode) {
      newErrors.operatingMode = 'Please select an Operating Mode for this organisation';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Organisation Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Organisation Phone is required';
    }

    if (!isEditMode) {
      if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner Full Name is required';
      if (!formData.ownerEmail.trim()) {
        newErrors.ownerEmail = 'Owner Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail.trim())) {
        newErrors.ownerEmail = 'Please enter a valid owner email address';
      }
    }

    if (!formData.subscriptionPlan) {
      newErrors.subscriptionPlan = 'Subscription Plan is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Clean up empty strings for optional fields so backend DTO validation passes cleanly
    const cleanedData = {};
    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (val !== '' && val !== null && val !== undefined) {
        cleanedData[key] = val;
      }
    });

    const payload = {
      ...cleanedData,
      operatingMode: formData.operatingMode,
      maxBranches: Number(formData.maxBranches) || 1,
      maxUsers: Number(formData.maxUsers) || 5,
      ownerPassword: formData.ownerPassword || 'Owner@123',
    };

    if (
      isEditMode &&
      initialValues?.operatingMode &&
      formData.operatingMode !== initialValues.operatingMode
    ) {
      setPendingSubmitPayload(payload);
      setShowModeConfirmModal(true);
      return;
    }

    onSubmit(payload);
  };

  const handleConfirmModeChange = () => {
    setShowModeConfirmModal(false);
    if (pendingSubmitPayload) {
      onSubmit(pendingSubmitPayload);
      setPendingSubmitPayload(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* SECTION: OPERATING MODE SELECTION */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-sm text-[var(--text-primary)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-500 border border-primary-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                Organisation Operating Mode
                <span className="text-xs text-rose-500">*</span>
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Select how this organisation will operate and accept customer bookings
              </p>
            </div>
          </div>
          {isEditMode && initialValues?.operatingMode && (
            <span className="self-start sm:self-auto text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-secondary)]">
              Current: {initialValues.operatingMode === 'CENTRAL_MARKETPLACE' ? 'Central Salon Marketplace' : 'Individual Salon Website'}
            </span>
          )}
        </div>

        {errors.operatingMode && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.operatingMode}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Individual Salon Website */}
          <div
            id="operating-mode-individual"
            onClick={() => handleChange('operatingMode', 'INDIVIDUAL_WEBSITE')}
            className={`relative rounded-2xl border-2 p-4 sm:p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
              formData.operatingMode === 'INDIVIDUAL_WEBSITE'
                ? 'border-primary-500 bg-primary-500/5 shadow-md shadow-primary-500/10'
                : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-primary-500/40 hover:bg-white/[0.02]'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      formData.operatingMode === 'INDIVIDUAL_WEBSITE'
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      Individual Salon Website
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      Independent Direct
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    formData.operatingMode === 'INDIVIDUAL_WEBSITE'
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-[var(--border-color)] bg-[var(--bg-input)]'
                  }`}
                >
                  {formData.operatingMode === 'INDIVIDUAL_WEBSITE' && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </div>
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3.5">
                Operate an independent salon business with its own booking website and management dashboard.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Own salon booking website.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Own branding and domain configuration.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Own branches and services.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Own appointments and customers.</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] ml-1 mr-1 shrink-0" />
                  <span>No central marketplace listing.</span>
                </div>
              </div>
            </div>

            {formData.operatingMode === 'INDIVIDUAL_WEBSITE' && (
              <div className="mt-4 pt-2.5 border-t border-primary-500/20 flex items-center justify-between text-[11px] font-bold text-primary-500">
                <span>Selected Operating Mode</span>
                <span className="px-2 py-0.5 rounded-md bg-primary-500/10">Active Selection</span>
              </div>
            )}
          </div>

          {/* Card B: Central Marketplace */}
          <div
            id="operating-mode-marketplace"
            onClick={() => handleChange('operatingMode', 'CENTRAL_MARKETPLACE')}
            className={`relative rounded-2xl border-2 p-4 sm:p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
              formData.operatingMode === 'CENTRAL_MARKETPLACE'
                ? 'border-primary-500 bg-primary-500/5 shadow-md shadow-primary-500/10'
                : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-primary-500/40 hover:bg-white/[0.02]'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      formData.operatingMode === 'CENTRAL_MARKETPLACE'
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                    }`}
                  >
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">
                      Central Salon Marketplace
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      Discovery Network
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    formData.operatingMode === 'CENTRAL_MARKETPLACE'
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-[var(--border-color)] bg-[var(--bg-input)]'
                  }`}
                >
                  {formData.operatingMode === 'CENTRAL_MARKETPLACE' && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </div>
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3.5">
                Allow customers to discover and book this salon through the central marketplace.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Salon management dashboard.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Organisation-specific branches and services.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Marketplace salon listing.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Marketplace discovery and booking.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Organisation-specific appointment management.</span>
                </div>
              </div>
            </div>

            {formData.operatingMode === 'CENTRAL_MARKETPLACE' && (
              <div className="mt-4 pt-2.5 border-t border-primary-500/20 flex items-center justify-between text-[11px] font-bold text-primary-500">
                <span>Selected Operating Mode</span>
                <span className="px-2 py-0.5 rounded-md bg-primary-500/10">Active Selection</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: ORGANISATION INFORMATION */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-sm text-[var(--text-primary)]">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[var(--border-color)]">
          <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Organisation Information
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Basic business profile details and public contact information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Organisation Name */}
          <Input
            label="Organisation Name"
            required
            type="text"
            value={formData.name}
            maxLength={150}
            showCharCount
            onChange={(e) => handleChange('name', e.target.value.slice(0, 150))}
            placeholder="e.g. Glamour Salon & Spa"
            error={errors.name}
          />

          {/* Organisation Code */}
          <Input
            label="Organisation Code"
            required
            type="text"
            disabled={isEditMode}
            value={formData.code}
            maxLength={20}
            showCharCount
            onChange={(e) => handleChange('code', e.target.value.toUpperCase().slice(0, 20))}
            placeholder="e.g. GLAM01"
            error={errors.code}
          />

          {/* Business Type CustomSelector */}
          <CustomSelector
            label="Business Type"
            required
            options={businessTypeOptions}
            value={formData.businessType}
            onChange={(val) => handleChange('businessType', val)}
            placeholder="Select Business Type"
            isSearchable={false}
            isClearable={false}
            error={errors.businessType}
          />

          {/* Email */}
          <Input
            label="Email Address"
            required
            type="email"
            value={formData.email}
            maxLength={100}
            showCharCount
            onChange={(e) => handleChange('email', e.target.value.slice(0, 100))}
            placeholder="info@glamoursalon.com"
            error={errors.email}
          />

          {/* Phone */}
          <Input
            label="Phone Number"
            required
            type="text"
            value={formData.phone}
            maxLength={15}
            showCharCount
            onChange={(e) => handleChange('phone', e.target.value.slice(0, 15))}
            placeholder="+91 98765 43210"
            error={errors.phone}
          />

          {/* Website */}
          <Input
            label="Website URL"
            type="url"
            value={formData.website}
            maxLength={255}
            showCharCount
            onChange={(e) => handleChange('website', e.target.value.slice(0, 255))}
            placeholder="https://www.glamoursalon.com"
          />

          {/* Logo Upload Section */}
          <div className="md:col-span-2">
            <MediaUpload
              label="Organisation Logo"
              value={formData.logoUrl}
              onChange={(url) => {
                setLogoPreview(url);
                handleChange('logoUrl', url);
              }}
              folder="organizations"
              aspectRatio="square"
              placeholderIcon={Building2}
              helperText="Upload JPG, PNG, WebP or GIF up to 5 MB"
              error={logoUploadError}
            />
          </div>

          {/* Address Line 1 */}
          <div className="md:col-span-2">
            <Input
              label="Address"
              type="text"
              value={formData.addressLine1}
              maxLength={150}
              showCharCount
              onChange={(e) => handleChange('addressLine1', e.target.value.slice(0, 150))}
              placeholder="Street Address / Suite No."
            />
          </div>

          {/* City, State, Country, Pincode */}
          <Input
            label="City"
            type="text"
            value={formData.city}
            maxLength={50}
            showCharCount
            onChange={(e) => handleChange('city', e.target.value.slice(0, 50))}
            placeholder="e.g. Mumbai"
          />

          <Input
            label="State"
            type="text"
            value={formData.state}
            maxLength={50}
            showCharCount
            onChange={(e) => handleChange('state', e.target.value.slice(0, 50))}
            placeholder="e.g. Maharashtra"
          />

          <Input
            label="Country"
            type="text"
            value={formData.country}
            maxLength={50}
            showCharCount
            onChange={(e) => handleChange('country', e.target.value.slice(0, 50))}
            placeholder="India"
          />

          <Input
            label="Pincode"
            type="text"
            value={formData.pincode}
            maxLength={10}
            showCharCount
            onChange={(e) => handleChange('pincode', e.target.value.slice(0, 10))}
            placeholder="400001"
          />
        </div>
      </div>

      {/* SECTION 2: BUSINESS INFORMATION */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-sm text-[var(--text-primary)]">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[var(--border-color)]">
          <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Business & Financial Information
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Tax identification, currency, and localization settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <Input
            label="GST Number"
            type="text"
            value={formData.gstNumber}
            maxLength={15}
            showCharCount
            onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase().slice(0, 15))}
            placeholder="27AAAAA0000A1Z5"
          />

          <CustomSelector
            label="Currency"
            options={currencyOptions}
            value={formData.currency}
            onChange={(val) => handleChange('currency', val)}
            placeholder="Select Currency"
            isSearchable={false}
            isClearable={false}
          />

          <CustomSelector
            label="Time Zone"
            options={timeZoneOptions}
            value={formData.timeZone}
            onChange={(val) => handleChange('timeZone', val)}
            placeholder="Select Time Zone"
            isSearchable={false}
            isClearable={false}
          />
        </div>
      </div>

      {/* SECTION 3: OWNER INFORMATION */}
      {!isEditMode && (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-sm text-[var(--text-primary)]">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[var(--border-color)]">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Initial Owner Account
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Credentials for the administrator owner of this organisation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Input
              label="Owner Full Name"
              required
              type="text"
              value={formData.ownerName}
              maxLength={100}
              showCharCount
              onChange={(e) => handleChange('ownerName', e.target.value.slice(0, 100))}
              placeholder="John Doe"
              error={errors.ownerName}
            />

            <Input
              label="Owner Email"
              required
              type="email"
              value={formData.ownerEmail}
              maxLength={100}
              showCharCount
              onChange={(e) => handleChange('ownerEmail', e.target.value.slice(0, 100))}
              placeholder="owner@glamoursalon.com"
              error={errors.ownerEmail}
            />

            <Input
              label="Owner Phone"
              type="text"
              value={formData.ownerPhone}
              maxLength={15}
              showCharCount
              onChange={(e) => handleChange('ownerPhone', e.target.value.slice(0, 15))}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
      )}

      {/* SECTION 4: SUBSCRIPTION */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 sm:p-5 shadow-sm text-[var(--text-primary)]">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[var(--border-color)]">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Subscription & Entitlements
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Set plan limits, max branches, users, and subscription active status
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <CustomSelector
            label="Subscription Plan"
            required
            options={subscriptionPlanOptions}
            value={formData.subscriptionPlan}
            onChange={(val) => handleChange('subscriptionPlan', val)}
            placeholder="Select Subscription Plan"
            isSearchable={false}
            isClearable={false}
            error={errors.subscriptionPlan}
            direction="up"
          />

          <Input
            label="Maximum Branches"
            type="number"
            min="1"
            value={formData.maxBranches}
            onChange={(e) => handleChange('maxBranches', e.target.value)}
          />

          <Input
            label="Maximum Users"
            type="number"
            min="1"
            value={formData.maxUsers}
            onChange={(e) => handleChange('maxUsers', e.target.value)}
          />

          <DatePicker
            label="Start Date"
            value={formData.subscriptionStartDate}
            onChange={(val) => handleChange('subscriptionStartDate', val)}
            placeholder="Select Start Date"
          />

          <DatePicker
            label="End Date"
            value={formData.subscriptionEndDate}
            onChange={(val) => handleChange('subscriptionEndDate', val)}
            placeholder="Select End Date"
          />

          <CustomSelector
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(val) => handleChange('status', val)}
            placeholder="Select Status"
            isSearchable={false}
            isClearable={false}
            direction="up"
          />
        </div>
      </div>

      {/* FORM ACTIONS */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="secondary"
          onClick={() => navigate('/super-admin/organisations')}
          icon={X}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={Save}
        >
          {isEditMode ? 'Update Organisation' : 'Create Organisation'}
        </Button>
      </div>

      {/* CONFIRMATION MODAL FOR OPERATING MODE CHANGE */}
      {showModeConfirmModal && (
        <Modal
          isOpen={showModeConfirmModal}
          onClose={() => {
            setShowModeConfirmModal(false);
            setPendingSubmitPayload(null);
          }}
          title="Confirm Operating Mode Transition"
          size="medium"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModeConfirmModal(false);
                  setPendingSubmitPayload(null);
                }}
              >
                Keep Current Mode
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmModeChange}
                loading={loading}
              >
                Confirm & Apply Mode Change
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <p className="font-bold text-sm text-[var(--text-primary)] mb-1">
                  Changing Organisation Operating Mode
                </p>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  You are switching this organisation from{' '}
                  <span className="font-bold text-amber-500">
                    {initialValues?.operatingMode === 'CENTRAL_MARKETPLACE'
                      ? 'Central Marketplace'
                      : 'Individual Salon Website'}
                  </span>{' '}
                  to{' '}
                  <span className="font-bold text-primary-500">
                    {formData.operatingMode === 'CENTRAL_MARKETPLACE'
                      ? 'Central Marketplace'
                      : 'Individual Salon Website'}
                  </span>.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-input)] p-3.5 rounded-xl border border-[var(--border-color)]">
              <p className="font-bold text-[var(--text-primary)] mb-2">Transition Guarantees & Impact:</p>
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Existing appointments, customer records, and branches are completely preserved.</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Direct bookings on the individual salon website remain fully functional.</span>
              </div>
              {formData.operatingMode === 'INDIVIDUAL_WEBSITE' ? (
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>The salon will be excluded from the central marketplace discovery network.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-primary-500">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>The salon will become eligible for marketplace listing and customer discovery once approved.</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[var(--text-muted)] italic">
              This action will be permanently recorded in the system audit logs.
            </p>
          </div>
        </Modal>
      )}
    </form>
  );
};

export default OrganisationForm;
