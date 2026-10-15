import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  Plus,
  X,
  Check,
} from 'lucide-react';

const SIDEBAR_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'profile', label: 'Business profile' },
  { id: 'contact', label: 'Contact' },
  { id: 'address', label: 'Address' },
  { id: 'tax', label: 'Tax information' },
  { id: 'regional', label: 'Regional settings' },
  { id: 'hours', label: 'Business hours' },
  { id: 'holidays', label: 'Holidays' },
];

const DEFAULT_HOLIDAYS_PRESET = [
  { id: 'h1', name: "New Year's Day", date: '1 Jan', repeats: 'Every year', appliesTo: 'All branches', status: 'Active' },
  { id: 'h2', name: 'Republic Day', date: '26 Jan', repeats: 'Every year', appliesTo: 'All branches', status: 'Active' },
  { id: 'h3', name: 'Independence Day', date: '15 Aug', repeats: 'Every year', appliesTo: 'All branches', status: 'Active' },
  { id: 'h4', name: 'Diwali', date: '8 Nov 2026', repeats: 'One-off', appliesTo: 'All branches', status: 'Active' },
  { id: 'h5', name: 'Renovation week', date: '3–4 Mar 2027', repeats: 'One-off', appliesTo: 'MG Road branch', status: 'Active' },
];

