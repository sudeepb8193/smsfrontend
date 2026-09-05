import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  Palette,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { Input } from '../../../components/common/Input/Input';
import { Select } from '../../../components/common/Select/Select';
import { Button } from '../../../components/common/Button/Button';

const calculateLuminance = (hex) => {
  if (!hex || !/^#([A-Fa-f0-9]{6})$/.test(hex)) return 0.5;
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const transform = (val) =>
    val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);

  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
};

const calculateContrastRatio = (hex1, hex2) => {
  const l1 = calculateLuminance(hex1);
  const l2 = calculateLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const BusinessProfileSection = ({ organization, onUpdateSuccess, isReadOnly }) => {
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    slug: '',
    businessType: 'salon',
    logoUrl: '',
    faviconUrl: '',
    brandPrimaryColor: '#8A4A52',
    brandSecondaryColor: '#2C181B',
    status: 'onboarding',
  });

  const [slugStatus, setSlugStatus] = useState({ checking: false, available: true, alternatives: [] });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        legalName: organization.legalName || '',
        slug: organization.slug || '',
        businessType: organization.businessType || 'salon',
        logoUrl: organization.logoUrl || '',
        faviconUrl: organization.faviconUrl || '',
        brandPrimaryColor: organization.brandPrimaryColor || '#8A4A52',
        brandSecondaryColor: organization.brandSecondaryColor || '#2C181B',
        status: organization.status || 'onboarding',
      });
    }
  }, [organization]);

  const handleSlugCheck = async (slugToCheck) => {
    if (!slugToCheck) return;
    setSlugStatus({ checking: true, available: true, alternatives: [] });
    try {
      const res = await organizationApi.checkSlugAvailability(slugToCheck, organization?.id);
      setSlugStatus({
        checking: false,
        available: res.available,
        alternatives: res.alternatives || [],
      });
    } catch (err) {
      setSlugStatus({ checking: false, available: true, alternatives: [] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await organizationApi.updateOrganization(organization.id, formData);
      setFeedback({
        type: 'success',
        message: 'Organization business profile updated successfully!',
        warnings: res.warnings || [],
      });
      if (onUpdateSuccess) onUpdateSuccess(res);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update business profile.',
        warnings: err.data?.alternatives ? [`Suggested alternatives: ${err.data.alternatives.join(', ')}`] : [],
      });
    } finally {
      setSaving(false);
    }
  };

  const primaryContrastWhite = calculateContrastRatio(formData.brandPrimaryColor, '#FFFFFF');
  const primaryContrastBlack = calculateContrastRatio(formData.brandPrimaryColor, '#000000');
  const wcagPass = primaryContrastWhite >= 4.5 || primaryContrastBlack >= 4.5;

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{feedback.message}</span>
          </div>
          {feedback.warnings && feedback.warnings.length > 0 && (
            <ul className="mt-2 text-xs space-y-1 list-disc list-inside text-amber-600 dark:text-amber-300">
              {feedback.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Identity Card */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-500 flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Business Profile & Identity</h3>
                <p className="text-xs text-[var(--text-muted)]">Configure salon legal name, business type, and URL slug</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                formData.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
              }`}
            >
              {formData.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Business Name"
              required
              disabled={isReadOnly}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Glamour & Style Salon"
            />

            <Input
              label="Legal Registered Name"
              disabled={isReadOnly}
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              placeholder="e.g. Glamour Salon Enterprises LLC"
            />

            <Select
              label="Business Type"
              disabled={isReadOnly}
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              options={[
                { value: 'salon', label: 'Salon' },
                { value: 'spa', label: 'Spa' },
                { value: 'unisex_salon', label: 'Unisex Salon' },
                { value: 'barbershop', label: 'Barbershop' },
                { value: 'wellness_center', label: 'Wellness Center' },
                { value: 'other', label: 'Other' },
              ]}
            />

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  disabled={isReadOnly}
                  value={formData.slug}
                  onChange={(e) => {
                    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setFormData({ ...formData, slug: newSlug });
                  }}
                  placeholder="glamour-style-salon"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleSlugCheck(formData.slug)}
                  disabled={slugStatus.checking || isReadOnly}
                  icon={Globe}
                  size="medium"
                >
                  {slugStatus.checking ? 'Checking...' : 'Check'}
                </Button>
              </div>

              {!slugStatus.available && (
                <div className="mt-2 text-xs text-rose-500 space-y-1">
                  <p>Slug is taken. Available alternatives:</p>
                  <div className="flex gap-2">
                    {slugStatus.alternatives.map((alt) => (
                      <button
                        key={alt}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, slug: alt });
                          setSlugStatus({ checking: false, available: true, alternatives: [] });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 text-xs"
                      >
                        {alt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Branding & Media Card */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-500 flex items-center justify-center">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Branding & Color Theme</h3>
              <p className="text-xs text-[var(--text-muted)]">Logos, favicons, and WCAG AA contrast ratio color palette</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Logo Asset URL"
              type="url"
              disabled={isReadOnly}
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://assets.salon.com/logo.png"
            />

            <Input
              label="Favicon Icon URL"
              type="url"
              disabled={isReadOnly}
              value={formData.faviconUrl}
              onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
              placeholder="https://assets.salon.com/favicon.ico"
            />

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Brand Primary Color (Hex)</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  disabled={isReadOnly}
                  value={formData.brandPrimaryColor}
                  onChange={(e) => setFormData({ ...formData, brandPrimaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <Input
                  disabled={isReadOnly}
                  value={formData.brandPrimaryColor}
                  onChange={(e) => setFormData({ ...formData, brandPrimaryColor: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Brand Secondary Color (Hex)</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  disabled={isReadOnly}
                  value={formData.brandSecondaryColor}
                  onChange={(e) => setFormData({ ...formData, brandSecondaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <Input
                  disabled={isReadOnly}
                  value={formData.brandSecondaryColor}
                  onChange={(e) => setFormData({ ...formData, brandSecondaryColor: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* WCAG AA Contrast Preview Box */}
          <div className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: formData.brandPrimaryColor, color: '#FFFFFF' }}
              >
                Aa
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">WCAG AA Color Contrast Analysis</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Ratio vs White: <span className="text-[var(--text-primary)] font-mono">{primaryContrastWhite.toFixed(2)}:1</span> | Ratio vs Black: <span className="text-[var(--text-primary)] font-mono">{primaryContrastBlack.toFixed(2)}:1</span>
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                wcagPass
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
              }`}
            >
              {wcagPass ? 'WCAG AA Compliant' : 'Low Contrast Warning'}
            </span>
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              icon={Sparkles}
              size="large"
            >
              Save Profile Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BusinessProfileSection;
