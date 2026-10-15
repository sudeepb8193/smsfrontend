import React, { useState, useRef, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const STEP_LABELS = [
  '1 Business',
  '2 Contact',
  '3 Address',
  '4 Regional',
  '5 Hours',
];

const BUSINESS_TYPES = [
  'Salon',
  'Spa',
  'Barbershop',
  'Unisex salon',
  'Wellness',
];

const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '08:30', '09:00', '09:30', '10:00',
  '17:00', '18:00', '18:30', '19:00', '19:30', '20:00', '21:00', '22:00'
];

export default function SalonSuiteOnboardingWizard({
  formData,
  setSection,
  setAddress,
  setContact,
  setHour,
  copyMonday,
  onSave,
  saving,
  onExitToSettings,
  handleLogoUpload,
  uploadingLogo,
  logoPreview,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef(null);

  // Derive initials for avatar
  const initials = useMemo(() => {
    const name = formData?.profile?.name?.trim();
    if (!name) return 'GB';
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }, [formData?.profile?.name]);

  const slugText = useMemo(() => {
    const raw = formData?.profile?.slug || formData?.profile?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'glow-beauty-studio';
    return `salon-suite.app/${raw} is available`;
  }, [formData?.profile?.slug, formData?.profile?.name]);

  const primaryContact = formData?.contacts?.[0] || {
    phoneCountryCode: '+91',
    phoneNumber: '98765 43210',
    email: 'hello@glowbeauty.in',
    isDefaultPublic: true,
  };

  const regAddress = formData?.addresses?.[0] || {
    addressLine1: '12 MG Road',
    addressLine2: 'Near Trinity Circle',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India',
  };

  const days = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 0 },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Completed last step - save and switch to settings overview
      onSave(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-primary-500/20 selection:text-primary-500">
      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[var(--border-color)]">
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Salon Suite</h1>
        <button
          type="button"
          onClick={onExitToSettings}
          className="text-sm font-medium text-[var(--text-secondary)] hover:text-primary-500 underline transition cursor-pointer"
        >
          Save & exit
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16 pt-6">
        {/* Stepper Bar */}
        <div className="w-full max-w-[760px] mb-8">
          <div className="grid grid-cols-5 gap-3 sm:gap-4 items-center">
            {STEP_LABELS.map((label, idx) => {
              const isActiveOrDone = idx <= currentStep;
              return (
                <div
                  key={label}
                  onClick={() => idx <= currentStep && setCurrentStep(idx)}
                  className={`flex flex-col gap-2 ${idx <= currentStep ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div
                    className={`h-[3.5px] rounded-full transition-all duration-300 ${
                      isActiveOrDone ? 'bg-primary-500' : 'bg-[var(--border-color)]'
                    }`}
                  />
                  <span
                    className={`text-xs sm:text-sm tracking-tight transition ${
                      idx === currentStep
                        ? 'font-bold text-[var(--text-primary)]'
                        : isActiveOrDone
                        ? 'font-medium text-[var(--text-secondary)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Card Container */}
        <div className="w-full max-w-[760px] bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-8 sm:p-12 shadow-md">
          {/* STEP 1: BUSINESS */}
          {currentStep === 0 && (
            <div className="space-y-7 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                  Tell us about your business
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                  This appears on invoices, your booking page and customer messages.
                </p>
              </div>

              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Business name
                </label>
                <input
                  type="text"
                  value={formData?.profile?.name || ''}
                  onChange={(e) => setSection('profile', 'name', e.target.value)}
                  placeholder="Glow Beauty Studio"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 transition bg-[var(--bg-input)] placeholder:text-[var(--text-muted)]"
                />
                <p className="text-xs font-semibold text-emerald-400 pt-0.5">
                  {slugText}
                </p>
              </div>

              {/* Logo Upload Box */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Logo
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[var(--border-color)] hover:border-primary-500 rounded-2xl p-5 sm:p-6 flex items-center gap-5 bg-[var(--bg-input)] cursor-pointer transition"
                >
                  {/* Initials or Preview Avatar */}
                  <div className="w-16 h-16 rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/20 flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden">
                    {logoPreview || formData?.profile?.logoUrl ? (
                      <img
                        src={logoPreview || formData?.profile?.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {uploadingLogo
                        ? 'Uploading logo...'
                        : <>Drag a logo here or <span className="underline font-semibold text-primary-500 cursor-pointer">browse</span></>}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      PNG, JPG or SVG · up to 5 MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Business type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {BUSINESS_TYPES.map((type) => {
                    const isSelected =
                      (formData?.profile?.businessType || '').toLowerCase() ===
                      type.toLowerCase().replace(/\s+/g, '_') ||
                      (formData?.profile?.businessType || '').toLowerCase() ===
                      type.toLowerCase();
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setSection(
                            'profile',
                            'businessType',
                            type.toLowerCase().replace(/\s+/g, '_')
                          )
                        }
                        className={`h-12 px-3 rounded-xl border text-sm font-medium transition flex items-center justify-center text-center cursor-pointer ${
                          isSelected
                            ? 'bg-primary-500/10 border-primary-500 text-primary-500 font-semibold'
                            : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  disabled
                  className="px-6 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] text-sm font-medium cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition shadow-sm cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONTACT */}
          {currentStep === 1 && (
            <div className="space-y-7 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                  How can customers reach you?
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                  Your main business contact. You can verify it later.
                </p>
              </div>

              {/* Country code and Phone number */}
              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Country code
                  </label>
                  <div className="relative">
                    <select
                      value={primaryContact.phoneCountryCode || '+91'}
                      onChange={(e) => setContact(0, 'phoneCountryCode', e.target.value)}
                      className="w-full h-12 px-4 pr-9 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 bg-[var(--bg-input)] appearance-none cursor-pointer"
                    >
                      <option value="+91">+91 India</option>
                      <option value="+1">+1 United States</option>
                      <option value="+44">+44 United Kingdom</option>
                      <option value="+971">+971 UAE</option>
                      <option value="+65">+65 Singapore</option>
                      <option value="+61">+61 Australia</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-4 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={primaryContact.phoneNumber || ''}
                    onChange={(e) => setContact(0, 'phoneNumber', e.target.value)}
                    placeholder="98765 43210"
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 transition bg-[var(--bg-input)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              {/* Business email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Business email
                </label>
                <input
                  type="email"
                  value={primaryContact.email || ''}
                  onChange={(e) => setContact(0, 'email', e.target.value)}
                  placeholder="hello@glowbeauty.in"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 transition bg-[var(--bg-input)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              {/* Checkbox: Show this contact on my booking page */}
              <div className="pt-1">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() =>
                      setContact(0, 'isDefaultPublic', !primaryContact.isDefaultPublic)
                    }
                    className={`w-5 h-5 rounded flex items-center justify-center transition border ${
                      primaryContact.isDefaultPublic !== false
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'border-[var(--border-color)] bg-[var(--bg-input)]'
                    }`}
                  >
                    {primaryContact.isDefaultPublic !== false && (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Show this contact on my booking page
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition shadow-sm cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ADDRESS */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                  Where are you registered?
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                  Used on tax invoices and legal documents. Branch addresses come next.
                </p>
              </div>

              {/* Search address */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Search address
                </label>
                <input
                  type="text"
                  placeholder="12 MG Road, Bengaluru"
                  defaultValue="12 MG Road, Bengaluru"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 transition bg-[var(--bg-input)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              {/* Map Preview Box */}
              <div className="w-full h-28 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-center text-sm font-medium text-[var(--text-muted)]">
                Map preview · pin placed
              </div>

              {/* Address Line 1 */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Address line 1
                </label>
                <input
                  type="text"
                  value={regAddress.addressLine1 || ''}
                  onChange={(e) => setAddress(0, 'addressLine1', e.target.value)}
                  placeholder="12 MG Road"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 transition bg-[var(--bg-input)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              {/* Address Line 2 */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Address line 2
                </label>
                <input
                  type="text"
                  value={regAddress.addressLine2 || ''}
                  onChange={(e) => setAddress(0, 'addressLine2', e.target.value)}
                  placeholder="Near Trinity Circle"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 transition bg-[var(--bg-input)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              {/* City, State, Postal code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    City
                  </label>
                  <input
                    type="text"
                    value={regAddress.city || ''}
                    onChange={(e) => setAddress(0, 'city', e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 transition bg-[var(--bg-input)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    State
                  </label>
                  <input
                    type="text"
                    value={regAddress.state || ''}
                    onChange={(e) => setAddress(0, 'state', e.target.value)}
                    placeholder="Karnataka"
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 transition bg-[var(--bg-input)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Postal code
                  </label>
                  <input
                    type="text"
                    value={regAddress.postalCode || ''}
                    onChange={(e) => setAddress(0, 'postalCode', e.target.value)}
                    placeholder="560001"
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 transition bg-[var(--bg-input)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Country
                </label>
                <div className="relative">
                  <select
                    value={regAddress.country || 'India'}
                    onChange={(e) => setAddress(0, 'country', e.target.value)}
                    className="w-full h-12 px-4 pr-9 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 bg-[var(--bg-input)] appearance-none cursor-pointer"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-4 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition shadow-sm cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REGIONAL */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                  Currency and region
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                  Every price, invoice and report follows these settings.
                </p>
              </div>

              {/* Currency and Timezone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Currency
                  </label>
                  <div className="relative">
                    <select
                      value={formData?.settings?.currencyCode || 'INR'}
                      onChange={(e) => setSection('settings', 'currencyCode', e.target.value)}
                      className="w-full h-12 px-4 pr-9 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 bg-[var(--bg-input)] appearance-none cursor-pointer"
                    >
                      <option value="INR">₹ INR · Indian rupee</option>
                      <option value="USD">$ USD · US Dollar</option>
                      <option value="EUR">€ EUR · Euro</option>
                      <option value="GBP">£ GBP · British Pound</option>
                      <option value="AED">د.إ AED · UAE Dirham</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-4 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Timezone
                  </label>
                  <div className="relative">
                    <select
                      value={formData?.settings?.timezone || 'Asia/Kolkata'}
                      onChange={(e) => setSection('settings', 'timezone', e.target.value)}
                      className="w-full h-12 px-4 pr-9 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 bg-[var(--bg-input)] appearance-none cursor-pointer"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata · 6:42 PM now</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Asia/Dubai">Asia/Dubai</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-4 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Price Example Notice */}
              <p className="text-xs sm:text-[13px] text-[var(--text-muted)] pt-0.5">
                A price will show as <strong className="text-[var(--text-primary)]">₹1,200.00</strong>. Changing currency later does not convert past invoices.
              </p>

              {/* Date Format, First day of week, Language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Date format
                  </label>
                  <div className="relative">
                    <select
                      value={formData?.settings?.dateFormat || 'DD/MM/YYYY'}
                      onChange={(e) => setSection('settings', 'dateFormat', e.target.value)}
                      className="w-full h-12 px-4 pr-9 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 bg-[var(--bg-input)] appearance-none cursor-pointer"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-4 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    First day of week
                  </label>
                  <div className="relative">
                    <select
                      value={String(formData?.settings?.firstDayOfWeek ?? 1)}
                      onChange={(e) => setSection('settings', 'firstDayOfWeek', Number(e.target.value))}
                      className="w-full h-12 px-4 pr-9 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 bg-[var(--bg-input)] appearance-none cursor-pointer"
                    >
                      <option value="1">Monday</option>
                      <option value="0">Sunday</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-4 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Language
                  </label>
                  <div className="relative">
                    <select
                      value={formData?.settings?.languageCode || 'en'}
                      onChange={(e) => setSection('settings', 'languageCode', e.target.value)}
                      className="w-full h-12 px-4 pr-9 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 bg-[var(--bg-input)] appearance-none cursor-pointer"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="ar">Arabic</option>
                      <option value="fr">French</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-4 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition shadow-sm cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: HOURS */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                  When are you open?
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                  Branches inherit these hours unless you change them.
                </p>
              </div>

              {/* Copy Monday to all days */}
              <div>
                <button
                  type="button"
                  onClick={copyMonday}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
                >
                  Copy Monday to all days
                </button>
              </div>

              {/* Schedule Table */}
              <div className="divide-y divide-[var(--border-color)] border-t border-b border-[var(--border-color)]">
                {days.map((d) => {
                  const hour = formData?.businessHours?.find((h) => h.dayOfWeek === d.value) || {
                    isOpen: d.value !== 0,
                    openTime: '09:00',
                    closeTime: '19:00',
                  };
                  return (
                    <div
                      key={d.label}
                      className="py-3.5 flex items-center justify-between gap-3"
                    >
                      {/* Day Label */}
                      <span className="w-12 text-sm font-semibold text-[var(--text-primary)]">
                        {d.label}
                      </span>

                      {/* Custom Checkbox */}
                      <div
                        onClick={() => setHour(d.value, 'isOpen', !hour.isOpen)}
                        className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition border ${
                          hour.isOpen
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'border-[var(--border-color)] bg-[var(--bg-input)]'
                        }`}
                      >
                        {hour.isOpen && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>

                      {/* Time Selectors */}
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <select
                            disabled={!hour.isOpen}
                            value={hour.openTime || '09:00'}
                            onChange={(e) => setHour(d.value, 'openTime', e.target.value)}
                            className={`h-11 px-4 pr-8 rounded-xl border text-sm focus:outline-none transition appearance-none ${
                              hour.isOpen
                                ? 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-primary)] focus:border-primary-500 cursor-pointer'
                                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] cursor-not-allowed'
                            }`}
                          >
                            {TIME_OPTIONS.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                        </div>

                        <div className="relative">
                          <select
                            disabled={!hour.isOpen}
                            value={hour.closeTime || '19:00'}
                            onChange={(e) => setHour(d.value, 'closeTime', e.target.value)}
                            className={`h-11 px-4 pr-8 rounded-xl border text-sm focus:outline-none transition appearance-none ${
                              hour.isOpen
                                ? 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-primary)] focus:border-primary-500 cursor-pointer'
                                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] cursor-not-allowed'
                            }`}
                          >
                            {TIME_OPTIONS.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                        </div>
                      </div>

                      {/* Closed Status text */}
                      <div className="w-16 text-right">
                        {!hour.isOpen && (
                          <span className="text-sm font-medium text-[var(--text-muted)]">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(true)}
                  className="px-7 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Next: add your first branch'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
