import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Loader2,
  Sparkles,
  Shuffle,
} from 'lucide-react';
import { uploadMedia, getRandomPicsumUrl } from '../../services/mediaService';
import { toast } from 'sonner';

/**
 * Shared MediaUpload component.
 *
 * In local development (import.meta.env.DEV):
 *   - Automatically returns a random https://picsum.photos image when uploading any file.
 *   - Provides a "Shuffle Random Photo" quick button for rapid testing.
 *
 * In production:
 *   - Uploads directly to cloud storage and serves the original image.
 *
 * @param {Object} props
 * @param {string} props.value - Currently selected/uploaded image URL
 * @param {Function} props.onChange - Callback receiving the new image URL (url, fileInfo)
 * @param {string} [props.label] - Field label above the dropzone
 * @param {string} [props.helperText] - Subtext caption below label or dropzone
 * @param {string} [props.folder='general'] - Storage folder destination
 * @param {number} [props.maxSizeMB=5] - Maximum permitted file size in MB
 * @param {string} [props.aspectRatio='wide'] - 'wide' | 'square' | 'compact'
 * @param {React.ElementType} [props.placeholderIcon] - Icon to display when empty
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {boolean} [props.required=false] - Whether field is required
 * @param {string} [props.error] - Validation error message to display
 * @param {string} [props.className] - Extra wrapper classes
 * @param {boolean} [props.allowRandomDev=true] - Show shuffle button in local dev
 */
export const MediaUpload = ({
  value = '',
  onChange,
  label,
  helperText = 'PNG, JPG or WebP · up to 5 MB',
  folder = 'general',
  maxSizeMB = 5,
  aspectRatio = 'wide',
  placeholderIcon: PlaceholderIcon = ImageIcon,
  disabled = false,
  required = false,
  error,
  className = '',
  allowRandomDev = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const isDev = import.meta.env.DEV;

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WebP, GIF)');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image file size cannot exceed ${maxSizeMB}MB`);
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadMedia(file, folder);
      const newUrl = res?.url || res?.fileUrl;

      if (newUrl) {
        onChange?.(newUrl, res);
        toast.success(
          isDev
            ? 'Image uploaded (Local Picsum photo applied)'
            : 'Image uploaded successfully',
        );
      }
    } catch (err) {
      console.error('Media upload error:', err);
      toast.error(err?.message || 'Failed to upload image file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleShuffleDevPhoto = (e) => {
    e.stopPropagation();
    const randomUrl = getRandomPicsumUrl(null, 1200, 800);
    onChange?.(randomUrl, { url: randomUrl, isDevMock: true });
    toast.success('Random Picsum photo generated');
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange?.('', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Quick Actions */}
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label className="block text-xs font-semibold text-[var(--text-secondary)]">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        {/* Local Dev Badge / Shuffle Button */}
        {isDev && allowRandomDev && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Dev Mode: Picsum
            </span>
            <button
              type="button"
              onClick={handleShuffleDevPhoto}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition cursor-pointer"
              title="Generate another random Picsum photo"
            >
              <Shuffle size={12} />
              <span>Shuffle</span>
            </button>
          </div>
        )}
      </div>

      {/* Upload Dropzone Container */}
      <div
        onClick={() => {
          if (!disabled && !isUploading) {
            fileInputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition cursor-pointer bg-[var(--bg-input)] ${
          isDragOver
            ? 'border-primary-500 bg-primary-500/5 ring-2 ring-primary-500/20'
            : error
            ? 'border-rose-500/80 hover:border-rose-500'
            : 'border-[var(--border-color)] hover:border-primary-500'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {/* Preview or Icon Box */}
        <div
          className={`rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 flex items-center justify-center font-bold shrink-0 overflow-hidden ${
            aspectRatio === 'square'
              ? 'w-16 h-16'
              : aspectRatio === 'compact'
              ? 'w-12 h-12'
              : 'w-16 h-14 sm:w-20 sm:h-14'
          }`}
        >
          {isUploading ? (
            <Loader2 size={24} className="animate-spin text-primary-500" />
          ) : value ? (
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Graceful fallback if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <PlaceholderIcon size={24} className="opacity-70 text-primary-500" />
          )}
        </div>

        {/* Text Prompt */}
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
            {isUploading ? (
              <span className="flex items-center gap-1.5 text-primary-500 font-semibold">
                <Loader2 size={14} className="animate-spin" />
                Uploading image...
              </span>
            ) : value ? (
              <span className="truncate block font-semibold text-[var(--text-primary)]">
                Image selected
                <span className="font-normal text-xs text-[var(--text-muted)] ml-1.5">
                  (Click to replace)
                </span>
              </span>
            ) : (
              <>
                Drag photo here or{' '}
                <span className="underline font-semibold text-primary-500">
                  browse
                </span>
              </>
            )}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {helperText}
          </p>
        </div>

        {/* Remove Button */}
        {value && !isUploading && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition cursor-pointer shrink-0"
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
          disabled={disabled || isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export default MediaUpload;

