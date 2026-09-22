import React, { useState, useEffect } from 'react';
import { Upload, Save, Building } from 'lucide-react';
import Card from '../../../components/common/Card/Card';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Button from '../../../components/common/Button/Button';

export const BusinessProfileForm = ({ profile, onSave, onUploadLogo, saving = false }) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    displayName: '',
    legalName: '',
    businessType: 'salon',
    tagline: '',
    establishedYear: new Date().getFullYear(),
    websiteUrl: '',
    primaryColor: '#8A4A52',
    secondaryColor: '#271820',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        organizationName: profile.organizationName || '',
        displayName: profile.displayName || '',
        legalName: profile.legalName || '',
        businessType: profile.businessType || 'salon',
        tagline: profile.tagline || '',
        establishedYear: profile.establishedYear || new Date().getFullYear(),
        websiteUrl: profile.websiteUrl || '',
        primaryColor: profile.primaryColor || '#8A4A52',
        secondaryColor: profile.secondaryColor || '#271820',
      });
      if (profile.logoUrl) {
        setLogoPreview(profile.logoUrl);
      }
    }
  }, [profile]);

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
    await onSave(formData);
    if (logoFile && onUploadLogo) {
      await onUploadLogo(logoFile);
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

  return (
    <Card
      title="Business Profile & Identity"
      subtitle="Configure root tenant details, branding, business classification, and legal identity."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload Section */}
        <div className="flex items-center gap-6 p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
          <div className="w-20 h-20 rounded-2xl bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-color)] flex items-center justify-center shrink-0 overflow-hidden relative">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
            ) : (
              <Building className="text-[var(--text-muted)]" size={32} />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[var(--text-primary)]">Organization Logo</label>
            <p className="text-xs text-[var(--text-muted)]">
              Upload PNG, JPG, or SVG logo. Recommended size: 200x200px.
            </p>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white cursor-pointer transition-all self-start">
              <Upload size={14} />
              <span>Choose Logo File</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>
        </div>

        {/* Inputs Grid */}
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
            label="Tagline / Motto"
            name="tagline"
            value={formData.tagline}
            onChange={handleChange}
            placeholder="e.g. Premium Hair & Skin Care Solutions"
          />

          <Input
            label="Established Year"
            name="establishedYear"
            type="number"
            value={formData.establishedYear}
            onChange={handleChange}
            placeholder="e.g. 2020"
          />

          <Input
            label="Official Website URL"
            name="websiteUrl"
            type="url"
            value={formData.websiteUrl}
            onChange={handleChange}
            placeholder="https://apexsalon.com"
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Primary Color"
              name="primaryColor"
              type="color"
              value={formData.primaryColor}
              onChange={handleChange}
              className="h-10"
            />
            <Input
              label="Secondary Color"
              name="secondaryColor"
              type="color"
              value={formData.secondaryColor}
              onChange={handleChange}
              className="h-10"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
          <Button type="submit" variant="primary" icon={Save} loading={saving}>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BusinessProfileForm;
