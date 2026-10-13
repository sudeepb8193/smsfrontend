import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  Plus,
  X,
  FileText,
  Upload,
  Check,
  CheckCircle2,
  Calendar,
  AlertCircle
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

  const businessName = formData.profile.name || 'Glow Beauty Studio';

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
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1616] flex flex-col font-sans selection:bg-[#F3E5E3] selection:text-[#7A3444]">
      {/* Top Bar matching pages 6-8 */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-[#1A1616]">Salon Suite</h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSwitchToWizard}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#DED7CE] text-[#555050] hover:bg-[#F5EFE9] transition"
          >
            ← Back to setup wizard
          </button>
          <span className="text-sm font-semibold text-[#1A1616] underline underline-offset-4 cursor-pointer hover:text-[#7A3444]">
            {businessName}
          </span>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-16 flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Sidebar Navigation (Vertical Menu Bar Inside the Page) */}
        <aside className="w-full md:w-64 shrink-0 bg-white rounded-3xl p-3 border border-[#EBE6E1] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#7A3444] select-none">
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
                  className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold text-left transition ${
                    isActive
                      ? 'bg-[#F9EFEF] text-[#7A3444] shadow-xs'
                      : 'text-[#504A48] hover:bg-[#F3EDE6]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 w-full bg-white rounded-3xl border border-[#EBE6E1] p-8 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.03)] min-h-[580px]">
          {/* TAB 1: OVERVIEW (Page 6) */}
          {activeTab === 'overview' && (
            <div className="space-y-7 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#1A1616]">
                  Organization settings
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[#6E6864]">
                  Everything about your business, in one place.
                </p>
              </div>

              {/* Overview Summary Table */}
              <div className="border border-[#F0EAE3] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#F0EAE3] bg-[#FCFAF8] text-xs font-semibold text-[#8C8580]">
                      <th className="py-3 px-5 font-semibold">Section</th>
                      <th className="py-3 px-5 font-semibold">Summary</th>
                      <th className="py-3 px-5 font-semibold">Status</th>
                      <th className="py-3 px-5 font-semibold text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EAE3]">
                    {/* Row 1: Business profile */}
                    <tr className="hover:bg-[#FCFAF8] transition">
                      <td className="py-4 px-5 font-semibold text-[#1A1616]">
                        Business profile
                      </td>
                      <td className="py-4 px-5 text-[#504A48]">
                        {formData.profile.name || 'Glow Beauty Studio'}, logo, {formData.profile.businessType || 'Salon'}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DEF5E5] text-[#15733E]">
                          Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('profile')}
                          className="text-sm font-semibold text-[#1A1616] underline hover:text-[#7A3444]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {/* Row 2: Contact */}
                    <tr className="hover:bg-[#FCFAF8] transition">
                      <td className="py-4 px-5 font-semibold text-[#1A1616]">
                        Contact
                      </td>
                      <td className="py-4 px-5 text-[#504A48]">
                        {formData.contacts?.[0]?.phoneNumber ? `${formData.contacts[0].phoneCountryCode || '+91'} ${formData.contacts[0].phoneNumber}` : '+91 98765 43210'} and {formData.contacts?.[0]?.email || 'hello@glowbeauty.in'}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DEF5E5] text-[#15733E]">
                          Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('contact')}
                          className="text-sm font-semibold text-[#1A1616] underline hover:text-[#7A3444]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {/* Row 3: Address */}
                    <tr className="hover:bg-[#FCFAF8] transition">
                      <td className="py-4 px-5 font-semibold text-[#1A1616]">
                        Address
                      </td>
                      <td className="py-4 px-5 text-[#504A48]">
                        Registered office ({formData.addresses?.[0]?.city || 'Bengaluru'})
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DEF5E5] text-[#15733E]">
                          Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('address')}
                          className="text-sm font-semibold text-[#1A1616] underline hover:text-[#7A3444]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {/* Row 4: Tax information */}
                    <tr className="hover:bg-[#FCFAF8] transition">
                      <td className="py-4 px-5 font-semibold text-[#1A1616]">
                        Tax information
                      </td>
                      <td className="py-4 px-5 text-[#504A48]">
                        {formData.taxProfile?.taxIdentifierNumber ? `${formData.taxProfile.taxIdentifierType?.toUpperCase() || 'GSTIN'} submitted` : 'GSTIN submitted'}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF3D6] text-[#8C5908]">
                          Pending review
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('tax')}
                          className="text-sm font-semibold text-[#1A1616] underline hover:text-[#7A3444]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {/* Row 5: Regional settings */}
                    <tr className="hover:bg-[#FCFAF8] transition">
                      <td className="py-4 px-5 font-semibold text-[#1A1616]">
                        Regional settings
                      </td>
                      <td className="py-4 px-5 text-[#504A48]">
                        {formData.settings?.currencyCode || 'INR'} · {formData.settings?.timezone || 'Asia/Kolkata'}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DEF5E5] text-[#15733E]">
                          Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('regional')}
                          className="text-sm font-semibold text-[#1A1616] underline hover:text-[#7A3444]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {/* Row 6: Business hours */}
                    <tr className="hover:bg-[#FCFAF8] transition">
                      <td className="py-4 px-5 font-semibold text-[#1A1616]">
                        Business hours
                      </td>
                      <td className="py-4 px-5 text-[#504A48]">
                        Mon–Sat, 9:00–19:00
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DEF5E5] text-[#15733E]">
                          Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('hours')}
                          className="text-sm font-semibold text-[#1A1616] underline hover:text-[#7A3444]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {/* Row 7: Holidays */}
                    <tr className="hover:bg-[#FCFAF8] transition">
                      <td className="py-4 px-5 font-semibold text-[#1A1616]">
                        Holidays
                      </td>
                      <td className="py-4 px-5 text-[#504A48]">
                        {holidaysList.length} holidays
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DEF5E5] text-[#15733E]">
                          Complete
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('holidays')}
                          className="text-sm font-semibold text-[#1A1616] underline hover:text-[#7A3444]"
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

          {/* TAB 2: TAX INFORMATION (Page 7) */}
          {activeTab === 'tax' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#1A1616]">
                  Tax information
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[#6E6864]">
                  Printed on every tax invoice. Our team verifies it after you upload a certificate.
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3D6] text-[#8C5908]">
                    Pending review
                  </span>
                </div>
              </div>

              {/* Tax ID Type & Tax Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1A1616]">
                    Tax ID type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.taxProfile?.taxIdentifierType || 'gstin'}
                      onChange={(e) => setSection('taxProfile', 'taxIdentifierType', e.target.value)}
                      className="w-full h-12 px-4 pr-9 rounded-xl border border-[#DED7CE] text-[#1A1616] text-sm sm:text-[15px] focus:outline-none focus:border-[#7A3444] bg-white appearance-none cursor-pointer"
                    >
                      <option value="gstin">GSTIN</option>
                      <option value="vat">VAT</option>
                      <option value="pan">PAN</option>
                      <option value="tin">TIN</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-4 h-4 w-4 text-[#8C8580] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1A1616]">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={formData.taxProfile?.taxIdentifierNumber || '29ABCDE1234F1Z5'}
                    onChange={(e) => setSection('taxProfile', 'taxIdentifierNumber', e.target.value.toUpperCase())}
                    placeholder="29ABCDE1234F1Z5"
                    className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-[#1A1616] text-sm sm:text-[15px] focus:outline-none focus:border-[#7A3444] transition bg-white uppercase font-mono"
                  />
                </div>
              </div>

              {/* Registered business name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A1616]">
                  Registered business name
                </label>
                <input
                  type="text"
                  value={formData.taxProfile?.registeredBusinessName || 'Glow Beauty Studio Pvt Ltd'}
                  onChange={(e) => setSection('taxProfile', 'registeredBusinessName', e.target.value)}
                  placeholder="Glow Beauty Studio Pvt Ltd"
                  className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-[#1A1616] text-sm sm:text-[15px] focus:outline-none focus:border-[#7A3444] transition bg-white"
                />
              </div>

              {/* Registration date and Tax exempt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1A1616]">
                    Registration date
                  </label>
                  <input
                    type="date"
                    value={formData.taxProfile?.taxRegistrationDate || '2024-04-01'}
                    onChange={(e) => setSection('taxProfile', 'taxRegistrationDate', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-[#1A1616] text-sm sm:text-[15px] focus:outline-none focus:border-[#7A3444] transition bg-white"
                  />
                </div>

                <div className="pt-6">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() =>
                        setSection('taxProfile', 'isTaxExempt', !formData.taxProfile?.isTaxExempt)
                      }
                      className={`w-5 h-5 rounded flex items-center justify-center transition border ${
                        formData.taxProfile?.isTaxExempt
                          ? 'bg-[#7A3444] border-[#7A3444] text-white'
                          : 'border-[#C5BFB8] bg-white'
                      }`}
                    >
                      {formData.taxProfile?.isTaxExempt && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-sm font-medium text-[#1A1616]">Tax exempt</span>
                  </label>
                </div>
              </div>

              {/* Registration certificate Upload Box */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-sm font-semibold text-[#1A1616]">
                  Registration certificate
                </label>
                <div
                  onClick={() => taxFileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#DED7CE] hover:border-[#7A3444] rounded-2xl p-4 sm:p-5 flex items-center justify-between bg-[#FCFBF9] cursor-pointer transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F9EFEF] text-[#7A3444] flex items-center justify-center font-bold text-xs uppercase tracking-wider">
                      PDF
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1616]">
                        {taxDocPreview || formData.taxProfile?.documentUrl ? 'gst-certificate.pdf · 1.2 MB' : 'gst-certificate.pdf · 1.2 MB'}
                      </p>
                      <p className="text-xs text-[#8C8580] mt-0.5">
                        {uploadingTax ? 'Uploading file...' : 'PDF, JPG or PNG up to 10 MB'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[#1A1616] underline hover:text-[#7A3444]"
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
              <div className="pt-6 border-t border-[#F0EAE3] flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[#8C8580]">
                  Last saved {formatLastSaved()}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(false)}
                  className="px-8 py-2.5 rounded-xl bg-[#7A3444] hover:bg-[#682B38] text-white text-sm font-medium transition shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: HOLIDAYS (Page 8) */}
          {activeTab === 'holidays' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#1A1616]">
                    Holidays
                  </h2>
                  <p className="mt-1.5 text-sm sm:text-[15px] text-[#6E6864]">
                    Closed days block bookings and shifts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddHolidayModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#7A3444] hover:bg-[#682B38] text-white text-sm font-medium transition flex items-center gap-2 shadow-sm shrink-0"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  Add holiday
                </button>
              </div>

              {/* Holidays Table matching Page 8 */}
              <div className="border border-[#F0EAE3] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#F0EAE3] bg-[#FCFAF8] text-xs font-semibold text-[#8C8580]">
                      <th className="py-3 px-5 font-semibold">Name</th>
                      <th className="py-3 px-5 font-semibold">Date</th>
                      <th className="py-3 px-5 font-semibold">Repeats</th>
                      <th className="py-3 px-5 font-semibold">Applies to</th>
                      <th className="py-3 px-5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EAE3]">
                    {holidaysList.map((holiday) => (
                      <tr key={holiday.id} className="hover:bg-[#FCFAF8] transition">
                        <td className="py-4 px-5 font-semibold text-[#1A1616]">
                          {holiday.name}
                        </td>
                        <td className="py-4 px-5 text-[#504A48]">
                          {holiday.date}
                        </td>
                        <td className="py-4 px-5 text-[#504A48]">
                          {holiday.repeats}
                        </td>
                        <td className="py-4 px-5 text-[#504A48]">
                          {holiday.appliesTo}
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DEF5E5] text-[#15733E]">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                  <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EBE6E1] animate-fadeIn">
                    <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE3]">
                      <h3 className="text-lg font-bold text-[#1A1616]">Add a holiday</h3>
                      <button
                        type="button"
                        onClick={() => setShowAddHolidayModal(false)}
                        className="p-1 rounded-lg text-[#8C8580] hover:bg-[#F3EDE6]"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddHolidaySubmit} className="space-y-4 pt-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[#1A1616]">
                          Holiday name
                        </label>
                        <input
                          type="text"
                          required
                          value={newHoliday.name}
                          onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                          placeholder="e.g. Eid al-Fitr"
                          className="w-full h-11 px-3.5 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[#1A1616]">
                          Date
                        </label>
                        <input
                          type="text"
                          required
                          value={newHoliday.date}
                          onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                          placeholder="e.g. 10 Apr 2026"
                          className="w-full h-11 px-3.5 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-[#1A1616]">
                            Repeats
                          </label>
                          <select
                            value={newHoliday.repeats}
                            onChange={(e) => setNewHoliday({ ...newHoliday, repeats: e.target.value })}
                            className="w-full h-11 px-3 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                          >
                            <option value="Every year">Every year</option>
                            <option value="One-off">One-off</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-[#1A1616]">
                            Applies to
                          </label>
                          <select
                            value={newHoliday.appliesTo}
                            onChange={(e) => setNewHoliday({ ...newHoliday, appliesTo: e.target.value })}
                            className="w-full h-11 px-3 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
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
                          className="px-5 py-2 rounded-xl border border-[#DED7CE] text-sm font-medium hover:bg-[#F9F7F5]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-xl bg-[#7A3444] hover:bg-[#682B38] text-white text-sm font-medium"
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
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#1A1616]">
                  Business profile
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[#6E6864]">
                  Manage your business name, portal address, and logo.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A1616]">
                  Business name
                </label>
                <input
                  type="text"
                  value={formData.profile.name || ''}
                  onChange={(e) => setSection('profile', 'name', e.target.value)}
                  placeholder="Glow Beauty Studio"
                  className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A1616]">
                  Legal / registered name
                </label>
                <input
                  type="text"
                  value={formData.profile.legalName || ''}
                  onChange={(e) => setSection('profile', 'legalName', e.target.value)}
                  placeholder="Glow Beauty Studio Pvt Ltd"
                  className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A1616]">
                  Customer portal URL slug
                </label>
                <input
                  type="text"
                  value={formData.profile.slug || ''}
                  onChange={(e) => setSection('profile', 'slug', e.target.value.toLowerCase())}
                  placeholder="glow-beauty-studio"
                  className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                />
                <p className="text-xs text-[#1C7446] font-medium">
                  salon-suite.app/{formData.profile.slug || 'glow-beauty-studio'} is available
                </p>
              </div>

              <div className="pt-6 border-t border-[#F0EAE3] flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[#8C8580]">
                  Last saved {formatLastSaved()}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(false)}
                  className="px-8 py-2.5 rounded-xl bg-[#7A3444] hover:bg-[#682B38] text-white text-sm font-medium transition shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#1A1616]">
                  Business contacts
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[#6E6864]">
                  Update your primary phone, email, and portal display preferences.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1A1616]">
                    Country code
                  </label>
                  <select
                    value={formData.contacts?.[0]?.phoneCountryCode || '+91'}
                    onChange={(e) => setContact(0, 'phoneCountryCode', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                  >
                    <option value="+91">+91 India</option>
                    <option value="+1">+1 United States</option>
                    <option value="+44">+44 United Kingdom</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1A1616]">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={formData.contacts?.[0]?.phoneNumber || ''}
                    onChange={(e) => setContact(0, 'phoneNumber', e.target.value)}
                    placeholder="98765 43210"
                    className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A1616]">
                  Business email
                </label>
                <input
                  type="email"
                  value={formData.contacts?.[0]?.email || ''}
                  onChange={(e) => setContact(0, 'email', e.target.value)}
                  placeholder="hello@glowbeauty.in"
                  className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                />
              </div>

              <div className="pt-6 border-t border-[#F0EAE3] flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[#8C8580]">
                  Last saved {formatLastSaved()}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(false)}
                  className="px-8 py-2.5 rounded-xl bg-[#7A3444] hover:bg-[#682B38] text-white text-sm font-medium transition shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: ADDRESS */}
          {activeTab === 'address' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#1A1616]">
                  Organization addresses
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[#6E6864]">
                  Registered office printed on invoices and correspondence.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A1616]">
                  Address line 1
                </label>
                <input
                  type="text"
                  value={formData.addresses?.[0]?.addressLine1 || ''}
                  onChange={(e) => setAddress(0, 'addressLine1', e.target.value)}
                  placeholder="12 MG Road"
                  className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A1616]">
                  Address line 2
                </label>
                <input
                  type="text"
                  value={formData.addresses?.[0]?.addressLine2 || ''}
                  onChange={(e) => setAddress(0, 'addressLine2', e.target.value)}
                  placeholder="Near Trinity Circle"
                  className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1A1616]">City</label>
                  <input
                    type="text"
                    value={formData.addresses?.[0]?.city || ''}
                    onChange={(e) => setAddress(0, 'city', e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1A1616]">State</label>
                  <input
                    type="text"
                    value={formData.addresses?.[0]?.state || ''}
                    onChange={(e) => setAddress(0, 'state', e.target.value)}
                    placeholder="Karnataka"
                    className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1A1616]">Postal code</label>
                  <input
                    type="text"
                    value={formData.addresses?.[0]?.postalCode || ''}
                    onChange={(e) => setAddress(0, 'postalCode', e.target.value)}
                    placeholder="560001"
                    className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-[#F0EAE3] flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[#8C8580]">
                  Last saved {formatLastSaved()}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(false)}
                  className="px-8 py-2.5 rounded-xl bg-[#7A3444] hover:bg-[#682B38] text-white text-sm font-medium transition shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: REGIONAL SETTINGS */}
          {activeTab === 'regional' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#1A1616]">
                  Regional settings
                </h2>
                <p className="mt-1.5 text-sm sm:text-[15px] text-[#6E6864]">
                  Currency, timezone, and formatting rules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1A1616]">
                    Currency
                  </label>
                  <select
                    value={formData.settings.currencyCode || 'INR'}
                    onChange={(e) => setSection('settings', 'currencyCode', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                  >
                    <option value="INR">₹ INR · Indian rupee</option>
                    <option value="USD">$ USD · US Dollar</option>
                    <option value="EUR">€ EUR · Euro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#1A1616]">
                    Timezone
                  </label>
                  <select
                    value={formData.settings.timezone || 'Asia/Kolkata'}
                    onChange={(e) => setSection('settings', 'timezone', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[#DED7CE] text-sm focus:outline-none focus:border-[#7A3444] bg-white"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata · 6:42 PM now</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-[#F0EAE3] flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[#8C8580]">
                  Last saved {formatLastSaved()}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(false)}
                  className="px-8 py-2.5 rounded-xl bg-[#7A3444] hover:bg-[#682B38] text-white text-sm font-medium transition shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: BUSINESS HOURS */}
          {activeTab === 'hours' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#1A1616]">
                    Business hours
                  </h2>
                  <p className="mt-1.5 text-sm sm:text-[15px] text-[#6E6864]">
                    Weekly operating hours across branches.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyMonday}
                  className="px-4 py-2 rounded-xl border border-[#DED7CE] hover:bg-[#F9F7F5] text-xs font-semibold text-[#1A1616] transition"
                >
                  Copy Monday to all
                </button>
              </div>

              {/* Weekly schedule */}
              <div className="border border-[#F0EAE3] rounded-2xl divide-y divide-[#F0EAE3] overflow-hidden">
                {[
                  { label: 'Monday', value: 1 },
                  { label: 'Tuesday', value: 2 },
                  { label: 'Wednesday', value: 3 },
                  { label: 'Thursday', value: 4 },
                  { label: 'Friday', value: 5 },
                  { label: 'Saturday', value: 6 },
                  { label: 'Sunday', value: 0 },
                ].map((d) => {
                  const hour = formData.businessHours?.find((h) => h.dayOfWeek === d.value) || {
                    isOpen: d.value !== 0,
                    openTime: '09:00',
                    closeTime: '19:00',
                  };
                  return (
                    <div key={d.label} className="p-4 flex items-center justify-between gap-4">
                      <span className="w-28 text-sm font-semibold text-[#1A1616]">{d.label}</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="time"
                          disabled={!hour.isOpen}
                          value={hour.openTime || '09:00'}
                          onChange={(e) => setHour(d.value, 'openTime', e.target.value)}
                          className="h-10 px-3 rounded-xl border border-[#DED7CE] text-sm disabled:bg-[#F7F5F2]"
                        />
                        <span className="text-[#8C8580] text-sm">to</span>
                        <input
                          type="time"
                          disabled={!hour.isOpen}
                          value={hour.closeTime || '19:00'}
                          onChange={(e) => setHour(d.value, 'closeTime', e.target.value)}
                          className="h-10 px-3 rounded-xl border border-[#DED7CE] text-sm disabled:bg-[#F7F5F2]"
                        />
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${hour.isOpen ? 'bg-[#DEF5E5] text-[#15733E]' : 'bg-[#F2ECE6] text-[#8C8580]'}`}>
                        {hour.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-[#F0EAE3] flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[#8C8580]">
                  Last saved {formatLastSaved()}
                </p>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => onSave(false)}
                  className="px-8 py-2.5 rounded-xl bg-[#7A3444] hover:bg-[#682B38] text-white text-sm font-medium transition shadow-sm disabled:opacity-50"
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
