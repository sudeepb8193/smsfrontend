import React, { useState } from 'react';
import { X, Building2, Sparkles, Loader2, Palette, CheckCircle2 } from 'lucide-react';
import { organizationApi } from '../services/organizationApi';
import { toast } from 'sonner';

export const CreateOrganizationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    businessType: 'salon',
    brandPrimaryColor: '#4F46E5',
    brandSecondaryColor: '#EC4899',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

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
      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Create New Organization
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Setup a new salon business entity with brand setup & isolated multi-tenant workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Organization Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Organization Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Royal Beauty Lounge"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100 font-semibold"
            />
            {formData.name && (
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Auto-generated slug: <span className="text-primary-600 dark:text-primary-400 font-bold">{slugPreview}</span>
              </p>
            )}
          </div>

          {/* Legal Business Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Legal Registered Name (Optional)
            </label>
            <input
              type="text"
              name="legalName"
              placeholder="e.g. Royal Beauty Lounge Pvt Ltd"
              value={formData.legalName}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Business Type
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="salon">Hair Salon & Styling</option>
              <option value="spa">Wellness & Spa Center</option>
              <option value="barber">Barbershop</option>
              <option value="beauty_clinic">Beauty Clinic & Aesthetics</option>
              <option value="nail_studio">Nail Studio</option>
            </select>
          </div>

          {/* Brand Colors */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Palette size={13} className="text-primary-500" />
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="brandPrimaryColor"
                  value={formData.brandPrimaryColor}
                  onChange={handleChange}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 p-0.5"
                />
                <input
                  type="text"
                  name="brandPrimaryColor"
                  value={formData.brandPrimaryColor}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Palette size={13} className="text-pink-500" />
                Secondary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="brandSecondaryColor"
                  value={formData.brandSecondaryColor}
                  onChange={handleChange}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 p-0.5"
                />
                <input
                  type="text"
                  name="brandSecondaryColor"
                  value={formData.brandSecondaryColor}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md shadow-primary-600/25 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span>Create Organization</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrganizationModal;
