import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Check,
  AlertCircle,
  Sparkles,
  Loader2,
  X,
  Copy,
} from 'lucide-react';
import { checkBranchCode, uploadBranchCoverImage } from '../api/branchApi';
import { useBranch } from '../context/BranchContext';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import DatePicker from '../../../components/shared/DatePicker';
import CustomSelector from '../../../components/shared/CustomSelector';
import TimePicker from '../../../components/shared/TimePicker';
import Toggle from '../../../components/shared/Toggle';
import { toast } from 'sonner';

const TABS = [
  { id: 'profile', label: '1 Profile & Identity', icon: Building2 },
  { id: 'address', label: '2 Address & Location', icon: MapPin },
  { id: 'contact', label: '3 Contact & Phone', icon: Phone },
  { id: 'hours', label: '4 Business Hours', icon: Clock },
];

const BRANCH_TYPES = [
  { id: 'flagship', label: 'Flagship' },
  { id: 'standard', label: 'Standard Salon' },
  { id: 'kiosk', label: 'Express Kiosk' },
];

const WEEKDAYS = [
  { day: 1, label: 'Monday' },
  { day: 2, label: 'Tuesday' },
  { day: 3, label: 'Wednesday' },
  { day: 4, label: 'Thursday' },
  { day: 5, label: 'Friday' },
  { day: 6, label: 'Saturday' },
  { day: 0, label: 'Sunday' },
];

