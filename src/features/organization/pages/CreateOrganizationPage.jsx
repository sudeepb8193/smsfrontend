import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Sparkles,
  Palette,
  Loader2,
  CheckCircle2,
  Globe,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { organizationApi } from '../services/organizationApi';

export const CreateOrganizationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    businessType: 'salon',
    brandPrimaryColor: '#4F46E5',
    brandSecondaryColor: '#EC4899',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-generate URL slug preview
  const slugPreview = formData.name
    ? formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    : 'organization-slug';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Organization name is required');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const result = await organizationApi.createOrganization(formData);
      toast.success(`Organization "${formData.name}" created successfully!`);
      // Redirect back to organization setup page
      navigate('/organization/setup');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate('/organization/setup')}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Back to Setup"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Building2 size={22} className="text-primary-500" />
              <span>Create New Organization</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Register a new salon business entity with brand colors, unique URL slug, and multi-tenant workspace
            </p>
          </div>
        </div>
      </div>

      {/* Main Creation Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {errorMsg && (
          <div className="p-4 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Section 1: Basic Identity */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Briefcase size={15} className="text-primary-500" />
            <span>1. Organization Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Organization Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Royal Beauty Studio"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Legal Business Name (Optional)
              </label>
              <input
                type="text"
                name="legalName"
                placeholder="e.g. Royal Beauty Studio Pvt Ltd"
                value={formData.legalName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Primary Business Industry / Type
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="salon">Hair Salon & Hair Styling</option>
              <option value="spa">Wellness Spa & Massage</option>
              <option value="barber">Barbershop & Men's Grooming</option>
              <option value="beauty_clinic">Aesthetics & Skincare Clinic</option>
              <option value="nail_studio">Nail & Lash Studio</option>
            </select>
          </div>
        </div>

        {/* Section 2: URL Slug Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Globe size={16} className="text-primary-500" />
            <span>Organization URL Workspace Slug</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your organization will be accessible under the unique slug address:
          </p>
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
            <span>https://app.salonflow.com/org/</span>
            <span className="text-indigo-600 dark:text-indigo-400">{slugPreview}</span>
          </div>
        </div>

        {/* Section 3: Brand Styling & Colors */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Palette size={15} className="text-pink-500" />
            <span>2. Brand Styling & Theme Colors</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Brand Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="brandPrimaryColor"
                  value={formData.brandPrimaryColor}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-600 p-1"
                />
                <input
                  type="text"
                  name="brandPrimaryColor"
                  value={formData.brandPrimaryColor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 uppercase"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Brand Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="brandSecondaryColor"
                  value={formData.brandSecondaryColor}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-600 p-1"
                />
                <input
                  type="text"
                  name="brandSecondaryColor"
                  value={formData.brandSecondaryColor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/organization/setup')}
            disabled={loading}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:opacity-95 rounded-xl shadow-lg shadow-primary-500/25 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span>Create Organization & Workspace</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrganizationPage;