export default function SalonSuiteSettingsHub({
  formData,
  setSection,
  setAddress,
  setContact,
  setHour,
  copyMonday,
  onSave,
  saving,
  onSwitchToWizard,
  handleTaxDocUpload,
  uploadingTax,
  taxDocPreview,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [internalActiveTab, setInternalActiveTab] = useState(urlTab || 'overview');
  const activeTab = urlTab || internalActiveTab;

  const setActiveTab = (tabId) => {
    setInternalActiveTab(tabId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tabId);
      return next;
    });
  };

  const [showAddHolidayModal, setShowAddHolidayModal] = useState(false);
  const [holidaysList, setHolidaysList] = useState(DEFAULT_HOLIDAYS_PRESET);
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    repeats: 'Every year',
    appliesTo: 'All branches',
  });

  const taxFileInputRef = useRef(null);

  const businessName = formData?.profile?.name || 'Glow Beauty Studio';

  const formatLastSaved = () => {
    return 'today, 6:40 PM';
  };

  const handleAddHolidaySubmit = (e) => {
    e.preventDefault();
    if (!newHoliday.name.trim() || !newHoliday.date.trim()) return;

    setHolidaysList((prev) => [
      ...prev,
      {
        id: `h_${Date.now()}`,
        name: newHoliday.name.trim(),
        date: newHoliday.date.trim(),
        repeats: newHoliday.repeats,
        appliesTo: newHoliday.appliesTo,
        status: 'Active',
      },
    ]);

    setNewHoliday({
      name: '',
      date: '',
      repeats: 'Every year',
      appliesTo: 'All branches',
    });
    setShowAddHolidayModal(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-primary-500/20 selection:text-primary-500">
      {/* Top Bar matching design */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[var(--border-color)]">
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Salon Suite</h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSwitchToWizard}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            ← Back to setup wizard
          </button>
          <span className="text-sm font-semibold text-[var(--text-primary)] underline underline-offset-4 cursor-pointer hover:text-primary-500 transition-colors">
            {businessName}
          </span>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-6 flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 bg-[var(--bg-card)] rounded-3xl p-3 border border-[var(--border-color)] shadow-md">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-500 select-none">
            Settings Menu
          </div>
          <nav className="flex flex-col gap-1.5 mt-1">
            {SIDEBAR_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold text-left transition cursor-pointer ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20 shadow-xs'
                      : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 w-full bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-8 sm:p-10 shadow-md min-h-[580px]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-7 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                  Organization settings
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                  Everything about your business, in one place.
                </p>
              </div>

              {/* Overview Summary Table */}
              <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-[var(--bg-card)]">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)] text-xs font-semibold text-[var(--text-muted)]">
                      <th className="py-3 px-5 font-semibold">Section</th>
                      <th className="py-3 px-5 font-semibold">Summary</th>
                      <th className="py-3 px-5 font-semibold">Status</th>
                      <th className="py-3 px-5 font-semibold text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {/* Row 1: Business profile */}
                    <tr className="hover:bg-white/5 transition">
                      <td className="py-4 px-5 font-semibold text-[var(--text-primary)]">
                        Business profile
                      </td>
                      <td className="py-4 px-5 text-[var(--text-secondary)]">
                        {formData?.profile?.name || 'Glow Beauty Studio'}, logo, {formData?.profile?.businessType || 'Salon'}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('profile')}
                          className="text-sm font-semibold text-[var(--text-primary)] underline hover:text-primary-500 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {/* Row 2: Contact */}
                    <tr className="hover:bg-white/5 transition">
                      <td className="py-4 px-5 font-semibold text-[var(--text-primary)]">
                        Contact
                      </td>
                      <td className="py-4 px-5 text-[var(--text-secondary)]">
                        {formData?.contacts?.[0]?.phoneNumber ? `${formData.contacts[0].phoneCountryCode || '+91'} ${formData.contacts[0].phoneNumber}` : '+91 98765 43210'} and {formData?.contacts?.[0]?.email || 'hello@glowbeauty.in'}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('contact')}
                          className="text-sm font-semibold text-[var(--text-primary)] underline hover:text-primary-500 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {/* Row 3: Address */}
                    <tr className="hover:bg-white/5 transition">
                      <td className="py-4 px-5 font-semibold text-[var(--text-primary)]">
                        Address
                      </td>
                      <td className="py-4 px-5 text-[var(--text-secondary)]">
                        Registered office ({formData?.addresses?.[0]?.city || 'Bengaluru'})
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('address')}
                          className="text-sm font-semibold text-[var(--text-primary)] underline hover:text-primary-500 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {/* Row 4: Tax information */}
                    <tr className="hover:bg-white/5 transition">
                      <td className="py-4 px-5 font-semibold text-[var(--text-primary)]">
                        Tax information
                      </td>
                      <td className="py-4 px-5 text-[var(--text-secondary)]">
                        {formData?.taxProfile?.taxIdentifierNumber ? `${formData.taxProfile.taxIdentifierType?.toUpperCase() || 'GSTIN'} submitted` : 'GSTIN submitted'}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pending review
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('tax')}
                          className="text-sm font-semibold text-[var(--text-primary)] underline hover:text-primary-500 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {/* Row 5: Regional settings */}
                    <tr className="hover:bg-white/5 transition">
                      <td className="py-4 px-5 font-semibold text-[var(--text-primary)]">
                        Regional settings
                      </td>
                      <td className="py-4 px-5 text-[var(--text-secondary)]">
                        {formData?.settings?.currencyCode || 'INR'} · {formData?.settings?.timezone || 'Asia/Kolkata'}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('regional')}
                          className="text-sm font-semibold text-[var(--text-primary)] underline hover:text-primary-500 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {/* Row 6: Business hours */}
                    <tr className="hover:bg-white/5 transition">
                      <td className="py-4 px-5 font-semibold text-[var(--text-primary)]">
                        Business hours
                      </td>
                      <td className="py-4 px-5 text-[var(--text-secondary)]">
                        Mon–Sat, 9:00–19:00
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('hours')}
                          className="text-sm font-semibold text-[var(--text-primary)] underline hover:text-primary-500 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {/* Row 7: Holidays */}
                    <tr className="hover:bg-white/5 transition">
                      <td className="py-4 px-5 font-semibold text-[var(--text-primary)]">
                        Holidays
                      </td>
                      <td className="py-4 px-5 text-[var(--text-secondary)]">
                        {holidaysList.length} holidays
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('holidays')}
                          className="text-sm font-semibold text-[var(--text-primary)] underline hover:text-primary-500 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: TAX INFORMATION */}
          {activeTab === 'tax' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                  Tax information
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                  Printed on every tax invoice. Our team verifies it after you upload a certificate.
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Pending review
                  </span>
                </div>
              </div>

              {/* Tax ID Type & Tax Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Tax ID type
                  </label>
                  <div className="relative">
                    <select
                      value={formData?.taxProfile?.taxIdentifierType || 'gstin'}
                      onChange={(e) => setSection('taxProfile', 'taxIdentifierType', e.target.value)}
                      className="w-full h-12 px-4 pr-9 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 bg-[var(--bg-input)] appearance-none cursor-pointer transition"
                    >
                      <option value="gstin">GSTIN</option>
                      <option value="vat">VAT</option>
                      <option value="pan">PAN</option>
                      <option value="tin">TIN</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-4 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={formData?.taxProfile?.taxIdentifierNumber || '29ABCDE1234F1Z5'}
                    onChange={(e) => setSection('taxProfile', 'taxIdentifierNumber', e.target.value.toUpperCase())}
                    placeholder="29ABCDE1234F1Z5"
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 transition bg-[var(--bg-input)] uppercase font-mono placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              {/* Registered business name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Registered business name
                </label>
                <input
                  type="text"
                  value={formData?.taxProfile?.registeredBusinessName || 'Glow Beauty Studio Pvt Ltd'}
                  onChange={(e) => setSection('taxProfile', 'registeredBusinessName', e.target.value)}
                  placeholder="Glow Beauty Studio Pvt Ltd"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 transition bg-[var(--bg-input)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              {/* Registration date and Tax exempt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Registration date
                  </label>
                  <input
                    type="date"
                    value={formData?.taxProfile?.taxRegistrationDate || '2024-04-01'}
                    onChange={(e) => setSection('taxProfile', 'taxRegistrationDate', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] text-sm sm:text-[15px] focus:outline-none focus:border-primary-500 transition bg-[var(--bg-input)]"
                  />
                </div>

                <div className="pt-6">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() =>
                        setSection('taxProfile', 'isTaxExempt', !formData?.taxProfile?.isTaxExempt)
                      }
                      className={`w-5 h-5 rounded flex items-center justify-center transition border ${
                        formData?.taxProfile?.isTaxExempt
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'border-[var(--border-color)] bg-[var(--bg-input)]'
                      }`}
                    >
                      {formData?.taxProfile?.isTaxExempt && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">Tax exempt</span>
                  </label>
                </div>
              </div>

              {/* Registration certificate Upload Box */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Registration certificate
                </label>
                <div
                  onClick={() => taxFileInputRef.current?.click()}
                  className="border-2 border-dashed border-[var(--border-color)] hover:border-primary-500 rounded-2xl p-4 sm:p-5 flex items-center justify-between bg-[var(--bg-input)] cursor-pointer transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 flex items-center justify-center font-bold text-xs uppercase tracking-wider">
                      PDF
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {taxDocPreview || formData?.taxProfile?.documentUrl ? 'gst-certificate.pdf · 1.2 MB' : 'gst-certificate.pdf · 1.2 MB'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {uploadingTax ? 'Uploading file...' : 'PDF, JPG or PNG up to 10 MB'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[var(--text-primary)] underline hover:text-primary-500 transition-colors cursor-pointer"
                  >
                    Replace file
                  </button>
                  <input
                    ref={taxFileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleTaxDocUpload}
                  />
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  Last saved {formatLastSaved()}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(false)}
                  className="px-8 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: HOLIDAYS */}
          {activeTab === 'holidays' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                    Holidays
                  </h2>
                  <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                    Closed days block bookings and shifts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddHolidayModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  Add holiday
                </button>
              </div>

              {/* Holidays Table */}
              <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-[var(--bg-card)]">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)] text-xs font-semibold text-[var(--text-muted)]">
                      <th className="py-3 px-5 font-semibold">Name</th>
                      <th className="py-3 px-5 font-semibold">Date</th>
                      <th className="py-3 px-5 font-semibold">Repeats</th>
                      <th className="py-3 px-5 font-semibold">Applies to</th>
                      <th className="py-3 px-5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {holidaysList.map((holiday) => (
                      <tr key={holiday.id} className="hover:bg-white/5 transition">
                        <td className="py-4 px-5 font-semibold text-[var(--text-primary)]">
                          {holiday.name}
                        </td>
                        <td className="py-4 px-5 text-[var(--text-secondary)]">
                          {holiday.date}
                        </td>
                        <td className="py-4 px-5 text-[var(--text-secondary)]">
                          {holiday.repeats}
                        </td>
                        <td className="py-4 px-5 text-[var(--text-secondary)]">
                          {holiday.appliesTo}
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {holiday.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Holiday Modal */}
              {showAddHolidayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                  <div className="w-full max-w-md bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border-color)] text-[var(--text-primary)]">
                    <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">Add a holiday</h3>
                      <button
                        type="button"
                        onClick={() => setShowAddHolidayModal(false)}
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddHolidaySubmit} className="space-y-4 pt-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[var(--text-primary)]">
                          Holiday name
                        </label>
                        <input
                          type="text"
                          required
                          value={newHoliday.name}
                          onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                          placeholder="e.g. Eid al-Fitr"
                          className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 placeholder:text-[var(--text-muted)]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[var(--text-primary)]">
                          Date
                        </label>
                        <input
                          type="text"
                          required
                          value={newHoliday.date}
                          onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                          placeholder="e.g. 10 Apr 2026"
                          className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 placeholder:text-[var(--text-muted)]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-[var(--text-primary)]">
                            Repeats
                          </label>
                          <select
                            value={newHoliday.repeats}
                            onChange={(e) => setNewHoliday({ ...newHoliday, repeats: e.target.value })}
                            className="w-full h-11 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
                          >
                            <option value="Every year">Every year</option>
                            <option value="One-off">One-off</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-[var(--text-primary)]">
                            Applies to
                          </label>
                          <select
                            value={newHoliday.appliesTo}
                            onChange={(e) => setNewHoliday({ ...newHoliday, appliesTo: e.target.value })}
                            className="w-full h-11 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
                          >
                            <option value="All branches">All branches</option>
                            <option value="MG Road branch">MG Road branch</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddHolidayModal(false)}
                          className="px-5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition cursor-pointer"
                        >
                          Add holiday
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BUSINESS PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                  Business profile
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                  Manage your business name, portal address, and logo.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Business name
                </label>
                <input
                  type="text"
                  value={formData?.profile?.name || ''}
                  onChange={(e) => setSection('profile', 'name', e.target.value)}
                  placeholder="Glow Beauty Studio"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 transition placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Legal / registered name
                </label>
                <input
                  type="text"
                  value={formData?.profile?.legalName || ''}
                  onChange={(e) => setSection('profile', 'legalName', e.target.value)}
                  placeholder="Glow Beauty Studio Pvt Ltd"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 transition placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Customer portal URL slug
                </label>
                <input
                  type="text"
                  value={formData?.profile?.slug || ''}
                  onChange={(e) => setSection('profile', 'slug', e.target.value.toLowerCase())}
                  placeholder="glow-beauty-studio"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 transition placeholder:text-[var(--text-muted)]"
                />
                <p className="text-xs text-emerald-400 font-medium">
                  salon-suite.app/{formData?.profile?.slug || 'glow-beauty-studio'} is available
                </p>
              </div>

              <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  Last saved {formatLastSaved()}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(false)}
                  className="px-8 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                  Business contacts
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                  Update your primary phone, email, and portal display preferences.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Country code
                  </label>
                  <select
                    value={formData?.contacts?.[0]?.phoneCountryCode || '+91'}
                    onChange={(e) => setContact(0, 'phoneCountryCode', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="+91">+91 India</option>
                    <option value="+1">+1 United States</option>
                    <option value="+44">+44 United Kingdom</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={formData?.contacts?.[0]?.phoneNumber || ''}
                    onChange={(e) => setContact(0, 'phoneNumber', e.target.value)}
                    placeholder="98765 43210"
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 transition placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Business email
                </label>
                <input
                  type="email"
                  value={formData?.contacts?.[0]?.email || ''}
                  onChange={(e) => setContact(0, 'email', e.target.value)}
                  placeholder="hello@glowbeauty.in"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 transition placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  Last saved {formatLastSaved()}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(false)}
                  className="px-8 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: ADDRESS */}
          {activeTab === 'address' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                  Organization addresses
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                  Registered office printed on invoices and correspondence.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Address line 1
                </label>
                <input
                  type="text"
                  value={formData?.addresses?.[0]?.addressLine1 || ''}
                  onChange={(e) => setAddress(0, 'addressLine1', e.target.value)}
                  placeholder="12 MG Road"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 transition placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Address line 2
                </label>
                <input
                  type="text"
                  value={formData?.addresses?.[0]?.addressLine2 || ''}
                  onChange={(e) => setAddress(0, 'addressLine2', e.target.value)}
                  placeholder="Near Trinity Circle"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 transition placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">City</label>
                  <input
                    type="text"
                    value={formData?.addresses?.[0]?.city || ''}
                    onChange={(e) => setAddress(0, 'city', e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 transition placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">State</label>
                  <input
                    type="text"
                    value={formData?.addresses?.[0]?.state || ''}
                    onChange={(e) => setAddress(0, 'state', e.target.value)}
                    placeholder="Karnataka"
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 transition placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">Postal code</label>
                  <input
                    type="text"
                    value={formData?.addresses?.[0]?.postalCode || ''}
                    onChange={(e) => setAddress(0, 'postalCode', e.target.value)}
                    placeholder="560001"
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 transition placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  Last saved {formatLastSaved()}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(false)}
                  className="px-8 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: REGIONAL SETTINGS */}
          {activeTab === 'regional' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                  Regional settings
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                  Currency, timezone, and formatting rules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Currency
                  </label>
                  <select
                    value={formData?.settings?.currencyCode || 'INR'}
                    onChange={(e) => setSection('settings', 'currencyCode', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="INR">₹ INR · Indian rupee</option>
                    <option value="USD">$ USD · US Dollar</option>
                    <option value="EUR">€ EUR · Euro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    Timezone
                  </label>
                  <select
                    value={formData?.settings?.timezone || 'Asia/Kolkata'}
                    onChange={(e) => setSection('settings', 'timezone', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata · 6:42 PM now</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  Last saved {formatLastSaved()}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(false)}
                  className="px-8 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: BUSINESS HOURS */}
          {activeTab === 'hours' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--text-primary)]">
                    Business hours
                  </h2>
                  <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-muted)]">
                    Weekly operating hours across branches.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyMonday}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
                >
                  Copy Monday to all
                </button>
              </div>

              {/* Weekly schedule */}
              <div className="border border-[var(--border-color)] rounded-2xl divide-y divide-[var(--border-color)] overflow-hidden bg-[var(--bg-card)]">
                {[
                  { label: 'Monday', value: 1 },
                  { label: 'Tuesday', value: 2 },
                  { label: 'Wednesday', value: 3 },
                  { label: 'Thursday', value: 4 },
                  { label: 'Friday', value: 5 },
                  { label: 'Saturday', value: 6 },
                  { label: 'Sunday', value: 0 },
                ].map((d) => {
                  const hour = formData?.businessHours?.find((h) => h.dayOfWeek === d.value) || {
                    isOpen: d.value !== 0,
                    openTime: '09:00',
                    closeTime: '19:00',
                  };
                  return (
                    <div key={d.label} className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition">
                      <span className="w-28 text-sm font-semibold text-[var(--text-primary)]">{d.label}</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="time"
                          disabled={!hour.isOpen}
                          value={hour.openTime || '09:00'}
                          onChange={(e) => setHour(d.value, 'openTime', e.target.value)}
                          className="h-10 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm disabled:bg-[var(--bg-card)] disabled:text-[var(--text-muted)]"
                        />
                        <span className="text-[var(--text-muted)] text-sm">to</span>
                        <input
                          type="time"
                          disabled={!hour.isOpen}
                          value={hour.closeTime || '19:00'}
                          onChange={(e) => setHour(d.value, 'closeTime', e.target.value)}
                          className="h-10 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm disabled:bg-[var(--bg-card)] disabled:text-[var(--text-muted)]"
                        />
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${hour.isOpen ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)]'}`}>
                        {hour.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  Last saved {formatLastSaved()}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(false)}
                  className="px-8 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
