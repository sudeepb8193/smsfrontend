import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  MapPin,
  Receipt,
  Globe,
  Upload,
  Save,
} from 'lucide-react';
import Card from '../../../components/common/Card/Card';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Button from '../../../components/common/Button/Button';

export const UnifiedOrganizationForm = ({
  profile,
  contacts = [],
  addresses = [],
  taxProfiles = [],
  settings,
  onSaveProfile,
  onUploadLogo,
  onSaveContact,
  onSaveAddress,
  onSaveTax,
  onSaveSettings,
  saving = false,
}) => {
  // Primary Contact reference
  const primaryContact = contacts.find((c) => c.contactType === 'primary') || contacts[0] || {};
  // Registered Address reference
  const registeredAddress = addresses.find((a) => a.addressType === 'registered') || addresses[0] || {};
  // Primary Tax profile reference
  const primaryTax = taxProfiles[0] || {};

  // Master Unified Form State
  const [formData, setFormData] = useState({
    // Profile
    organizationName: '',
    displayName: '',
    legalName: '',
    businessType: 'salon',
    tagline: '',
    establishedYear: new Date().getFullYear(),
    websiteUrl: '',
    primaryColor: '#8A4A52',
    secondaryColor: '#271820',

    // Primary Contact
    contactName: '',
    contactEmail: '',
    phoneCountryCode: '+91',
    phoneNumber: '',

    // Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    landmark: '',
    googleMapsUrl: '',

    // Tax
    taxIdentifierType: 'gstin',
    taxIdentifierValue: '',
    taxName: '',
    taxLegalName: '',
    defaultTaxRate: '18.00',

    // Regional Settings
    baseCurrencyCode: 'USD',
    baseCurrencySymbol: '$',
    currencySymbolPosition: 'prefix',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'h12',
    timeZone: 'UTC',
    firstDayOfWeek: 'monday',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    setFormData({
      // Profile
      organizationName: profile?.organizationName || '',
      displayName: profile?.displayName || '',
      legalName: profile?.legalName || '',
      businessType: profile?.businessType || 'salon',
      tagline: profile?.tagline || '',
      establishedYear: profile?.establishedYear || new Date().getFullYear(),
      websiteUrl: profile?.websiteUrl || '',
      primaryColor: profile?.primaryColor || '#8A4A52',
      secondaryColor: profile?.secondaryColor || '#271820',

      // Contact
      contactName: primaryContact.contactName || '',
      contactEmail: primaryContact.email || '',
      phoneCountryCode: primaryContact.phoneCountryCode || '+91',
      phoneNumber: primaryContact.phoneNumber || '',

      // Address
      addressLine1: registeredAddress.addressLine1 || '',
      addressLine2: registeredAddress.addressLine2 || '',
      city: registeredAddress.city || '',
      state: registeredAddress.state || '',
      postalCode: registeredAddress.postalCode || '',
      country: registeredAddress.country || '',
      landmark: registeredAddress.landmark || '',
      googleMapsUrl: registeredAddress.googleMapsUrl || '',

      // Tax
      taxIdentifierType: primaryTax.taxIdentifierType || 'gstin',
      taxIdentifierValue: primaryTax.taxIdentifierValue || '',
      taxName: primaryTax.taxName || '',
      taxLegalName: primaryTax.legalName || '',
      defaultTaxRate: primaryTax.defaultTaxRate ? primaryTax.defaultTaxRate.toString() : '18.00',

      // Regional Settings
      baseCurrencyCode: settings?.baseCurrencyCode || 'USD',
      baseCurrencySymbol: settings?.baseCurrencySymbol || '$',
      currencySymbolPosition: settings?.currencySymbolPosition || 'prefix',
      dateFormat: settings?.dateFormat || 'YYYY-MM-DD',
      timeFormat: settings?.timeFormat || 'h12',
      timeZone: settings?.timeZone || 'UTC',
      firstDayOfWeek: settings?.firstDayOfWeek || 'monday',
    });

    if (profile?.logoUrl) {
      setLogoPreview(profile.logoUrl);
    }
  }, [profile, contacts, addresses, taxProfiles, settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Profile Update
    await onSaveProfile({
      organizationName: formData.organizationName,
      displayName: formData.displayName,
      legalName: formData.legalName,
      businessType: formData.businessType,
      tagline: formData.tagline,
      establishedYear: parseInt(formData.establishedYear, 10),
      websiteUrl: formData.websiteUrl,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
    });

    // 2. Logo Upload
    if (logoFile && onUploadLogo) {
      await onUploadLogo(logoFile);
    }

    // 3. Contact Update/Create
    if (formData.contactName || formData.contactEmail || formData.phoneNumber) {
      const contactPayload = {
        contactType: 'primary',
        contactName: formData.contactName,
        email: formData.contactEmail,
        phoneCountryCode: formData.phoneCountryCode,
        phoneNumber: formData.phoneNumber,
        isDefaultPublic: true,
      };
      if (primaryContact.id) {
        await onSaveContact.update(primaryContact.id, contactPayload);
      } else {
        await onSaveContact.create(contactPayload);
      }
    }

    // 4. Address Update/Create
    if (formData.addressLine1 && formData.city && formData.state && formData.country) {
      const addressPayload = {
        addressType: 'registered',
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        landmark: formData.landmark,
        googleMapsUrl: formData.googleMapsUrl,
      };
      if (registeredAddress.id) {
        await onSaveAddress.update(registeredAddress.id, addressPayload);
      } else {
        await onSaveAddress.create(addressPayload);
      }
    }

    // 5. Tax Update/Create
    if (formData.taxIdentifierValue) {
      const taxPayload = {
        taxIdentifierType: formData.taxIdentifierType,
        taxIdentifierValue: formData.taxIdentifierValue,
        taxName: formData.taxName || `${formData.taxIdentifierType.toUpperCase()} Default Rate`,
        legalName: formData.taxLegalName || formData.legalName,
        defaultTaxRate: parseFloat(formData.defaultTaxRate),
        verificationStatus: 'pending',
      };
      if (primaryTax.id) {
        await onSaveTax.update(primaryTax.id, taxPayload);
      } else {
        await onSaveTax.create(taxPayload);
      }
    }

    // 6. Regional Settings Update
    if (onSaveSettings) {
      await onSaveSettings({
        baseCurrencyCode: formData.baseCurrencyCode,
        baseCurrencySymbol: formData.baseCurrencySymbol,
        currencySymbolPosition: formData.currencySymbolPosition,
        dateFormat: formData.dateFormat,
        timeFormat: formData.timeFormat,
        timeZone: formData.timeZone,
        firstDayOfWeek: formData.firstDayOfWeek,
      });
    }
  };

  const businessTypeOptions = [
    { value: 'salon', label: 'Salon' },
    { value: 'spa', label: 'Spa & Wellness' },
    { value: 'unisex_salon', label: 'Unisex Salon' },
    { value: 'barbershop', label: 'Barbershop' },
    { value: 'wellness_center', label: 'Wellness Center' },
    { value: 'other', label: 'Other' },
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD - United States Dollar ($)' },
    { value: 'INR', label: 'INR - Indian Rupee (₹)' },
    { value: 'GBP', label: 'GBP - British Pound (£)' },
    { value: 'EUR', label: 'EUR - Euro (€)' },
    { value: 'AED', label: 'AED - UAE Dirham (AED)' },
    { value: 'CAD', label: 'CAD - Canadian Dollar ($)' },
  ];

  const taxTypeOptions = [
    { value: 'gstin', label: 'GSTIN (India)' },
    { value: 'vat', label: 'VAT (UK/EU/UAE)' },
    { value: 'ein', label: 'EIN (USA)' },
    { value: 'tin', label: 'TIN (Tax Identification Number)' },
    { value: 'pan', label: 'PAN (India)' },
    { value: 'other', label: 'Other Tax Registration' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Section 1: Business Identity & Branding */}
      <Card
        title="1. Business Identity & Branding"
        subtitle="Root organization profile, legal name, business type, and logo."
      >
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
            <div className="w-14 h-14 rounded-xl bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-color)] flex items-center justify-center shrink-0 overflow-hidden relative">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="text-[var(--text-muted)]" size={32} />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[var(--text-primary)]">Organization Logo</label>
              <p className="text-xs text-[var(--text-muted)]">Upload PNG, JPG, or SVG file.</p>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white cursor-pointer transition-all self-start">
                <Upload size={14} />
                <span>Upload Logo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Organization Name"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              placeholder="e.g. Apex Luxury Salon"
              required
            />
            <Input
              label="Display Name (Public)"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="e.g. Apex Salon & Spa"
            />
            <Input
              label="Legal Business Name"
              name="legalName"
              value={formData.legalName}
              onChange={handleChange}
              placeholder="e.g. Apex Salon Private Limited"
            />
            <Select
              label="Business Type"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              options={businessTypeOptions}
              required
            />
            <Input
              label="Tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g. Premium Hair & Skin Solutions"
            />
            <Input
              label="Official Website"
              name="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={handleChange}
              placeholder="https://apexsalon.com"
            />
          </div>
        </div>
      </Card>

      {/* Section 2: Primary Contact Information */}
      <Card
        title="2. Primary Contact Details"
        subtitle="Main helpdesk contact person, email address, and phone number."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Contact Person / Department"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="e.g. Main Reception Helpdesk"
          />

          <Input
            label="Contact Email"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="info@apexsalon.com"
          />

          <div className="grid grid-cols-3 gap-2 md:col-span-2">
            <Input
              label="Code"
              name="phoneCountryCode"
              value={formData.phoneCountryCode}
              onChange={handleChange}
              placeholder="+91"
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="9876543210"
              className="col-span-2"
            />
          </div>
        </div>
      </Card>

      {/* Section 3: Registered Office Address */}
      <Card
        title="3. Registered Office Location"
        subtitle="Official headquarters address, city, state, postal code, and country."
      >
        <div className="space-y-4">
          <Input
            label="Address Line 1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            placeholder="Building / Street Name"
          />

          <Input
            label="Address Line 2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            placeholder="Suite / Floor / Landmark"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="New York"
            />
            <Input
              label="State / Province"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="NY"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="10005"
            />
            <Input
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="USA"
            />
          </div>

          <Input
            label="Google Maps URL"
            name="googleMapsUrl"
            type="url"
            value={formData.googleMapsUrl}
            onChange={handleChange}
            placeholder="https://maps.google.com/?q=..."
          />
        </div>
      </Card>

      {/* Section 4: Tax Registration Details */}
      <Card
        title="4. Tax Registration Details"
        subtitle="Tax identification number (GSTIN/VAT/EIN) and default tax rate."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tax Type"
            name="taxIdentifierType"
            value={formData.taxIdentifierType}
            onChange={handleChange}
            options={taxTypeOptions}
          />

          <Input
            label="Tax Registration Number"
            name="taxIdentifierValue"
            value={formData.taxIdentifierValue}
            onChange={handleChange}
            placeholder="e.g. 22AAAAA0000A1Z5"
          />

          <Input
            label="Tax Label / Name"
            name="taxName"
            value={formData.taxName}
            onChange={handleChange}
            placeholder="e.g. GST Standard 18%"
          />

          <Input
            label="Default Tax Rate (%)"
            name="defaultTaxRate"
            type="number"
            step="0.01"
            value={formData.defaultTaxRate}
            onChange={handleChange}
            placeholder="18.00"
          />
        </div>
      </Card>

      {/* Section 5: Regional & Currency Settings */}
      <Card
        title="5. Currency & Regional Preferences"
        subtitle="System currency, date format, time format, timezone, and week start."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Base Currency"
            name="baseCurrencyCode"
            value={formData.baseCurrencyCode}
            onChange={handleChange}
            options={currencyOptions}
          />

          <Input
            label="Currency Symbol"
            name="baseCurrencySymbol"
            value={formData.baseCurrencySymbol}
            onChange={handleChange}
            placeholder="$"
          />

          <Select
            label="Date Format"
            name="dateFormat"
            value={formData.dateFormat}
            onChange={handleChange}
            options={[
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-10-02)' },
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (02/10/2026)' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (10/02/2026)' },
            ]}
          />

          <Select
            label="Time Format"
            name="timeFormat"
            value={formData.timeFormat}
            onChange={handleChange}
            options={[
              { value: 'h12', label: '12-Hour Clock (09:00 AM / 06:00 PM)' },
              { value: 'h24', label: '24-Hour Clock (09:00 / 18:00)' },
            ]}
          />
        </div>
      </Card>

      {/* Unified Master Submit Button */}
      <div className="sticky bottom-4 z-10 bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
        <div className="text-xs text-[var(--text-muted)] font-medium hidden sm:block">
          Saves business profile, contact, address, tax registration, and regional settings simultaneously.
        </div>

        <Button
          type="submit"
          variant="primary"
          size="large"
          icon={Save}
          loading={saving}
          className="ml-auto min-w-[240px]"
        >
          Save Complete Organization Setup
        </Button>
      </div>
    </form>
  );
};

export default UnifiedOrganizationForm;
