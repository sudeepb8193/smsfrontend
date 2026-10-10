import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  Globe2,
  ImagePlus,
  MapPin,
  Plus,
  Save,
  Scissors,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  fetchAddressDetails,
  fetchAddressSuggestions,
  sendOrganisationContactVerification,
  sendOwnerContactVerification,
  uploadImageFile,
} from '../api/organisationApi';
import Dropdown from '../../../components/shared/Dropdown';
import DatePicker from '../../../components/shared/DatePicker';
import TimePicker from '../../../components/shared/TimePicker';
import StateCard from '../../../components/shared/StateCard';

const STEPS = [
  { id: 'profile', label: 'Business profile', icon: Building2 },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'tax', label: 'Tax registration', icon: ShieldCheck },
  { id: 'settings', label: 'Regional settings', icon: Globe2 },
  { id: 'hours', label: 'Business hours', icon: Clock3 },
  { id: 'holidays', label: 'Holiday calendar', icon: CalendarDays },
];
const WEEKDAYS = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 0 },
];
const CONTACT_TYPES = [
  { value: 'primary', label: 'Primary' },
  { value: 'support', label: 'Support' },
  { value: 'billing', label: 'Billing' },
  { value: 'emergency', label: 'Emergency' },
];
const PHONE_CODES = [
  { value: '+91', label: '+91 India' },
  { value: '+1', label: '+1 US / Canada' },
  { value: '+44', label: '+44 UK' },
  { value: '+971', label: '+971 UAE' },
  { value: '+61', label: '+61 Australia' },
  { value: '+65', label: '+65 Singapore' },
  { value: '+49', label: '+49 Germany' },
  { value: '+33', label: '+33 France' },
  { value: '+81', label: '+81 Japan' },
  { value: '+86', label: '+86 China' },
  { value: '+27', label: '+27 South Africa' },
  { value: '+64', label: '+64 New Zealand' },
  { value: '+353', label: '+353 Ireland' },
  { value: '+39', label: '+39 Italy' },
  { value: '+34', label: '+34 Spain' },
];
const BUSINESS_TYPES = [
  { value: 'salon', label: 'Salon', detail: 'Hair, nail, and beauty services', icon: Building2 },
  { value: 'spa', label: 'Spa', detail: 'Relaxation and wellness treatments', icon: BadgeCheck },
  { value: 'unisex_salon', label: 'Unisex salon', detail: 'Services for everyone', icon: Users },
  { value: 'barbershop', label: 'Barbershop', detail: 'Barbering and grooming', icon: ScissorsIcon },
  { value: 'wellness_center', label: 'Wellness center', detail: 'Holistic health and wellness', icon: Globe2 },
  { value: 'other', label: 'Other', detail: 'Another type of business', icon: Plus },
];
const COMMON_CURRENCIES = [
  { value: 'INR', label: 'INR - Indian Rupee (₹)' },
  { value: 'USD', label: 'USD - US Dollar ($)' },
  { value: 'EUR', label: 'EUR - Euro (€)' },
  { value: 'GBP', label: 'GBP - British Pound (£)' },
  { value: 'AED', label: 'AED - UAE Dirham (د.إ)' },
  { value: 'CAD', label: 'CAD - Canadian Dollar ($)' },
  { value: 'AUD', label: 'AUD - Australian Dollar ($)' },
  { value: 'JPY', label: 'JPY - Japanese Yen (¥)' },
  { value: 'SGD', label: 'SGD - Singapore Dollar ($)' },
];
const CURRENCY_CODES = typeof Intl.supportedValuesOf === 'function'
  ? Intl.supportedValuesOf('currency')
  : COMMON_CURRENCIES.map((currency) => currency.value);
const CURRENCY_NAMES = typeof Intl.DisplayNames === 'function'
  ? new Intl.DisplayNames(undefined, { type: 'currency' })
  : null;
const CURRENCIES = CURRENCY_CODES.map((value) => {
  const symbol = getCurrencySymbol(value);
  return {
    value,
    label: `${value} - ${CURRENCY_NAMES?.of(value) || value} (${symbol})`,
  };
});
const COMMON_TIMEZONES = [
  'Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Singapore',
  'Australia/Sydney', 'Asia/Tokyo', 'America/Toronto',
];
const TIMEZONES = (typeof Intl.supportedValuesOf === 'function'
  ? Intl.supportedValuesOf('timeZone')
  : COMMON_TIMEZONES).map((value) => ({
  value,
  label: `${value} • ${new Intl.DateTimeFormat(undefined, {
    timeZone: value,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())}`,
}));
const COUNTRIES = [
  { value: 'India', label: 'India' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Singapore', label: 'Singapore' },
];
const COUNTRY_STATES = {
  India: ['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'],
  'United States': ['California', 'Florida', 'Illinois', 'New York', 'Texas', 'Washington'],
  'United Kingdom': ['England', 'Northern Ireland', 'Scotland', 'Wales'],
  'United Arab Emirates': ['Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Sharjah'],
  Canada: ['Alberta', 'British Columbia', 'Ontario', 'Quebec'],
  Australia: ['New South Wales', 'Queensland', 'South Australia', 'Victoria', 'Western Australia'],
  Singapore: ['Central Singapore', 'North East', 'North West', 'South East', 'South West'],
};
const MONTHS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: new Date(2025, index, 1).toLocaleString(undefined, { month: 'long' }),
}));
function getCurrencySymbol(currencyCode) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).formatToParts(0).find((part) => part.type === 'currency')?.value || currencyCode;
  } catch {
    return currencyCode;
  }
}

function ScissorsIcon(props) {
  return <Scissors {...props} />;
}

function Field({ label, value, onChange, type = 'text', placeholder, required, helperText, error, ...props }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}{required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      <input
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`h-10 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 dark:bg-slate-800 dark:text-white ${
          error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
        }`}
        {...props}
      />
      {error && <span role="alert" className="text-xs font-medium text-rose-500">{error}</span>}
      {!error && helperText && <span className="text-xs text-slate-500">{helperText}</span>}
    </label>
  );
}

function TextareaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <textarea value={value ?? ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
    </label>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 text-left">
      <span>
        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

function makeDefaultHours() {
  return WEEKDAYS.map(({ value }) => ({
    dayOfWeek: value,
    isOpen: value >= 1 && value <= 5,
    openTime: '09:00',
    closeTime: '18:00',
    breakStartTime: '',
    breakEndTime: '',
    spansMidnight: false,
  }));
}

function normalizePhone(contact) {
  const code = contact.phoneCountryCode || '';
  const number = (contact.phoneNumber || '').replace(/[\s()-]/g, '');
  return number && code && !number.startsWith('+') ? `${code}${number}` : number;
}

function getContactPhone(item) {
  const rawNumber = item.phoneNumber || '';
  const knownCode = PHONE_CODES
    .map((code) => code.value)
    .sort((left, right) => right.length - left.length)
    .find((code) => rawNumber.startsWith(code));
  const countryCode = item.phoneCountryCode || knownCode || '+91';
  const phoneNumber = knownCode && !item.phoneCountryCode
    ? rawNumber.slice(knownCode.length)
    : item.phoneCountryCode && rawNumber.startsWith(item.phoneCountryCode)
      ? rawNumber.slice(item.phoneCountryCode.length)
      : rawNumber;
  return { phoneCountryCode: countryCode, phoneNumber };
}

function setupFromOrganisation(org) {
  const currentContacts = org.organizationContacts || [];
  const registered = org.organizationAddresses?.find((item) => item.addressType === 'registered');
  const billing = org.organizationAddresses?.find((item) => item.addressType === 'billing');
  const tax = org.organizationTaxProfiles?.[0];
  const settings = org.organizationSettings || {};
  const contacts = currentContacts.length
    ? currentContacts.map((item) => ({
      id: item.id,
      contactType: item.contactType,
      contactName: item.contactName || '',
      ...getContactPhone(item),
      email: item.email || '',
      emailVerified: item.emailVerified || false,
      isDefaultPublic: item.isDefaultPublic || false,
      sameAsPrimary: item.sameAsPrimary || false,
    }))
    : [{
      contactType: 'primary',
      contactName: org.name || '',
      phoneCountryCode: '+91',
      phoneNumber: org.phone || '',
      email: org.email || '',
      emailVerified: false,
      isDefaultPublic: true,
      sameAsPrimary: false,
    }];
  const addresses = [
    { addressType: 'registered', ...(registered || {}), sameAsRegistered: false },
    { addressType: 'billing', ...(billing || {}), sameAsRegistered: billing?.sameAsRegistered || false },
  ].map((item) => ({
    id: item.id,
    addressType: item.addressType,
    addressLine1: item.addressLine1 || '',
    addressLine2: item.addressLine2 || '',
    landmark: item.landmark || '',
    city: item.city || '',
    state: item.state || '',
    postalCode: item.postalCode || '',
    country: item.country || registered?.country || 'India',
    latitude: item.latitude == null ? null : Number(item.latitude),
    longitude: item.longitude == null ? null : Number(item.longitude),
    sameAsRegistered: item.sameAsRegistered || false,
  }));
  if (addresses[1].sameAsRegistered) Object.assign(addresses[1], addresses[0], { addressType: 'billing', sameAsRegistered: true });

  const hoursByDay = new Map((org.businessHours || []).map((item) => [item.dayOfWeek, item]));
  const businessHours = makeDefaultHours().map((fallback) => {
    const item = hoursByDay.get(fallback.dayOfWeek);
    return item ? {
      dayOfWeek: item.dayOfWeek,
      isOpen: item.isOpen,
      openTime: item.openTime || '',
      closeTime: item.closeTime || '',
      breakStartTime: item.breakStartTime || '',
      breakEndTime: item.breakEndTime || '',
      spansMidnight: item.spansMidnight || false,
    } : fallback;
  });

  return {
    profile: {
      name: org.name || '',
      legalName: org.legalName || '',
      slug: org.slug || '',
      businessType: org.businessType || 'salon',
      logoUrl: org.logoUrl || '',
      logoSquareUrl: org.logoSquareUrl || '',
      logoWideUrl: org.logoWideUrl || '',
      faviconUrl: org.faviconUrl || '',
      brandPrimaryColor: org.brandPrimaryColor || '#8A4A52',
      brandSecondaryColor: org.brandSecondaryColor || '#D9A7AE',
      status: org.status || 'onboarding',
      onboardingStep: org.onboardingStep || 0,
    },
    contacts,
    addresses,
    taxProfile: tax ? {
      id: tax.id,
      taxIdentifierType: tax.taxIdentifierType,
      taxIdentifierNumber: tax.taxIdentifierNumber,
      registeredBusinessName: tax.registeredBusinessName,
      taxRegistrationDate: tax.taxRegistrationDate ? new Date(tax.taxRegistrationDate).toISOString().slice(0, 10) : '',
      isTaxExempt: tax.isTaxExempt,
      documentUrl: tax.documentUrl || '',
      verificationStatus: tax.verificationStatus || 'pending',
      verificationNotes: tax.verificationNotes || '',
    } : {
      taxIdentifierType: 'gstin',
      taxIdentifierNumber: '',
      registeredBusinessName: org.legalName || org.name || '',
      taxRegistrationDate: '',
      isTaxExempt: false,
      documentUrl: '',
      verificationStatus: 'pending',
      verificationNotes: '',
    },
    settings: {
      currencyCode: settings.currencyCode || 'INR',
      currencySymbolPosition: settings.currencySymbolPosition || 'prefix',
      currencyDecimalPlaces: settings.currencyDecimalPlaces ?? 2,
      timezone: settings.timezone || 'Asia/Kolkata',
      dateFormat: settings.dateFormat || 'DD/MM/YYYY',
      timeFormat: settings.timeFormat === 'h24' || settings.timeFormat === '24-hour' ? 'h24' : 'h12',
      firstDayOfWeek: settings.firstDayOfWeek ?? 1,
      languageCode: settings.languageCode || 'en',
      fiscalYearStartMonth: settings.fiscalYearStartMonth || 4,
    },
    businessHours,
    holidays: (org.holidays || []).map((item) => ({
      id: item.id,
      branchId: item.branchId || '',
      name: item.name || '',
      description: item.description || '',
      holidayDate: getRecurringOccurrence(item.holidayDate, item.isRecurringAnnually),
      isRecurringAnnually: Boolean(item.isRecurringAnnually),
      status: item.status || 'active',
    })),
  };
}

function getRecurringOccurrence(value, recurring) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!recurring) return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const today = new Date();
  const firstCandidateYear = today.getFullYear();
  const todayStart = new Date(firstCandidateYear, today.getMonth(), today.getDate());
  for (let candidateYear = firstCandidateYear; candidateYear <= firstCandidateYear + 8; candidateYear += 1) {
    const occurrence = new Date(candidateYear, month - 1, day);
    if (
      occurrence.getMonth() === month - 1 &&
      occurrence.getDate() === day &&
      occurrence >= todayStart
    ) {
      return `${candidateYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  return value.slice(0, 10);
}

function getContrastWarning(hexColor) {
  if (!/^#[0-9a-f]{6}$/i.test(hexColor || '')) return false;
  const channels = hexColor.slice(1).match(/.{2}/g).map((value) => parseInt(value, 16) / 255);
  const luminance = channels.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  const relative = 0.2126 * luminance[0] + 0.7152 * luminance[1] + 0.0722 * luminance[2];
  return (1.05 / (relative + 0.05)) < 4.5 && ((relative + 0.05) / 0.05) < 4.5;
}

function assetUrl(value) {
  if (!value) return '';
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const base = rawBase.replace(/\/+$/, '');
  const apiBase = base.endsWith('/sms') ? base : `${base}/sms`;
  return `${apiBase}/storage/file?key=${encodeURIComponent(value)}`;
}

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(previewUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error('The selected logo could not be read as an image.'));
    };
    image.src = previewUrl;
  });
}

async function createLogoVariant(file, width, height, name) {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare the logo images.');
    const scale = Math.max(width / bitmap.width, height / bitmap.height);
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    const sourceX = (bitmap.width - sourceWidth) / 2;
    const sourceY = (bitmap.height - sourceHeight) / 2;
    context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error('Your browser could not encode the logo images.'));
      }, 'image/png');
    });
    return new File([blob], name, { type: 'image/png' });
  } finally {
    bitmap.close();
  }
}

export default function OrganisationSetupForm({
  organisation,
  saving,
  serverError,
  onSave,
  onCancel,
  onCheckSlugAvailability,
  isSuperAdmin = true,
  isOwner = false,
}) {
  const [form, setForm] = useState(() => setupFromOrganisation(organisation));
  const [step, setStep] = useState(() => Math.min(organisation.onboardingStep || 0, 6));
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState(null);
  const [uploading, setUploading] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [localPreview, setLocalPreview] = useState('');
  const [addressSearch, setAddressSearch] = useState({});
  const [addressSuggestions, setAddressSuggestions] = useState({});
  const [addressSearchErrors, setAddressSearchErrors] = useState({});
  const [addressSearchLoading, setAddressSearchLoading] = useState({});
  const [addressSelectionLoading, setAddressSelectionLoading] = useState({});
  const [verificationSending, setVerificationSending] = useState({});
  const [verificationMessages, setVerificationMessages] = useState({});
  const [holidayDraft, setHolidayDraft] = useState({
    name: '', description: '', holidayDate: '', isRecurringAnnually: false, branchId: '',
  });
  const [currencyConfirmation, setCurrencyConfirmation] = useState('');
  const slugCheckSequence = useRef(0);
  const addressSearchTimers = useRef({});
  const addressSearchSequence = useRef({});
  const addressSessionTokens = useRef({});
  const originalCurrency = organisation.organizationSettings?.currencyCode || 'INR';

  useEffect(() => () => {
    if (localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  useEffect(() => () => {
    Object.values(addressSearchTimers.current).forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    if (!form.profile.slug || form.profile.slug === organisation.slug) return undefined;
    const sequence = ++slugCheckSequence.current;
    const timer = window.setTimeout(async () => {
      try {
        const result = await onCheckSlugAvailability(form.profile.slug);
        if (sequence === slugCheckSequence.current) setSlugAvailability({ ...result, slug: form.profile.slug });
      } catch (error) {
        console.error('Slug availability check failed:', error);
        if (sequence === slugCheckSequence.current) setSlugAvailability({ error: error.message, slug: form.profile.slug });
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [form.profile.slug, organisation.id, organisation.slug, onCheckSlugAvailability]);

  const setSection = (section, key, value) => {
    setForm((current) => ({ ...current, [section]: { ...current[section], [key]: value } }));
  };
  const setAddress = (index, key, value) => {
    setForm((current) => {
      const addresses = current.addresses.map((address, addressIndex) => (
        addressIndex === index ? { ...address, [key]: value } : address
      ));
      if (index === 0 && current.addresses[1].sameAsRegistered) {
        addresses[1] = { ...addresses[0], addressType: 'billing', sameAsRegistered: true };
      }
      return { ...current, addresses };
    });
  };
  const setContact = (index, key, value) => {
    setForm((current) => ({
      ...current,
      contacts: current.contacts.map((contact, contactIndex) => {
        if (contactIndex === index) {
          const emailChanged =
            key === 'email' &&
            String(value).trim().toLowerCase() !== String(contact.email).trim().toLowerCase();
          return {
            ...contact,
            [key]: value,
            ...(emailChanged ? { emailVerified: false } : {}),
          };
        }
        if (key === 'isDefaultPublic' && value) return { ...contact, isDefaultPublic: false };
        return contact;
      }),
    }));
  };
  const sendContactVerification = async (contact, index) => {
    if (!contact.id) return;
    setVerificationSending((current) => ({ ...current, [index]: true }));
    setVerificationMessages((current) => ({ ...current, [index]: '' }));
    setUploadError('');
    try {
      const result = isOwner
        ? await sendOwnerContactVerification(contact.id)
        : await sendOrganisationContactVerification(organisation.id, contact.id);
      setVerificationMessages((current) => ({ ...current, [index]: result.message }));
    } catch (error) {
      console.error('Contact email verification request failed:', error);
      setUploadError(error.message || 'The verification email could not be sent.');
    } finally {
      setVerificationSending((current) => ({ ...current, [index]: false }));
    }
  };
  const setHour = (dayOfWeek, key, value) => {
    setForm((current) => ({
      ...current,
      businessHours: current.businessHours.map((hour) => hour.dayOfWeek === dayOfWeek
        ? { ...hour, [key]: value }
        : hour),
    }));
  };

  const handleAddressSearch = (index, value, country = form.addresses[index].country) => {
    setAddressSearch((current) => ({ ...current, [index]: value }));
    setAddressSearchErrors((current) => ({ ...current, [index]: '' }));
    if (addressSearchTimers.current[index]) {
      window.clearTimeout(addressSearchTimers.current[index]);
    }
    const sequence = (addressSearchSequence.current[index] || 0) + 1;
    addressSearchSequence.current[index] = sequence;
    if (value.trim().length < 3) {
      setAddressSuggestions((current) => ({ ...current, [index]: [] }));
      setAddressSearchLoading((current) => ({ ...current, [index]: false }));
      return;
    }
    const sessionToken = addressSessionTokens.current[index] || crypto.randomUUID();
    addressSessionTokens.current[index] = sessionToken;
    setAddressSearchLoading((current) => ({ ...current, [index]: true }));
    addressSearchTimers.current[index] = window.setTimeout(async () => {
      try {
        const result = await fetchAddressSuggestions(value.trim(), country, sessionToken);
        if (addressSearchSequence.current[index] === sequence) {
          setAddressSuggestions((current) => ({
            ...current,
            [index]: result.suggestions || [],
          }));
        }
      } catch (error) {
        console.error('Google Places address search failed:', error);
        if (addressSearchSequence.current[index] === sequence) {
          setAddressSuggestions((current) => ({ ...current, [index]: [] }));
          setAddressSearchErrors((current) => ({ ...current, [index]: error.message }));
        }
      } finally {
        if (addressSearchSequence.current[index] === sequence) {
          setAddressSearchLoading((current) => ({ ...current, [index]: false }));
        }
      }
    }, 350);
  };

  const selectAddressSuggestion = async (index, suggestion) => {
    const sessionToken = addressSessionTokens.current[index];
    setAddressSelectionLoading((current) => ({ ...current, [index]: true }));
    setAddressSearchErrors((current) => ({ ...current, [index]: '' }));
    try {
      const details = await fetchAddressDetails(suggestion.placeId, sessionToken);
      if (!details) throw new Error('Google Places could not return this address. Choose another result.');
      setForm((current) => {
        const addresses = [...current.addresses];
        const selectedAddress = { ...addresses[index], ...details };
        addresses[index] = selectedAddress;
        if (index === 0 && addresses[1].sameAsRegistered) {
          addresses[1] = {
            ...selectedAddress,
            addressType: 'billing',
            sameAsRegistered: true,
          };
        }
        return { ...current, addresses };
      });
      setAddressSearch((current) => ({ ...current, [index]: details.addressLine1 }));
      setAddressSuggestions((current) => ({ ...current, [index]: [] }));
      addressSessionTokens.current[index] = crypto.randomUUID();
    } catch (error) {
      console.error('Google Places address selection failed:', error);
      setAddressSearchErrors((current) => ({ ...current, [index]: error.message }));
    } finally {
      setAddressSelectionLoading((current) => ({ ...current, [index]: false }));
    }
  };

  const handleNameChange = (name) => {
    setSection('profile', 'name', name);
    if (!slugEdited && !organisation.slugChangedAt) {
      setSection('profile', 'slug', name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 160));
    }
  };

  const handleUpload = async (event, kind) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const logo = kind === 'logo' || kind === 'favicon';
    const allowed = logo
      ? ['image/jpeg', 'image/png', 'image/svg+xml']
      : ['application/pdf', 'image/jpeg', 'image/png'];
    const limit = logo ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (!allowed.includes(file.type) || file.size > limit) {
      setUploadError(logo
        ? 'Choose a JPG, PNG, or SVG file smaller than 5 MB.'
        : 'Choose a PDF, JPG, or PNG file smaller than 10 MB.');
      return;
    }
    let logoVariants;
    if (kind === 'logo') {
      try {
        const { width, height } = await getImageDimensions(file);
        if (width < 200 || height < 200) {
          setUploadError('Logo images must be at least 200 × 200 pixels.');
          return;
        }
        logoVariants = await Promise.all([
          createLogoVariant(file, 512, 512, 'organization-logo-square.png'),
          createLogoVariant(file, 1200, 400, 'organization-logo-wide.png'),
        ]);
      } catch (error) {
        setUploadError(error.message);
        return;
      }
    }
    setUploadError('');
    setUploading(kind);
    if (kind === 'logo') setLocalPreview(URL.createObjectURL(file));
    try {
      if (kind === 'logo') {
        const [originalResult, squareResult, wideResult] = await Promise.all([
          uploadImageFile(file, 'organizations'),
          uploadImageFile(logoVariants[0], 'organizations'),
          uploadImageFile(logoVariants[1], 'organizations'),
        ]);
        const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const base = rawBase.replace(/\/+$/, '');
        const apiBase = base.endsWith('/sms') ? base : `${base}/sms`;
        const getUrl = (result) => `${apiBase}/storage/file?key=${encodeURIComponent(result.key)}`;
        setSection('profile', 'logoUrl', getUrl(originalResult));
        setSection('profile', 'logoSquareUrl', getUrl(squareResult));
        setSection('profile', 'logoWideUrl', getUrl(wideResult));
        setLocalPreview('');
        return;
      }
      const result = await uploadImageFile(file, kind === 'tax' ? 'organization-tax' : 'organizations');
      const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const base = rawBase.replace(/\/+$/, '');
      const apiBase = base.endsWith('/sms') ? base : `${base}/sms`;
      const url = `${apiBase}/storage/file?key=${encodeURIComponent(result.key)}`;
      if (kind === 'tax') setSection('taxProfile', 'documentUrl', url);
      else setSection('profile', kind === 'logo' ? 'logoUrl' : 'faviconUrl', url);
    } catch (error) {
      console.error(`${kind} upload failed:`, error);
      setUploadError(error.message || 'Upload failed. Your existing file has been kept.');
      if (kind === 'logo') setLocalPreview('');
    } finally {
      setUploading('');
    }
  };

  const currencySymbol = getCurrencySymbol(form.settings.currencyCode);
  const activeSlugAvailability = form.profile.slug === organisation.slug
    ? { available: true, suggestions: [] }
    : slugAvailability?.slug === form.profile.slug ? slugAvailability : null;
  const primaryColorWarning = getContrastWarning(form.profile.brandPrimaryColor);
  const dayPreview = useMemo(() => form.businessHours.map((hour) => ({
    ...hour,
    label: WEEKDAYS.find((day) => day.value === hour.dayOfWeek)?.label.slice(0, 1),
  })), [form.businessHours]);
  const orderedHolidays = useMemo(() => [...form.holidays].sort((a, b) => a.holidayDate.localeCompare(b.holidayDate)), [form.holidays]);

  const validateAndSave = async (confirmCurrency = false) => {
    if (!form.profile.name.trim() || form.profile.name.trim().length < 2) {
      setStep(0);
      throw new Error('Business name must contain at least 2 characters.');
    }
    if (!form.profile.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.profile.slug)) {
      setStep(0);
      throw new Error('Portal URL must use lowercase letters, numbers, and hyphens only.');
    }
    if (activeSlugAvailability?.available === false) {
      setStep(0);
      throw new Error('Choose an available portal URL before saving.');
    }
    const primary = form.contacts.find((contact) => contact.contactType === 'primary');
    if (form.profile.status === 'active' && (!primary?.phoneNumber?.trim() || !primary?.email?.trim())) {
      setStep(1);
      throw new Error('A primary contact needs both an email and phone before the organization can be active.');
    }
    const registered = form.addresses.find((address) => address.addressType === 'registered');
    if (!registered?.addressLine1?.trim() || !registered.city?.trim() || !registered.state?.trim() || !registered.postalCode?.trim() || !registered.country) {
      setStep(2);
      throw new Error('Complete the required registered office address fields.');
    }
    if (
      (registered.country === 'India' && !/^\d{6}$/.test(registered.postalCode.trim())) ||
      (registered.country === 'United States' && !/^\d{5}(?:-\d{4})?$/.test(registered.postalCode.trim()))
    ) {
      setStep(2);
      throw new Error(`Enter a valid postal code for ${registered.country}.`);
    }
    const taxNumber = form.taxProfile.taxIdentifierNumber.trim();
    if (taxNumber && form.taxProfile.taxIdentifierType === 'gstin' && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(taxNumber)) {
      setStep(3);
      throw new Error('GSTIN must use the valid 15-character format.');
    }
    if (taxNumber && !form.taxProfile.isTaxExempt && !form.taxProfile.documentUrl) {
      setStep(3);
      throw new Error('Upload a registration document before submitting the tax profile.');
    }
    if (form.settings.currencyCode !== originalCurrency && !confirmCurrency) {
      setCurrencyConfirmation(form.settings.currencyCode);
      return;
    }

    const payload = {
      profile: {
        ...form.profile,
        name: form.profile.name.trim(),
        slug: form.profile.slug.trim().toLowerCase(),
        legalName: form.profile.legalName.trim() || null,
        logoUrl: form.profile.logoUrl || null,
        logoSquareUrl: form.profile.logoSquareUrl || null,
        logoWideUrl: form.profile.logoWideUrl || null,
        faviconUrl: form.profile.faviconUrl || null,
        brandPrimaryColor: form.profile.brandPrimaryColor || null,
        brandSecondaryColor: form.profile.brandSecondaryColor || null,
        onboardingStep: form.profile.status === 'active' ? 7 : step + 1,
      },
      contacts: form.contacts.map((contact) => ({
        ...contact,
        contactName: contact.contactName.trim() || null,
        email: contact.email.trim().toLowerCase() || null,
        phoneCountryCode: contact.phoneCountryCode || null,
        phoneNumber: normalizePhone(contact) || null,
      })),
      addresses: form.addresses.map((address) => ({
        ...address,
        addressLine1: address.addressLine1.trim() || null,
        addressLine2: address.addressLine2.trim() || null,
        landmark: address.landmark.trim() || null,
        city: address.city.trim() || null,
        state: address.state.trim() || null,
        postalCode: address.postalCode.trim() || null,
        country: address.country || null,
      })),
      taxProfile: taxNumber ? {
        ...form.taxProfile,
        taxIdentifierNumber: taxNumber.toUpperCase(),
        registeredBusinessName: form.taxProfile.registeredBusinessName.trim() || form.profile.name.trim(),
        taxRegistrationDate: form.taxProfile.taxRegistrationDate || null,
        documentUrl: form.taxProfile.documentUrl || null,
      } : null,
      settings: form.settings,
      businessHours: form.businessHours,
      holidays: form.holidays.map((holiday) => ({
        ...holiday,
        branchId: holiday.branchId || null,
        description: holiday.description.trim() || null,
      })),
    };
    await onSave(payload);
    setCurrencyConfirmation('');
  };

  const onSaveClick = async (confirmCurrency = false) => {
    setUploadError('');
    try {
      await validateAndSave(confirmCurrency);
    } catch (error) {
      console.error('Organization setup validation failed:', error);
      // Local validation messages are surfaced in the form's alert.
      setUploadError(error.message);
    }
  };

  const addContact = () => {
    setForm((current) => ({
      ...current,
      contacts: [...current.contacts, {
        contactType: 'support',
        contactName: '',
        phoneCountryCode: '+91',
        phoneNumber: '',
        email: '',
        emailVerified: false,
        isDefaultPublic: false,
        sameAsPrimary: false,
      }],
    }));
  };

  const addHoliday = () => {
    if (!holidayDraft.name.trim() || !holidayDraft.holidayDate) {
      setUploadError('Enter a holiday name and date before adding it.');
      return;
    }
    setUploadError('');
    setForm((current) => ({
      ...current,
      holidays: [...current.holidays, { ...holidayDraft, status: 'active', id: undefined }],
    }));
    setHolidayDraft({ name: '', description: '', holidayDate: '', isRecurringAnnually: false, branchId: '' });
  };

  const copyMonday = () => {
    const monday = form.businessHours.find((hour) => hour.dayOfWeek === 1);
    if (monday) setForm((current) => ({
      ...current,
      businessHours: current.businessHours.map((hour) => ({ ...monday, dayOfWeek: hour.dayOfWeek })),
    }));
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Business identity</h2>
        <p className="mt-1 text-sm text-slate-500">Set the name, portal identity, and brand customers will recognize.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Business name" required value={form.profile.name} onChange={handleNameChange} placeholder="e.g. Atelier Salon" />
        <Field label="Legal / registered name" value={form.profile.legalName} onChange={(value) => setSection('profile', 'legalName', value)} placeholder="Registered company name" />
      </div>
      <div>
        <Field
          label="Customer portal URL slug"
          required
          value={form.profile.slug}
          onChange={(value) => {
            setSlugEdited(true);
            setSection('profile', 'slug', value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-'));
          }}
          disabled={Boolean(organisation.slugChangedAt)}
          helperText={organisation.slugChangedAt ? 'The portal URL has already been changed once.' : `Portal preview: /book/${form.profile.slug || 'your-business'}`}
        />
        {activeSlugAvailability?.available && form.profile.slug !== organisation.slug && <p className="mt-1 text-xs font-semibold text-emerald-600">Portal URL is available.</p>}
        {activeSlugAvailability?.available === false && (
          <p className="mt-1 text-xs font-semibold text-rose-600">
            This URL is already in use.
            {activeSlugAvailability.suggestions?.map((slug) => (
              <button key={slug} type="button" onClick={() => { setSlugEdited(true); setSection('profile', 'slug', slug); }} className="ml-2 underline">{slug}</button>
            ))}
          </p>
        )}
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Business type</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BUSINESS_TYPES.map((type) => (
            <StateCard key={type.value} title={type.label} description={type.detail} icon={type.icon} selected={form.profile.businessType === type.value} onClick={() => setSection('profile', 'businessType', type.value)} />
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white"><ImagePlus className="h-4 w-4 text-primary-600" />Business logo</div>
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
            {localPreview || assetUrl(form.profile.logoUrl) ? (
              <img src={localPreview || assetUrl(form.profile.logoUrl)} alt="Business logo preview" className="h-20 w-20 rounded-xl border border-slate-200 bg-white object-cover" />
            ) : <Upload className="h-6 w-6 text-slate-400" />}
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{uploading === 'logo' ? 'Uploading logo...' : 'Click to upload JPG, PNG, or SVG'}</span>
            <span className="text-[11px] text-slate-500">Square and wide previews • Up to 5 MB</span>
            <input type="file" accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml" className="sr-only" onChange={(event) => handleUpload(event, 'logo')} disabled={Boolean(uploading)} />
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="flex h-16 items-center justify-center rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
              {(localPreview || form.profile.logoSquareUrl || form.profile.logoUrl) ? <img src={localPreview || assetUrl(form.profile.logoSquareUrl || form.profile.logoUrl)} alt="Square logo" className="h-10 w-10 rounded object-cover" /> : <span className="text-[10px] text-slate-400">Square preview</span>}
            </div>
            <div className="flex h-16 items-center justify-center rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
              {(localPreview || form.profile.logoWideUrl || form.profile.logoUrl) ? <img src={localPreview || assetUrl(form.profile.logoWideUrl || form.profile.logoUrl)} alt="Wide logo" className="h-10 w-full rounded object-cover" /> : <span className="text-[10px] text-slate-400">Wide preview</span>}
            </div>
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white"><ImagePlus className="h-4 w-4 text-primary-600" />Brand colors</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Primary color', 'brandPrimaryColor'],
              ['Secondary color', 'brandSecondaryColor'],
            ].map(([label, key]) => (
              <label key={key} className="flex flex-col gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {label}
                <span className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-800">
                  <input type="color" value={form.profile[key]} onChange={(event) => setSection('profile', key, event.target.value.toUpperCase())} className="h-8 w-9 cursor-pointer border-0 bg-transparent p-0" />
                  <input value={form.profile[key]} onChange={(event) => setSection('profile', key, event.target.value)} maxLength={7} className="w-full bg-transparent font-mono text-xs outline-none" />
                </span>
              </label>
            ))}
          </div>
          {primaryColorWarning && <p className="flex items-center gap-1 text-xs text-amber-600"><AlertCircle className="h-3.5 w-3.5" />Primary color may not meet WCAG AA contrast on light or dark text.</p>}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: form.profile.brandPrimaryColor }}>
              <span className="h-5 w-5 rounded-full bg-white/25" />{form.profile.name || 'Your business'}
              <span className="ml-auto text-[10px]">Portal header preview</span>
            </div>
            <div className="flex items-center justify-between p-3 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Invoice total</span>
              <strong style={{ color: form.profile.brandPrimaryColor }}>{currencySymbol}125.00</strong>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Portal favicon</p>
          <div className="flex items-center gap-3">
            {form.profile.faviconUrl && <img src={assetUrl(form.profile.faviconUrl)} alt="Favicon preview" className="h-8 w-8 rounded border object-contain" />}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700">
              <Upload className="h-3.5 w-3.5" />{uploading === 'favicon' ? 'Uploading...' : 'Upload favicon'}
              <input type="file" accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml" className="sr-only" onChange={(event) => handleUpload(event, 'favicon')} />
            </label>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Organization ID & creation date</p>
          <p className="font-mono text-xs text-slate-600 dark:text-slate-300">{organisation.id}</p>
          <p className="mt-1 text-xs text-slate-500">{new Date(organisation.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Organization status</p>
        {isSuperAdmin ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { value: 'onboarding', title: 'Onboarding', description: 'Setup in progress', icon: Clock3 },
            { value: 'active', title: 'Active', description: 'Available for operations', icon: Check },
            { value: 'suspended', title: 'Suspended', description: 'Temporarily unavailable', icon: AlertCircle },
            { value: 'inactive', title: 'Inactive', description: 'No longer operating', icon: X },
          ].map((status) => (
            <StateCard key={status.value} title={status.title} description={status.description} icon={status.icon} selected={form.profile.status === status.value} onClick={() => setSection('profile', 'status', status.value)} />
          ))}
        </div> : <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold capitalize text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">{form.profile.status.replace('_', ' ')} — managed by your Super Admin</p>}
      </div>
    </div>
  );

  const renderContacts = () => {
    const primary = form.contacts.find((item) => item.contactType === 'primary') || {};
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Business contacts</h2><p className="mt-1 text-sm text-slate-500">Keep support, billing, and emergency details close to your primary contact.</p></div>
          <button type="button" onClick={addContact} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700"><Plus className="h-4 w-4" />Add contact</button>
        </div>
        {form.contacts.map((contact, index) => {
          const savedEmail = organisation.organizationContacts?.find(
            (savedContact) => savedContact.id === contact.id,
          )?.email;
          const emailIsSaved = Boolean(
            savedEmail &&
            savedEmail.toLowerCase() === contact.email.trim().toLowerCase(),
          );
          return (
          <section key={contact.id || `contact-${index}`} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Dropdown label="Contact type" value={contact.contactType} onChange={(value) => setContact(index, 'contactType', value)} options={CONTACT_TYPES} searchable={false} className="w-44" />
                {contact.emailVerified ? <span className="mt-5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><BadgeCheck className="h-3 w-3" />Email verified</span> : <span className="mt-5 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">Email unverified</span>}
              </div>
              {contact.contactType !== 'primary' && (
                <button type="button" aria-label="Remove contact" onClick={() => setForm((current) => ({ ...current, contacts: current.contacts.filter((_, contactIndex) => contactIndex !== index) }))} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Contact person" value={contact.contactName} onChange={(value) => setContact(index, 'contactName', value)} placeholder="Full name" />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone number</span>
                  <div className="flex gap-2">
                  <Dropdown label="Country code" value={contact.phoneCountryCode} onChange={(value) => setContact(index, 'phoneCountryCode', value)} options={PHONE_CODES} className="w-36" disabled={contact.sameAsPrimary} />
                    <input type="tel" disabled={contact.sameAsPrimary} value={contact.phoneNumber} onChange={(event) => setContact(index, 'phoneNumber', event.target.value)} placeholder="Phone number" className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-900" />
                </div>
              </div>
              <div>
                <Field disabled={contact.sameAsPrimary} label="Email address" type="email" value={contact.email} onChange={(value) => setContact(index, 'email', value)} placeholder="name@business.com" />
                {!contact.emailVerified && (
                  <div className="mt-2">
                    <button
                      type="button"
                      disabled={!contact.id || !emailIsSaved || !contact.email.trim() || Boolean(verificationSending[index])}
                      onClick={() => sendContactVerification(contact, index)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-primary-900/20"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {verificationSending[index] ? 'Sending...' : 'Send verification link'}
                    </button>
                    {!emailIsSaved && <p className="mt-1 text-[11px] text-slate-500">Save this contact email before requesting verification.</p>}
                    {verificationMessages[index] && <p role="status" className="mt-1 text-[11px] text-emerald-700">{verificationMessages[index]}</p>}
                  </div>
                )}
              </div>
              <div className="flex items-end rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <Toggle checked={contact.isDefaultPublic} onChange={(value) => setContact(index, 'isDefaultPublic', value)} label="Show as public contact" description="Display this contact on the customer portal." />
              </div>
              {contact.contactType !== 'primary' && (
                <div className="md:col-span-2">
                  <Toggle
                    checked={contact.sameAsPrimary}
                    onChange={(checked) => {
                      setContact(index, 'sameAsPrimary', checked);
                      if (checked) {
                        setContact(index, 'phoneCountryCode', primary.phoneCountryCode || '+91');
                        setContact(index, 'phoneNumber', primary.phoneNumber || '');
                        setContact(index, 'email', primary.email || '');
                      }
                    }}
                    label="Same as primary"
                    description="Copy primary phone and email into this contact."
                  />
                </div>
              )}
            </div>
          </section>
          );
        })}
        <p className="rounded-xl bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">
          Verification links are sent to the saved contact email. Links expire after 30 minutes and can only be used once.
        </p>
      </div>
    );
  };

  const renderAddressFields = (address, index, isBilling = false) => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="relative md:col-span-2">
        <Field
          label="Find address with Google Places"
          value={addressSearch[index] || ''}
          onChange={(value) => handleAddressSearch(index, value)}
          placeholder="Start typing a street, business, or location"
          autoComplete="off"
          disabled={isBilling && form.addresses[1].sameAsRegistered}
          helperText="Choose a suggestion to fill the address fields, or enter the address manually."
        />
        {addressSearchLoading[index] && (
          <p className="mt-1 text-xs text-slate-500">Searching Google Places...</p>
        )}
        {addressSearchErrors[index] && (
          <p role="alert" className="mt-1 text-xs font-medium text-rose-600">{addressSearchErrors[index]}</p>
        )}
        {addressSuggestions[index]?.length > 0 && (
          <ul role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            {addressSuggestions[index].map((suggestion) => (
              <li key={suggestion.placeId} role="option" aria-selected="false">
                <button
                  type="button"
                  disabled={Boolean(addressSelectionLoading[index])}
                  onClick={() => selectAddressSuggestion(index, suggestion)}
                  className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-50 disabled:opacity-60 dark:hover:bg-slate-800"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{suggestion.primaryText}</span>
                    {suggestion.secondaryText && <span className="block truncate text-xs text-slate-500">{suggestion.secondaryText}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="md:col-span-2"><Field label="Address line 1" required={!isBilling} value={address.addressLine1} onChange={(value) => setAddress(index, 'addressLine1', value)} placeholder="Street address" /></div>
      <Field label="Address line 2" value={address.addressLine2} onChange={(value) => setAddress(index, 'addressLine2', value)} placeholder="Building, suite, unit" />
      <Field label="Landmark" value={address.landmark} onChange={(value) => setAddress(index, 'landmark', value)} placeholder="Nearby landmark" />
      <Field label="City" required={!isBilling} value={address.city} onChange={(value) => setAddress(index, 'city', value)} />
      <div>
        <Dropdown
          label="Country / region"
          value={address.country}
          onChange={(value) => {
            setAddress(index, 'country', value);
            setAddress(index, 'state', '');
            setAddress(index, 'latitude', null);
            setAddress(index, 'longitude', null);
            if (addressSearch[index]?.trim().length >= 3) {
              handleAddressSearch(index, addressSearch[index], value);
            }
          }}
          options={COUNTRIES}
          placeholder="Choose country"
        />
      </div>
      <div>
        <Dropdown
          label="State / province"
          value={address.state}
          onChange={(value) => setAddress(index, 'state', value)}
          options={(COUNTRY_STATES[address.country] || []).concat(address.state && !(COUNTRY_STATES[address.country] || []).includes(address.state) ? [address.state] : []).map((value) => ({ value, label: value }))}
          placeholder="Choose state or province"
          searchable
        />
      </div>
      <Field label="Postal code" required={!isBilling} value={address.postalCode} onChange={(value) => setAddress(index, 'postalCode', value)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude (optional)" value={address.latitude ?? ''} onChange={(value) => setAddress(index, 'latitude', value === '' ? null : Number(value))} type="number" step="0.0000001" />
        <Field label="Longitude (optional)" value={address.longitude ?? ''} onChange={(value) => setAddress(index, 'longitude', value === '' ? null : Number(value))} type="number" step="0.0000001" />
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Organization addresses</h2><p className="mt-1 text-sm text-slate-500">Registered and correspondence addresses are separate from branch locations.</p></div>
      <section className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Registered office</h3><p className="text-xs text-slate-500">Printed on tax invoices and legal documents.</p></div>
        {renderAddressFields(form.addresses[0], 0)}
      </section>
      <section className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Billing / correspondence</h3><p className="text-xs text-slate-500">Optional mailing address for invoices and correspondence.</p></div>
        <Toggle
          checked={form.addresses[1].sameAsRegistered}
          onChange={(checked) => {
            if (checked) {
              setForm((current) => ({
                ...current,
                addresses: [current.addresses[0], { ...current.addresses[0], addressType: 'billing', sameAsRegistered: true }],
              }));
            } else {
              setAddress(1, 'sameAsRegistered', false);
            }
          }}
          label="Same as registered office"
        />
        {!form.addresses[1].sameAsRegistered && renderAddressFields(form.addresses[1], 1, true)}
        {form.addresses[1].sameAsRegistered && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800">Billing address matches the registered office.</p>}
      </section>
      <p className="rounded-xl bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">Google Places suggestions fill the structured fields. Review every suggested field before saving; manual address entry remains available.</p>
    </div>
  );

  const renderTax = () => (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Tax information & registration</h2><p className="mt-1 text-sm text-slate-500">Add the business tax identity shown on compliant invoices.</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Dropdown label="Tax identifier type" value={form.taxProfile.taxIdentifierType} onChange={(value) => setSection('taxProfile', 'taxIdentifierType', value)} options={[{ value: 'gstin', label: 'GSTIN' }, { value: 'vat', label: 'VAT' }, { value: 'ein', label: 'EIN' }, { value: 'tin', label: 'TIN' }, { value: 'pan', label: 'PAN' }, { value: 'other', label: 'Other' }]} />
        <Field label="Tax identifier number" value={form.taxProfile.taxIdentifierNumber} onChange={(value) => setSection('taxProfile', 'taxIdentifierNumber', value.toUpperCase())} placeholder={form.taxProfile.taxIdentifierType === 'gstin' ? '15-character GSTIN' : 'Tax registration number'} helperText={form.taxProfile.taxIdentifierType === 'gstin' ? 'GSTIN is checked against the 15-character format.' : 'Format checks vary by tax authority.'} />
        <Field label="Registered business name" value={form.taxProfile.registeredBusinessName} onChange={(value) => setSection('taxProfile', 'registeredBusinessName', value)} placeholder={form.profile.legalName || form.profile.name} />
        <DatePicker label="Tax registration date" value={form.taxProfile.taxRegistrationDate} onChange={(value) => setSection('taxProfile', 'taxRegistrationDate', value)} />
      </div>
      <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <Toggle checked={form.taxProfile.isTaxExempt} onChange={(value) => setSection('taxProfile', 'isTaxExempt', value)} label="Tax exempt" description="Tax lines should be suppressed for this business where applicable." />
      </div>
      {form.taxProfile.taxIdentifierNumber && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Registration certificate <span className="text-rose-500">*</span></p>
            {form.taxProfile.documentUrl && (
              <a href={assetUrl(form.taxProfile.documentUrl)} target="_blank" rel="noreferrer" className="mb-3 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-primary-700 dark:bg-slate-800 dark:text-primary-300">
                <ShieldCheck className="h-4 w-4" />View uploaded document
              </a>
            )}
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-3 text-xs font-semibold dark:border-slate-600">
              <Upload className="h-4 w-4" />{uploading === 'tax' ? 'Uploading...' : 'Upload PDF, JPG, or PNG (max 10 MB)'}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="sr-only" onChange={(event) => handleUpload(event, 'tax')} />
            </label>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${
              form.taxProfile.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                : form.taxProfile.verificationStatus === 'rejected' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
            }`}>{form.taxProfile.verificationStatus}</span>
            <p className="mt-2 text-xs text-slate-500">{form.taxProfile.verificationNotes || 'Verification status is assigned after manual or authority validation. A valid format alone is not approval.'}</p>
            {isSuperAdmin && <div className="mt-4 space-y-3">
              <Dropdown
                label="Manual verification decision"
                value={form.taxProfile.verificationStatus}
                onChange={(value) => setSection('taxProfile', 'verificationStatus', value)}
                options={[
                  { value: 'pending', label: 'Pending review' },
                  { value: 'verified', label: 'Verified' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
                searchable={false}
              />
              <TextareaField
                label="Reviewer notes"
                value={form.taxProfile.verificationNotes}
                onChange={(value) => setSection('taxProfile', 'verificationNotes', value)}
                placeholder="Record why the certificate was approved or rejected."
                rows={2}
              />
            </div>}
          </div>
        </div>
      )}
      <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">Submitting a tax ID and certificate marks it pending. This screen does not automatically approve a tax registration.</p>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Currency & regional settings</h2><p className="mt-1 text-sm text-slate-500">Defaults used for pricing, dates, time, and reports across the organization.</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Dropdown label="Default currency" value={form.settings.currencyCode} onChange={(value) => setSection('settings', 'currencyCode', value)} options={CURRENCIES} />
        <div className="flex items-end rounded-xl bg-primary-50 p-3 dark:bg-primary-500/10">
          <p className="text-xs text-primary-800 dark:text-primary-200">Preview: <strong className="ml-1 text-base">{form.settings.currencySymbolPosition === 'prefix' ? `${currencySymbol} ` : ''}{(1234.5).toLocaleString(undefined, { minimumFractionDigits: Number(form.settings.currencyDecimalPlaces), maximumFractionDigits: Number(form.settings.currencyDecimalPlaces) })}{form.settings.currencySymbolPosition === 'suffix' ? ` ${currencySymbol}` : ''}</strong></p>
        </div>
        <Dropdown label="Currency symbol position" value={form.settings.currencySymbolPosition} onChange={(value) => setSection('settings', 'currencySymbolPosition', value)} options={[{ value: 'prefix', label: 'Before amount (₹100)' }, { value: 'suffix', label: 'After amount (100 ₹)' }]} searchable={false} />
        <Dropdown label="Decimal places" value={String(form.settings.currencyDecimalPlaces)} onChange={(value) => setSection('settings', 'currencyDecimalPlaces', Number(value))} options={[0, 1, 2, 3].map((value) => ({ value: String(value), label: `${value} decimal ${value === 1 ? 'place' : 'places'}` }))} searchable={false} />
        <Dropdown label="Timezone" value={form.settings.timezone} onChange={(value) => setSection('settings', 'timezone', value)} options={TIMEZONES} searchPlaceholder="Search IANA timezones..." />
        <Dropdown label="Default language" value={form.settings.languageCode} onChange={(value) => setSection('settings', 'languageCode', value)} options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }, { value: 'ar', label: 'Arabic' }, { value: 'fr', label: 'French' }, { value: 'es', label: 'Spanish' }]} />
        <Dropdown label="Date format" value={form.settings.dateFormat} onChange={(value) => setSection('settings', 'dateFormat', value)} options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map((value) => ({ value, label: value }))} searchable={false} />
        <Dropdown label="Time format" value={form.settings.timeFormat} onChange={(value) => setSection('settings', 'timeFormat', value)} options={[{ value: 'h12', label: '12-hour (1:30 PM)' }, { value: 'h24', label: '24-hour (13:30)' }]} searchable={false} />
        <Dropdown label="First day of week" value={String(form.settings.firstDayOfWeek)} onChange={(value) => setSection('settings', 'firstDayOfWeek', Number(value))} options={[{ value: '0', label: 'Sunday' }, { value: '1', label: 'Monday' }]} searchable={false} />
        <Dropdown label="Fiscal year starts" value={String(form.settings.fiscalYearStartMonth)} onChange={(value) => setSection('settings', 'fiscalYearStartMonth', Number(value))} options={MONTHS} />
      </div>
      {form.settings.currencyCode !== originalCurrency && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-100">
          Changing currency does not convert existing transactions. Historical amounts must remain associated with their original currency.
        </div>
      )}
    </div>
  );

  const renderHours = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Weekly business hours</h2><p className="mt-1 text-sm text-slate-500">Organization defaults are inherited by branches unless overridden.</p></div>
        <button type="button" onClick={copyMonday} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Copy Monday to all days</button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
        {WEEKDAYS.map((day, index) => {
          const hour = form.businessHours.find((item) => item.dayOfWeek === day.value);
          return (
            <div key={day.value} className={`grid gap-3 p-4 md:grid-cols-[110px_100px_1fr] md:items-center ${index ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{day.label}</span>
              <button type="button" role="switch" aria-checked={hour.isOpen} onClick={() => setHour(day.value, 'isOpen', !hour.isOpen)} className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${hour.isOpen ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                {hour.isOpen ? 'Open' : 'Closed'}
              </button>
              {hour.isOpen ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TimePicker label="Opens" value={hour.openTime} onChange={(value) => setHour(day.value, 'openTime', value)} step={15} timeFormat="24h" />
                    <TimePicker label="Closes" value={hour.closeTime} onChange={(value) => setHour(day.value, 'closeTime', value)} step={15} timeFormat="24h" />
                  </div>
                  <Toggle checked={hour.spansMidnight} onChange={(value) => setHour(day.value, 'spansMidnight', value)} label="Spans midnight" />
                  <details className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                    <summary className="cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300">Add a break window</summary>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <TimePicker label="Break starts" value={hour.breakStartTime} onChange={(value) => setHour(day.value, 'breakStartTime', value)} step={15} timeFormat="24h" />
                      <TimePicker label="Break ends" value={hour.breakEndTime} onChange={(value) => setHour(day.value, 'breakEndTime', value)} step={15} timeFormat="24h" />
                    </div>
                  </details>
                </div>
              ) : <p className="text-xs text-slate-400 md:col-span-1">Closed all day</p>}
            </div>
          );
        })}
      </div>
      <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <p className="mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Weekly pattern preview</p>
        <div className="flex h-24 items-end gap-2">
          {dayPreview.map((day) => (
            <div key={day.dayOfWeek} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className={`w-full rounded-t-md ${day.isOpen ? 'bg-primary-500/80' : 'bg-slate-100 dark:bg-slate-800'}`} style={{ height: day.isOpen ? `${Math.min(90, Math.max(16, ((parseInt(day.closeTime) || 18) - (parseInt(day.openTime) || 9)) * 5))}%` : '8%' }} />
              <span className="text-[10px] text-slate-500">{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHolidays = () => (
    <div className="space-y-5">
      <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Holiday calendar</h2><p className="mt-1 text-sm text-slate-500">Add closures that should block schedules and booking availability.</p></div>
      <section className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add a holiday</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Holiday name" value={holidayDraft.name} onChange={(value) => setHolidayDraft((draft) => ({ ...draft, name: value }))} placeholder="e.g. New Year's Day" />
          <DatePicker label="Date" value={holidayDraft.holidayDate} onChange={(value) => setHolidayDraft((draft) => ({ ...draft, holidayDate: value }))} />
          <Dropdown label="Applies to" value={holidayDraft.branchId} onChange={(value) => setHolidayDraft((draft) => ({ ...draft, branchId: value }))} options={[{ value: '', label: 'All branches' }, ...(organisation.branches || []).map((branch) => ({ value: branch.id, label: branch.name }))]} />
          <TextareaField label="Description (optional)" value={holidayDraft.description} onChange={(value) => setHolidayDraft((draft) => ({ ...draft, description: value }))} placeholder="Additional notes" rows={2} />
          <div className="flex items-center rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <Toggle checked={holidayDraft.isRecurringAnnually} onChange={(value) => setHolidayDraft((draft) => ({ ...draft, isRecurringAnnually: value }))} label="Repeat every year" description="Useful for fixed-date public holidays." />
          </div>
          <div className="flex items-end"><button type="button" onClick={addHoliday} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-600 px-4 text-xs font-semibold text-white hover:bg-primary-700"><Plus className="h-4 w-4" />Add holiday</button></div>
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Organization holidays</h3><span className="text-xs text-slate-500">{form.holidays.filter((holiday) => holiday.status === 'active').length} active</span>
        </div>
        {(() => {
          const today = new Date().toISOString().slice(0, 10);
          const upcoming = orderedHolidays.filter((holiday) => holiday.status === 'active' && holiday.holidayDate >= today);
          const history = orderedHolidays.filter((holiday) => holiday.status !== 'active' || holiday.holidayDate < today);
          const renderHolidayRow = (holiday, index, isHistory = false) => (
            <div key={holiday.id || `${holiday.holidayDate}-${holiday.name}-${index}`} className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${index ? 'border-t border-slate-100 dark:border-slate-800' : ''} ${isHistory ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"><span className="text-[9px] font-bold uppercase">{new Date(`${holiday.holidayDate}T00:00:00`).toLocaleString(undefined, { month: 'short' })}</span><span className="text-sm font-bold">{new Date(`${holiday.holidayDate}T00:00:00`).getDate()}</span></span>
                <div><p className="text-sm font-semibold text-slate-900 dark:text-white">{holiday.name} {holiday.isRecurringAnnually && <span className="ml-1 text-primary-600">↻</span>}</p><p className="text-xs text-slate-500">{holiday.description || (holiday.branchId ? 'Specific branch' : 'All branches')} • {isHistory ? 'History' : 'Upcoming'}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${holiday.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{holiday.status}</span>
                {holiday.status === 'active' && <button type="button" aria-label={`Cancel ${holiday.name}`} onClick={() => setForm((current) => ({ ...current, holidays: current.holidays.map((item) => item === holiday ? { ...item, status: 'cancelled' } : item) }))} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"><X className="h-4 w-4" /></button>}
              </div>
            </div>
          );
          if (!orderedHolidays.length) return <p className="p-8 text-center text-sm text-slate-400">No holidays have been added.</p>;
          return (
            <>
              {upcoming.length ? upcoming.map((holiday, index) => renderHolidayRow(holiday, index)) : <p className="p-5 text-center text-sm text-slate-400">No upcoming holidays.</p>}
              {history.length > 0 && (
                <details className="border-t border-slate-100 dark:border-slate-800">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-slate-500">History ({history.length})</summary>
                  {history.map((holiday, index) => renderHolidayRow(holiday, index, true))}
                </details>
              )}
            </>
          );
        })()}
      </section>
    </div>
  );

  const currentStep = STEPS[step];
  const renderers = [renderProfile, renderContacts, renderAddresses, renderTax, renderSettings, renderHours, renderHolidays];

  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button key={item.id} type="button" onClick={() => setStep(index)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
              step === index ? 'border-primary-500 bg-primary-50 text-primary-800 dark:bg-primary-500/10 dark:text-primary-200'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
            }`}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/80 text-xs font-bold dark:bg-slate-800">{index + 1}</span>
              <span className="min-w-0"><Icon className="mr-1 inline h-3.5 w-3.5" /><span className="text-[11px] font-semibold">{item.label}</span></span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-600">Setup task {step + 1} of {STEPS.length}</p><h1 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{currentStep.label}</h1></div>
          <span className="text-xs font-semibold text-slate-400">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
        </div>
        {renderers[step]()}
        {(serverError || uploadError) && (
          <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-500/10 dark:text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{serverError || uploadError}
            {uploadError && <button type="button" aria-label="Dismiss error" onClick={() => setUploadError('')} className="ml-auto"><X className="h-4 w-4" /></button>}
          </div>
        )}
        {uploadError && (uploading || uploadError.includes('Choose')) && <div className="sr-only">{uploading}</div>}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button type="button" onClick={onCancel} className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"><ArrowLeft className="mr-1 inline h-4 w-4" />Back to organization</button>
          <div className="flex items-center gap-2">
            {step > 0 && <button type="button" onClick={() => setStep((current) => current - 1)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold dark:border-slate-700">Previous</button>}
            {step < STEPS.length - 1 && <button type="button" onClick={() => setStep((current) => current + 1)} className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"><ArrowRight className="mr-1 inline h-4 w-4" />Next section</button>}
            <button type="button" disabled={saving || Boolean(uploading)} onClick={() => onSaveClick(false)} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save setup'}</button>
          </div>
        </div>
      </div>

      {currencyConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="currency-confirm-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3"><div><h2 id="currency-confirm-title" className="text-lg font-bold text-slate-900 dark:text-white">Confirm currency change</h2><p className="mt-2 text-sm text-slate-500">Historical transactions will not be converted. Type <strong className="text-slate-800 dark:text-white">{currencyConfirmation}</strong> to confirm.</p></div><button type="button" aria-label="Close confirmation" onClick={() => setCurrencyConfirmation('')}><X className="h-5 w-5 text-slate-400" /></button></div>
            <input value={currencyConfirmation} onChange={(event) => setCurrencyConfirmation(event.target.value.toUpperCase())} className="mt-4 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm uppercase dark:border-slate-700 dark:bg-slate-800" placeholder="Currency code" />
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setCurrencyConfirmation('')} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-700">Cancel</button><button type="button" disabled={currencyConfirmation !== form.settings.currencyCode} onClick={() => onSaveClick(true)} className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Confirm and save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
