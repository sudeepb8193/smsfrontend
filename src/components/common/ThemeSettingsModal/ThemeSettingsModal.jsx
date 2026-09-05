import React from 'react';
import { X, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { FONT_FAMILIES } from '../../../store/ThemeContext';

export const ThemeSettingsModal = () => {
  const {
    mode,
    setMode,
    accentColor,
    setAccentColor,
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

  if (!isModalOpen) return null;

  const accentList = [
    { key: 'blue', name: 'Blue', color: '#2563EB' },
    { key: 'emerald', name: 'Emerald', color: '#10B981' },
    { key: 'amber', name: 'Amber', color: '#F59E0B' },
    { key: 'orange', name: 'Orange', color: '#F97316' },
    { key: 'rose', name: 'Rose', color: '#F43F5E' },
    { key: 'purple', name: 'Purple', color: '#A855F7' },
    { key: 'violet', name: 'Violet', color: '#8B5CF6' },
    { key: 'cyan', name: 'Cyan', color: '#06B6D4' },
    { key: 'coral', name: 'Coral', color: '#FF6B6B' },
    { key: 'burgundy', name: 'Burgundy', color: '#8A4A52' },
  ];

  const densityOptions = [
    { key: 'relaxed', label: 'Relaxed' },
    { key: 'standard', label: 'Standard' },
    { key: 'tight', label: 'Tight' },
  ];

  const radiusValues = [4, 8, 12, 16];

  return (
    <>
      {/* Semi-transparent Backdrop Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeThemeModal}
      />

      {/* Top-Right Side Floating Modal Container */}
      <div
        className="fixed top-16 right-4 sm:right-6 z-50 w-full max-w-md bg-[#181920]/98 border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-white transition-all duration-200 ease-out transform animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-2 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Themes
            </h2>
            <p className="text-xs text-white/60 mt-1">
              Customize the visual style of your workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={closeThemeModal}
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-none">
          {/* 1. Theme Mode Switcher (Auto / Light / Dark) */}
          <div className="bg-[#121319] p-1.5 rounded-full border border-white/5 flex items-center justify-between">
            {['auto', 'light', 'dark'].map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold capitalize transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-primary-500/80 to-primary-600/90 text-white shadow-lg shadow-primary-500/30 border border-white/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* 2. Accent Color Swatches */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white/80 block">Accent color</label>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
              {accentList.map((acc) => {
                const isSelected = accentColor === acc.key;
                return (
                  <div key={acc.key} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setAccentColor(acc.key)}
                      style={{ backgroundColor: acc.color }}
                      className={`w-8 h-8 rounded-full transition-all transform duration-200 flex items-center justify-center ${
                        isSelected
                          ? 'ring-4 ring-offset-2 ring-offset-[#181920] ring-primary-500 scale-110 shadow-lg'
                          : 'opacity-85 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      {isSelected && <Check size={14} className="text-white drop-shadow-md" />}
                    </button>
                    {isSelected && (
                      <span className="text-[10px] font-medium text-white/90 animate-fadeIn">
                        {acc.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Density Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/80">Density</label>
            </div>
            <div className="space-y-2">
              <div className="relative w-full flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="50"
                  value={
                    density === 'relaxed' ? 0 : density === 'standard' ? 50 : 100
                  }
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val === 0) setDensity('relaxed');
                    else if (val === 50) setDensity('standard');
                    else setDensity('tight');
                  }}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium text-white/50">
                {densityOptions.map((d) => (
                  <span
                    key={d.key}
                    onClick={() => setDensity(d.key)}
                    className={`cursor-pointer transition ${
                      density === d.key ? 'text-primary-400 font-bold' : 'hover:text-white'
                    }`}
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Font Family Selector */}
          <div className="space-y-2">
            <div className="relative">
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-4 py-3 bg-[#121319] border border-white/10 rounded-2xl text-xs font-medium text-white appearance-none focus:outline-none focus:border-primary-500 transition cursor-pointer"
              >
                {Object.keys(FONT_FAMILIES).map((font) => (
                  <option key={font} value={font} className="bg-[#181920] text-white">
                    {font}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
              />
            </div>
          </div>

          {/* 5. Corner Radius Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-white/80 block">Corner radius</label>
            <div className="space-y-2">
              <input
                type="range"
                min="4"
                max="16"
                step="4"
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex items-center justify-between text-[11px] font-medium text-white/50">
                {radiusValues.map((val) => (
                  <span
                    key={val}
                    onClick={() => setBorderRadius(val)}
                    className={`cursor-pointer transition ${
                      borderRadius === val ? 'text-primary-400 font-bold' : 'hover:text-white'
                    }`}
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Feature Toggles */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            {/* Smooth Animations Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Smooth animations</div>
                <div className="text-[11px] text-white/50">
                  Enable fluid transitions for design elements.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSmoothAnimations(!smoothAnimations)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  smoothAnimations ? 'bg-primary-500 justify-end' : 'bg-white/15 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition duration-200" />
              </button>
            </div>

            {/* Bold Focus Rings Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Bold focus rings</div>
                <div className="text-[11px] text-white/50">
                  Increase visibility of selected layers and tools.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBoldFocusRings(!boldFocusRings)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  boldFocusRings ? 'bg-primary-500 justify-end' : 'bg-white/15 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition duration-200" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThemeSettingsModal;