export const BranchForm = ({
  initialValues = {},
  onSubmit,
  isSubmitting = false,
  isEditMode = false,
  onCancel,
}) => {
  const { branches } = useBranch();
  const { organisations, selectedOrganisation, isSuperAdmin } = useOrganisation();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');

  // Organization Scope (Super Admin only)
  const [targetOrgId, setTargetOrgId] = useState(
    initialValues.organizationId || selectedOrganisation?.id || '',
  );

  // Tab 1: Profile State
  const [name, setName] = useState(initialValues.name || '');
  const [code, setCode] = useState(initialValues.code || '');
  const [branchType, setBranchType] = useState(initialValues.branchType || 'standard');
  const [coverImageUrl, setCoverImageUrl] = useState(initialValues.coverImageUrl || '');
  const [status, setStatus] = useState(initialValues.status || 'draft');
  const [launchedAt, setLaunchedAt] = useState(
    initialValues.launchedAt ? initialValues.launchedAt.split('T')[0] : '',
  );
  const [copySettingsFromBranchId, setCopySettingsFromBranchId] = useState(
    initialValues.copySettingsFromBranchId || '',
  );

  // Tab 2: Address State
  const [addressLine1, setAddressLine1] = useState(
    initialValues.branchAddress?.addressLine1 || '',
  );
  const [addressLine2, setAddressLine2] = useState(
    initialValues.branchAddress?.addressLine2 || '',
  );
  const [landmark, setLandmark] = useState(
    initialValues.branchAddress?.landmark || '',
  );
  const [city, setCity] = useState(initialValues.branchAddress?.city || '');
  const [state, setState] = useState(initialValues.branchAddress?.state || '');
  const [postalCode, setPostalCode] = useState(
    initialValues.branchAddress?.postalCode || '',
  );
  const [countryCode, setCountryCode] = useState(
    initialValues.branchAddress?.countryCode || 'IN',
  );
  const [mapsUrl, setMapsUrl] = useState(
    initialValues.branchAddress?.mapsUrl || '',
  );

  // Tab 3: Contact State
  const [phoneCountryCode, setPhoneCountryCode] = useState(
    initialValues.branchContact?.phoneCountryCode || '+91',
  );
  const [phoneNumber, setPhoneNumber] = useState(
    initialValues.branchContact?.phoneNumber || '',
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialValues.branchContact?.whatsappNumber || '',
  );
  const [email, setEmail] = useState(initialValues.branchContact?.email || '');

  // Tab 4: Business Hours State
  const [businessHours, setBusinessHours] = useState(() => {
    if (initialValues.businessHours && initialValues.businessHours.length > 0) {
      const map = new Map(initialValues.businessHours.map((h) => [h.dayOfWeek, h]));
      return WEEKDAYS.map((w) => {
        const existing = map.get(w.day);
        return {
          dayOfWeek: w.day,
          label: w.label,
          isOpen: existing ? Boolean(existing.isOpen) : w.day !== 0,
          openTime: existing?.openTime || '09:00',
          closeTime: existing?.closeTime || '19:00',
        };
      });
    }
    return WEEKDAYS.map((w) => ({
      dayOfWeek: w.day,
      label: w.label,
      isOpen: w.day !== 0,
      openTime: '09:00',
      closeTime: '19:00',
    }));
  });

  // Code Validation State
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState(null);
  const [suggestedCode, setSuggestedCode] = useState(null);
  const [codeError, setCodeError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});

  // Sync targetOrgId with selectedOrganisation if Super Admin changes it externally
  useEffect(() => {
    if (!isEditMode && isSuperAdmin && selectedOrganisation?.id && !targetOrgId) {
      setTargetOrgId(selectedOrganisation.id);
    }
  }, [isSuperAdmin, selectedOrganisation?.id, isEditMode, targetOrgId]);

  // Debounced code availability check
  useEffect(() => {
    if (!code || code.trim().length < 2) {
      setCodeAvailable(null);
      setSuggestedCode(null);
      setCodeError(null);
      return;
    }

    if (isEditMode && code.trim().toUpperCase() === initialValues.code?.toUpperCase()) {
      setCodeAvailable(true);
      setSuggestedCode(null);
      setCodeError(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCodeChecking(true);
        setCodeError(null);
        const res = await checkBranchCode(
          code.trim().toUpperCase(),
          isSuperAdmin ? targetOrgId : undefined,
        );
        setCodeAvailable(res.available);
        setSuggestedCode(res.suggestedCode);
        if (!res.available) {
          setCodeError(`Branch code "${code.trim().toUpperCase()}" is already taken.`);
        }
      } catch (err) {
        console.error('Code check error:', err);
      } finally {
        setCodeChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [code, isEditMode, initialValues.code, targetOrgId, isSuperAdmin]);

  // Cover Image Upload Handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size cannot exceed 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const res = await uploadBranchCoverImage(file);
      const fileUrl = res?.url || res?.data?.url || res?.fileUrl;
      if (fileUrl) {
        setCoverImageUrl(fileUrl);
        toast.success('Cover image uploaded successfully');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to upload cover image');
    } finally {
      setUploadingImage(false);
    }
  };

  const copyMondayHoursToAll = () => {
    const monday = businessHours.find((h) => h.dayOfWeek === 1);
    if (!monday) return;
    setBusinessHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek >= 1 && h.dayOfWeek <= 5
          ? { ...h, isOpen: monday.isOpen, openTime: monday.openTime, closeTime: monday.closeTime }
          : h,
      ),
    );
    toast.success('Monday schedule copied to all weekdays');
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Branch name is required';
    } else if (name.trim().length < 2) {
      errs.name = 'Branch name must be at least 2 characters';
    }

    if (!code.trim()) {
      errs.code = 'Branch code is required';
    } else if (!/^[A-Za-z0-9_-]+$/.test(code.trim())) {
      errs.code = 'Only letters, numbers, hyphens and underscores allowed';
    } else if (codeAvailable === false) {
      errs.code = codeError || 'Branch code already in use';
    }

    if (isSuperAdmin && !targetOrgId) {
      errs.targetOrgId = 'Please select a target organization';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (targetStatus) => {
    if (!validate()) {
      toast.error('Please fix validation errors before proceeding');
      setActiveTab('profile');
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      branchType,
      coverImageUrl: coverImageUrl || null,
      status: targetStatus || status,
      launchedAt: launchedAt || null,
      ...(isSuperAdmin && targetOrgId ? { organizationId: targetOrgId } : {}),
      ...(copySettingsFromBranchId ? { copySettingsFromBranchId } : {}),

      // Address
      ...(addressLine1.trim()
        ? {
            address: {
              addressLine1: addressLine1.trim(),
              addressLine2: addressLine2.trim() || undefined,
              landmark: landmark.trim() || undefined,
              city: city.trim(),
              state: state.trim(),
              postalCode: postalCode.trim(),
              countryCode: countryCode.trim().toUpperCase() || 'IN',
              mapsUrl: mapsUrl.trim() || undefined,
            },
          }
        : {}),

      // Contact
      ...(phoneNumber.trim() || email.trim() || whatsappNumber.trim()
        ? {
            contact: {
              phoneCountryCode,
              phoneNumber: phoneNumber.trim() || undefined,
              whatsappNumber: whatsappNumber.trim() || undefined,
              email: email.trim() || undefined,
            },
          }
        : {}),

      // Business Hours
      businessHours: businessHours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        isOpen: h.isOpen,
        openTime: h.openTime,
        closeTime: h.closeTime,
      })),
    };

    onSubmit(payload, targetStatus === 'draft');
  };

  const currentTabIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Sleek Horizontal Tab Bar */}
      <div className="border-b border-[var(--border-color)] pb-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {TABS.map((tab, idx) => {
            const isCurrent = activeTab === tab.id;
            const isDone = idx < currentTabIndex;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col gap-1.5 text-left transition select-none cursor-pointer ${
                  isCurrent ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`h-[3px] rounded-full transition-all duration-300 ${
                    isCurrent || isDone ? 'bg-primary-500' : 'bg-[var(--border-color)]'
                  }`}
                />
                <span
                  className={`text-xs tracking-tight truncate ${
                    isCurrent
                      ? 'font-bold text-[var(--text-primary)]'
                      : isDone
                      ? 'font-medium text-[var(--text-secondary)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PROFILE & IDENTITY */}
      {activeTab === 'profile' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {isEditMode ? 'Branch profile & identity' : 'Establish new branch'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
              Configure foundational identity, unique code, operational tier and multi-tenant partition.
            </p>
          </div>

          {/* Super Admin Organization Picker via shared CustomSelector */}
          {isSuperAdmin && (
            <div className="p-3.5 rounded-2xl bg-primary-500/5 border border-primary-500/20">
              <CustomSelector
                label="Target Organization"
                required
                options={organisations.map((org) => ({
                  value: org.id,
                  label: `${org.name} (${org.slug ? `@${org.slug}` : org.id.slice(0, 8)})`,
                }))}
                value={targetOrgId}
                onChange={(val) => {
                  setTargetOrgId(val);
                  if (errors.targetOrgId) setErrors((prev) => ({ ...prev, targetOrgId: null }));
                }}
                placeholder="Select Target Organization..."
                error={errors.targetOrgId}
                isSearchable
                isClearable={false}
              />
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                The branch will be provisioned inside this organization's data partition.
              </p>
            </div>
          )}

          {/* Branch Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
              Branch name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              placeholder="e.g. Indiranagar Flagship Salon & Spa"
              className={`w-full h-11 px-3.5 rounded-xl border text-sm text-[var(--text-primary)] bg-[var(--bg-input)] placeholder:text-[var(--text-muted)] focus:outline-none transition ${
                errors.name ? 'border-rose-500' : 'border-[var(--border-color)] focus:border-primary-500'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
          </div>

          {/* Branch Code */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Branch code <span className="text-rose-500">*</span>
              </label>
              {codeChecking ? (
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin text-primary-500" />
                  Checking...
                </span>
              ) : codeAvailable === true ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check size={13} /> Available
                </span>
              ) : null}
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (errors.code) setErrors((prev) => ({ ...prev, code: null }));
              }}
              placeholder="e.g. BLR-01"
              maxLength={20}
              className={`w-full h-11 px-3.5 font-mono uppercase rounded-xl border text-sm text-[var(--text-primary)] bg-[var(--bg-input)] placeholder:text-[var(--text-muted)] focus:outline-none transition ${
                errors.code || codeAvailable === false
                  ? 'border-rose-500'
                  : codeAvailable === true
                  ? 'border-emerald-500/60 focus:border-emerald-500'
                  : 'border-[var(--border-color)] focus:border-primary-500'
              }`}
            />
            {codeAvailable === false && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <AlertCircle size={14} className="shrink-0 text-rose-500" />
                  <span>Branch code "{code}" is already taken.</span>
                </span>
                {suggestedCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setCode(suggestedCode);
                      setCodeAvailable(true);
                      setSuggestedCode(null);
                      setCodeError(null);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-500 text-white font-mono text-xs font-bold hover:bg-primary-600 transition cursor-pointer"
                  >
                    <Sparkles size={12} /> Use {suggestedCode}
                  </button>
                )}
              </div>
            )}
            {errors.code && codeAvailable !== false && (
              <p className="text-xs text-rose-500">{errors.code}</p>
            )}
          </div>

          {/* Cover Photo Upload */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
              Cover photo
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--border-color)] hover:border-primary-500 rounded-2xl p-4 sm:p-5 flex items-center gap-4 bg-[var(--bg-input)] cursor-pointer transition"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                {coverImageUrl ? (
                  <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={24} className="opacity-70" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                  {uploadingImage
                    ? 'Uploading photo...'
                    : <>Drag cover photo here or <span className="underline font-semibold text-primary-500">browse</span></>}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  PNG, JPG or WebP · up to 5 MB
                </p>
              </div>
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoverImageUrl('');
                  }}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition cursor-pointer"
                  title="Remove photo"
                >
                  <X size={16} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
            </div>
          </div>

          {/* Branch Operational Tier Pills */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
              Branch operational tier
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {BRANCH_TYPES.map((bt) => {
                const isSelected = branchType === bt.id;
                return (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setBranchType(bt.id)}
                    className={`h-11 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10 text-primary-500 font-bold'
                        : 'border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:border-primary-500/40 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{bt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Launch Date using shared DatePicker & Inherit Settings using CustomSelector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
            <div>
              <DatePicker
                label="Launch date (optional)"
                value={launchedAt}
                onChange={(val) => setLaunchedAt(val)}
                placeholder="Select launch date"
              />
            </div>

            {!isEditMode && branches.length > 0 && (
              <div>
                <CustomSelector
                  label="Inherit settings from branch"
                  options={[
                    { value: '', label: 'Start fresh (None)' },
                    ...branches.map((b) => ({
                      value: b.id,
                      label: `${b.name} (${b.code}) - ${b.branchType}`,
                    })),
                  ]}
                  value={copySettingsFromBranchId}
                  onChange={(val) => setCopySettingsFromBranchId(val)}
                  placeholder="Select source branch..."
                  isSearchable
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ADDRESS & LOCATION */}
      {activeTab === 'address' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Branch address & location
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
              Physical salon location printed on customer receipts and booking confirmations.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
              Address Line 1 (Street / Building)
            </label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="e.g. 100 Feet Road, HAL 2nd Stage"
              className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Address Line 2 (Suite / Floor)
              </label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="e.g. 2nd Floor, Suite 402"
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Sony Center"
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                State / Province
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka"
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Postal / PIN Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g. 560038"
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Country Code
              </label>
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="IN"
                maxLength={2}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 font-mono uppercase transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
              Google Maps URL (optional)
            </label>
            <input
              type="url"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 transition"
            />
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT & PHONE */}
      {activeTab === 'contact' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Branch contact & communication
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
              Customer phone line, booking assistance number, and public contact email.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Country Code
              </label>
              <input
                type="text"
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
                placeholder="+91"
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 transition"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 98765 43210"
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                WhatsApp Booking Line
              </label>
              {phoneNumber && (
                <button
                  type="button"
                  onClick={() => setWhatsappNumber(phoneNumber)}
                  className="text-[11px] text-primary-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={11} /> Same as phone
                </button>
              )}
            </div>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="e.g. 98765 43210"
              className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
              Branch Public Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              placeholder="e.g. indiranagar@glowbeauty.in"
              className={`w-full h-11 px-3.5 rounded-xl border text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none transition ${
                errors.email ? 'border-rose-500' : 'border-[var(--border-color)] focus:border-primary-500'
              }`}
            />
            {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
          </div>
        </div>
      )}

      {/* TAB 4: BUSINESS HOURS */}
      {activeTab === 'hours' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Weekly business hours
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
                Set active operational slots for public bookings and stylist shifts.
              </p>
            </div>
            <button
              type="button"
              onClick={copyMondayHoursToAll}
              className="inline-flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-600 font-semibold px-2.5 py-1.5 rounded-lg border border-primary-500/20 bg-primary-500/10 cursor-pointer transition shrink-0"
            >
              <Copy size={13} /> Copy Monday to weekdays
            </button>
          </div>

          <div className="border border-[var(--border-color)] rounded-2xl divide-y divide-[var(--border-color)] overflow-hidden bg-[var(--bg-input)]/30">
            {businessHours.map((hour, index) => (
              <div
                key={hour.dayOfWeek}
                className={`p-3.5 flex flex-wrap items-center justify-between gap-3 ${
                  hour.isOpen ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-input)]/20 opacity-70'
                }`}
              >
                {/* Day label and shared Toggle component */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Toggle
                    checked={hour.isOpen}
                    onChange={(checked) =>
                      setBusinessHours((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, isOpen: checked } : item,
                        ),
                      )
                    }
                    size="sm"
                    showText={false}
                  />
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    {hour.label}
                  </span>
                </div>

                {/* Shared TimePicker Components */}
                {hour.isOpen ? (
                  <div className="flex items-center gap-2">
                    <div className="w-32">
                      <TimePicker
                        value={hour.openTime}
                        onChange={(timeVal) =>
                          setBusinessHours((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, openTime: timeVal } : item,
                            ),
                          )
                        }
                        timeFormat="24h"
                        step={30}
                        placeholder="Open time"
                      />
                    </div>

                    <span className="text-xs text-[var(--text-muted)]">to</span>

                    <div className="w-32">
                      <TimePicker
                        value={hour.closeTime}
                        onChange={(timeVal) =>
                          setBusinessHours((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, closeTime: timeVal } : item,
                            ),
                          )
                        }
                        timeFormat="24h"
                        step={30}
                        placeholder="Close time"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-[var(--text-muted)] italic pr-4">
                    Closed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Persistent Footer Actions */}
      <div className="pt-5 flex items-center justify-between border-t border-[var(--border-color)]">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs sm:text-sm font-medium transition cursor-pointer"
        >
          {isEditMode ? 'Cancel' : 'Back'}
        </button>

        <div className="flex items-center gap-2.5">
          {!isEditMode && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('draft')}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save as draft'}
            </button>
          )}

          {currentTabIndex < TABS.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (validate()) {
                  setActiveTab(TABS[currentTabIndex + 1].id);
                } else {
                  toast.error('Please complete required fields before proceeding');
                }
              }}
              className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-semibold transition shadow-sm cursor-pointer"
            >
              Next step →
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(isEditMode ? status : 'active')}
              className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? 'Saving...'
                : isEditMode
                ? 'Save all changes'
                : 'Create branch location'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchForm;
