import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Sparkles,
  Loader2,
  X,
  ChevronDown,
} from 'lucide-react';
import { checkBranchCode, uploadBranchCoverImage } from '../../api/branchApi';
import { useBranch } from '../../context/BranchContext';
import { toast } from 'sonner';

const BRANCH_TYPES = [
  { id: 'flagship', label: 'Flagship' },
  { id: 'standard', label: 'Standard Salon' },
  { id: 'kiosk', label: 'Express Kiosk' },
];

export const BranchWizardStep1Profile = ({
  initialValues = {},
  onSubmit,
  isSubmitting = false,
  isEditMode = false,
  onCancel,
}) => {
  const { branches } = useBranch();
  const fileInputRef = useRef(null);

  // Form State
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

  // Code Validation State
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState(null);
  const [suggestedCode, setSuggestedCode] = useState(null);
  const [codeError, setCodeError] = useState(null);

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);

  // Field errors
  const [errors, setErrors] = useState({});

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
        const res = await checkBranchCode(code.trim().toUpperCase());
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
  }, [code, isEditMode, initialValues.code]);

  // Handle Cover Image Upload
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

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (targetStatus) => {
    if (!validate()) {
      toast.error('Please fix validation errors before proceeding');
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      branchType,
      coverImageUrl: coverImageUrl || null,
      status: targetStatus || status,
      launchedAt: launchedAt || null,
      ...(copySettingsFromBranchId ? { copySettingsFromBranchId } : {}),
    };

    onSubmit(payload, targetStatus === 'draft');
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {isEditMode ? 'Edit branch profile' : 'Branch profile & identity'}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
          {isEditMode
            ? 'Update the primary identity and settings for this location.'
            : 'Set up the core identity, unique branch code, and operational category.'}
        </p>
      </div>

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

      {/* Cover Image Upload (Matching /owner/organisation/setup logo pattern) */}
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

      {/* Branch Type Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--text-secondary)]">
          Branch type
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

      {/* Launch Date & Inherit Settings (Two-column compact grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--text-secondary)]">
            Launch date (optional)
          </label>
          <input
            type="date"
            value={launchedAt}
            onChange={(e) => setLaunchedAt(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 transition"
          />
        </div>
        {!isEditMode && branches.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
              Inherit settings
            </label>
            <div className="relative">
              <select
                value={copySettingsFromBranchId}
                onChange={(e) => setCopySettingsFromBranchId(e.target.value)}
                className="w-full h-11 px-3.5 pr-8 rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:border-primary-500 appearance-none transition cursor-pointer"
              >
                <option value="">Start fresh (None)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="pt-4 flex items-center justify-between border-t border-[var(--border-color)]">
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
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(isEditMode ? status : 'active')}
            className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-semibold transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? 'Saving...'
              : isEditMode
              ? 'Save changes'
              : 'Next: branch address'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchWizardStep1Profile;
