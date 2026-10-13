import React, { useState } from 'react';
import {
  X,
  Check,
  Sun,
  Moon,
  Monitor,
  Palette,
  Type,
  Eye,
  Sparkles,
  Sliders,
  CheckCircle2,
  Pipette,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { ACCENT_PALETTES, FONT_FAMILIES } from '../../store/ThemeContext';
import { Toggle } from './Toggle';
import { toast } from 'sonner';

export const ThemeSettingsModal = () => {
  const {
    mode,
    setMode,
    accentColor,
    setAccentColor,
    customColor,
    setCustomColor,
    density,
    setDensity,
    fontFamily,
    setFontFamily,
    borderRadius,
    setBorderRadius,
    smoothAnimations,
    setSmoothAnimations,
    boldFocusRings,
    setBoldFocusRings,
    isModalOpen,
    closeThemeModal,
  } = useTheme();

  // State for interactive live preview
  const [previewToggle, setPreviewToggle] = useState(true);

  if (!isModalOpen) return null;

  const currentPalette =
    accentColor === 'custom'
      ? { name: 'Custom', hex: customColor || '#F97316' }
      : (ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.orange);
  const currentFontRule = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.Inter;

  const accentList = Object.entries(ACCENT_PALETTES).map(([key, val]) => ({
    key,
    name: val.name,
    color: val.hex,
  }));

  const densityOptions = [
    { key: 'relaxed', label: 'Relaxed', desc: 'Spacious padding' },
    { key: 'standard', label: 'Standard', desc: 'Balanced layout' },
    { key: 'tight', label: 'Tight', desc: 'Compact data density' },
  ];

  const radiusValues = [
    { val: 4, label: 'Sharp (4px)' },
    { val: 8, label: 'Subtle (8px)' },
    { val: 12, label: 'Rounded (12px)' },
    { val: 16, label: 'Pill (16px)' },
  ];

  return (
    <>
      {/* 100% Solid Dimmed Backdrop with Blur */}
      <div
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={closeThemeModal}
      />

      {/* Floating Theme Customizer Container */}
      <div
        className="fixed top-14 right-3 sm:right-6 z-50 w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden text-[var(--text-primary)] transition-all duration-200 ease-out flex flex-col max-h-[90vh] animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-[var(--bg-input)]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-colors"
              style={{ backgroundColor: currentPalette.hex }}
            >
              <Palette size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                Workspace Aesthetics
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Customize appearance, brand colors, fonts, and layout density
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeThemeModal}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition cursor-pointer"
            aria-label="Close theme modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body with Clean Sections */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* SECTION 1: Theme Mode */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <Sun size={13} className="text-primary-500" />
              Appearance Mode
            </label>
            <div className="grid grid-cols-3 gap-2 bg-[var(--bg-input)] p-1.5 rounded-2xl border border-[var(--border-color)]">
              {[
                { key: 'light', label: 'Light', icon: Sun },
                { key: 'dark', label: 'Dark', icon: Moon },
                { key: 'auto', label: 'Auto', icon: Monitor },
              ].map(({ key, label, icon: Icon }) => {
                const active = mode === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setMode(key);
                      toast.success(`Switched to ${label} mode`);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                    }`}
                  >
                    <Icon size={14} className={active ? 'text-primary-500' : 'opacity-70'} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Accent Color Swatches & Custom Color */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <Palette size={13} className="text-primary-500" />
                Brand Accent Color
              </label>
              <span className="text-xs font-semibold text-primary-500">
                {accentColor === 'custom' ? `Custom (${customColor})` : currentPalette.name}
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-5 gap-2.5 p-3 bg-[var(--bg-input)] rounded-2xl border border-[var(--border-color)]">
              {accentList.map((acc) => {
                const isSelected = accentColor === acc.key;
                return (
                  <button
                    key={acc.key}
                    type="button"
                    onClick={() => {
                      setAccentColor(acc.key);
                      toast.info(`Accent theme set to ${acc.name}`);
                    }}
                    className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-[var(--bg-card)] shadow-sm ring-2 ring-primary-500/50'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: acc.color }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform shadow-xs ${
                        isSelected ? 'scale-110 shadow-md ring-2 ring-white' : 'group-hover:scale-105'
                      }`}
                    >
                      {isSelected && <Check size={13} className="text-white drop-shadow-md stroke-[3]" />}
                    </span>
                    <span
                      className={`text-[10px] font-semibold truncate ${
                        isSelected
                          ? 'text-[var(--text-primary)] font-bold'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {acc.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input & Wheel Picker */}
            <div className="p-3 bg-[var(--bg-input)] rounded-2xl border border-[var(--border-color)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <label className="relative cursor-pointer shrink-0">
                  <input
                    type="color"
                    value={customColor || '#F97316'}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setAccentColor('custom');
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`w-9 h-9 rounded-xl shadow-xs flex items-center justify-center cursor-pointer transition-transform hover:scale-105 border-2 ${
                      accentColor === 'custom'
                        ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-[var(--bg-card)] border-white'
                        : 'border-[var(--border-color)]'
                    }`}
                    style={{ backgroundColor: customColor || '#F97316' }}
                  >
                    {accentColor === 'custom' ? (
                      <Check size={16} className="text-white drop-shadow stroke-[3]" />
                    ) : (
                      <Pipette size={14} className="text-white/90 drop-shadow" />
                    )}
                  </div>
                </label>

                <div className="min-w-0">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">
                    Custom Hex Color
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Click color wheel or type hex
                  </span>
                </div>
              </div>

              {/* Hex Text Input */}
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={customColor || '#F97316'}
                  maxLength={7}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomColor(val);
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      setAccentColor('custom');
                    }
                  }}
                  placeholder="#F97316"
                  className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAccentColor('custom');
                    toast.success(`Custom color applied: ${customColor}`);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    accentColor === 'custom'
                      ? 'bg-primary-500 text-white shadow-xs'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-white/10'
                  }`}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: Font Family Typography */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <Type size={13} className="text-primary-500" />
              Typography & Font Family
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.keys(FONT_FAMILIES).map((font) => {
                const isSelected = fontFamily === font;
                return (
                  <button
                    key={font}
                    type="button"
                    onClick={() => {
                      setFontFamily(font);
                      toast.info(`Font set to ${font}`);
                    }}
                    style={{ fontFamily: FONT_FAMILIES[font] }}
                    className={`p-2.5 px-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-xs ring-1 ring-primary-500/30'
                        : 'border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                    }`}
                  >
                    <span className="text-xs font-semibold">{font}</span>
                    {isSelected && (
                      <CheckCircle2 size={15} className="text-primary-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: Corner Radius & Layout Density */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Corner Radius */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={13} className="text-primary-500" />
                Corner Radius
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {radiusValues.map(({ val, label }) => {
                  const isSelected = borderRadius === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setBorderRadius(val)}
                      className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                          : 'border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layout Density */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={13} className="text-primary-500" />
                Layout Density
              </label>
              <div className="space-y-1.5">
                {densityOptions.map(({ key, label, desc }) => {
                  const isSelected = density === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDensity(key)}
                      className={`w-full p-2 px-3 rounded-xl text-xs text-left border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/10 text-primary-500 font-bold'
                          : 'border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                      }`}
                    >
                      <span className="font-semibold">{label}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 5: Motion & Accessibility */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  Smooth Animations
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Enable fluid GSAP spring transitions across buttons and toggles
                </span>
              </div>
              <Toggle
                checked={smoothAnimations}
                onChange={setSmoothAnimations}
                size="sm"
                aria-label="Smooth animations"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  Bold Focus Rings
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  High-contrast focus outlines for enhanced accessibility
                </span>
              </div>
              <Toggle
                checked={boldFocusRings}
                onChange={setBoldFocusRings}
                size="sm"
                aria-label="Bold focus rings"
              />
            </div>
          </div>

          {/* SECTION 6: LIVE PREVIEW */}
          <div className="space-y-2 pt-4 border-t border-[var(--border-color)]">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-primary-500" />
                Live Preview
              </span>
              <span className="text-[10px] lowercase font-semibold text-[var(--text-muted)]">
                {fontFamily} • {currentPalette.name}
              </span>
            </div>

            {/* Interactive Preview Container */}
            <div
              className="p-4 sm:p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] space-y-4 shadow-xs transition-all"
              style={{
                fontFamily: currentFontRule,
                borderRadius: `${borderRadius}px`,
              }}
            >
              {/* Sample Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    Appointment Booking Preview
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Live demonstration of your chosen colors, font, and button styles.
                  </p>
                </div>
                <span
                  className="px-2.5 py-0.5 text-[11px] font-bold rounded-full text-white shadow-xs shrink-0"
                  style={{ backgroundColor: currentPalette.hex }}
                >
                  Active
                </span>
              </div>

              {/* Sample Interactive Component Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  {/* Primary Button */}
                  <button
                    type="button"
                    onClick={() => toast.success('Theme looks great!')}
                    className="px-4 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    style={{
                      backgroundColor: currentPalette.hex,
                      borderRadius: `${Math.max(6, borderRadius - 2)}px`,
                    }}
                  >
                    Save Changes
                  </button>

                  {/* Secondary Outline Button */}
                  <button
                    type="button"
                    className="px-3.5 py-2 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                    style={{
                      borderRadius: `${Math.max(6, borderRadius - 2)}px`,
                    }}
                  >
                    Cancel
                  </button>
                </div>

                {/* Animated GSAP Toggle Live Demo */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    Auto-save:
                  </span>
                  <Toggle
                    checked={previewToggle}
                    onChange={setPreviewToggle}
                    size="sm"
                    color="primary"
                    aria-label="Preview toggle"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-input)] flex items-center justify-between shrink-0">
          <span className="text-xs text-[var(--text-muted)]">
            Changes are saved and applied instantly.
          </span>
          <button
            type="button"
            onClick={closeThemeModal}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
            style={{ backgroundColor: currentPalette.hex }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

export default ThemeSettingsModal;
