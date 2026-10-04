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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadImageFile } from '../api/organisationApi';
import Input from '../../../components/shared/Input';
import CustomSelector from '../../../components/shared/CustomSelector';
import DatePicker from '../../../components/shared/DatePicker';
import Button from '../../../components/shared/Button';

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
      maxBranches: Number(formData.maxBranches) || 1,
      maxUsers: Number(formData.maxUsers) || 5,
      ownerPassword: formData.ownerPassword || 'Owner@123',
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* SECTION 1: ORGANISATION INFORMATION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Organisation Information
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
            onChange={(e) => handleChange('name', e.target.value)}
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
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
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
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="info@glamoursalon.com"
            error={errors.email}
          />

          {/* Phone */}
          <Input
            label="Phone Number"
            required
            type="text"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+91 98765 43210"
            error={errors.phone}
          />

          {/* Website */}
          <Input
            label="Website URL"
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://www.glamoursalon.com"
          />

          {/* Logo Upload Section */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Organisation Logo
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              {/* Logo Preview Thumbnail */}
              {logoPreview || formData.logoUrl ? (
                <div className="relative w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white shrink-0 group">
                  <img
                    src={logoPreview || formData.logoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setLogoPreview(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null);
                      handleChange('logoUrl', '');
                    }}
                    className="absolute inset-0 bg-slate-950/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Logo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
              )}

              {/* Upload Action & URL Input */}
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5">
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading to B2...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        Upload Logo
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={uploadingLogo}
                      onChange={handleLogoFileUpload}
                    />
                  </label>

                  {(logoPreview || formData.logoUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview(null);
                        handleChange('logoUrl', '');
                      }}
                      className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors font-medium"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">
                  Upload JPG, PNG, WebP or GIF up to 5 MB directly to cloud storage.
                </p>
                {logoUploadError && (
                  <p className="text-xs text-rose-500 font-medium">{logoUploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Line 1 */}
          <div className="md:col-span-2">
            <Input
              label="Address"
              type="text"
              value={formData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              placeholder="Street Address / Suite No."
            />
          </div>

          {/* City, State, Country, Pincode */}
          <Input
            label="City"
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="e.g. Mumbai"
          />

          <Input
            label="State"
            type="text"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="e.g. Maharashtra"
          />

          <Input
            label="Country"
            type="text"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="India"
          />

          <Input
            label="Pincode"
            type="text"
            value={formData.pincode}
            onChange={(e) => handleChange('pincode', e.target.value)}
            placeholder="400001"
          />
        </div>
      </div>

      {/* SECTION 2: BUSINESS INFORMATION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Business & Financial Information
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tax identification, currency, and localization settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <Input
            label="GST Number"
            type="text"
            value={formData.gstNumber}
            onChange={(e) => handleChange('gstNumber', e.target.value)}
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Initial Owner Account
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
              onChange={(e) => handleChange('ownerName', e.target.value)}
              placeholder="John Doe"
              error={errors.ownerName}
            />

            <Input
              label="Owner Email"
              required
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => handleChange('ownerEmail', e.target.value)}
              placeholder="owner@glamoursalon.com"
              error={errors.ownerEmail}
            />

            <Input
              label="Owner Phone"
              type="text"
              value={formData.ownerPhone}
              onChange={(e) => handleChange('ownerPhone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
      )}

      {/* SECTION 4: SUBSCRIPTION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Subscription & Entitlements
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
    </form>
  );
};

export default OrganisationForm;
