import { createContext, useState, useEffect, useRef } from 'react';
import { checkColorContrast } from '../utils/contrast';
import {
  LAYOUT_THEMES,
  ACCENT_PALETTES,
  FONT_FAMILIES,
  generatePaletteFromHex,
  hexToRgbTuple,
  pickAccessibleDarkShade,
} from './themeTokens';

export { LAYOUT_THEMES, ACCENT_PALETTES, FONT_FAMILIES, generatePaletteFromHex };
export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('salon_theme_mode') || 'dark');
  const [layoutTheme, setLayoutThemeState] = useState(() => {
    const saved = localStorage.getItem('salon_layout_theme');
    return saved && LAYOUT_THEMES[saved] ? saved : 'classic';
  });
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('salon_accent_color') || 'orange');
  const [customColor, setCustomColor] = useState(() => localStorage.getItem('salon_custom_color') || '#F97316');
  const [density, setDensity] = useState(() => localStorage.getItem('salon_density') || 'tight');
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('salon_font_family') || 'Inter');
  const [borderRadius, setBorderRadius] = useState(() => Number(localStorage.getItem('salon_border_radius')) || 12);
  const [smoothAnimations, setSmoothAnimations] = useState(() => localStorage.getItem('salon_smooth_animations') !== 'false');
  const [boldFocusRings, setBoldFocusRings] = useState(() => localStorage.getItem('salon_bold_focus_rings') === 'true');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const transitionTimerRef = useRef(null);
  const isInitialThemeMount = useRef(true);

  const triggerSmoothThemeTransition = () => {
    if (typeof document === 'undefined') return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!smoothAnimations || prefersReduced) return;

    document.documentElement.classList.add('theme-transitioning');
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 280);
  };

  const setLayoutTheme = (nextTheme) => {
    const resolved = LAYOUT_THEMES[nextTheme] ? nextTheme : 'classic';
    if (resolved !== layoutTheme) {
      triggerSmoothThemeTransition();
    }
    setLayoutThemeState(resolved);
  };

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // Sync layout theme attribute to document
  useEffect(() => {
    localStorage.setItem('salon_layout_theme', layoutTheme);
    document.documentElement.setAttribute('data-layout-theme', layoutTheme);
    if (isInitialThemeMount.current) {
      isInitialThemeMount.current = false;
    }
  }, [layoutTheme]);

  // Sync mode changes to document
  useEffect(() => {
    localStorage.setItem('salon_theme_mode', mode);
    localStorage.setItem('salon_theme', mode === 'auto' ? 'dark' : mode);
    const activeTheme = mode === 'auto' ? 'dark' : mode;
    document.documentElement.setAttribute('data-theme', activeTheme);
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.setProperty('--bg-sidebar', '#0B0B0D');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      const palette =
        accentColor === 'custom'
          ? { shades: generatePaletteFromHex(customColor) }
          : (ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.orange);
      document.documentElement.style.setProperty('--bg-sidebar', palette.shades[950] || '#0F172A');
    }
  }, [mode, accentColor, customColor]);

  // Sync accent color shade scale variables + RGB tuples + Modern Floating sidebar tokens
  useEffect(() => {
    localStorage.setItem('salon_accent_color', accentColor);
    localStorage.setItem('salon_custom_color', customColor);

    const palette =
      accentColor === 'custom'
        ? { name: 'Custom', hex: customColor, shades: generatePaletteFromHex(customColor) }
        : (ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.orange);

    const root = document.documentElement;

    Object.entries(palette.shades).forEach(([shade, hex]) => {
      root.style.setProperty(`--color-primary-${shade}`, hex);
    });

    root.style.setProperty('--color-primary-500-rgb', hexToRgbTuple(palette.shades[500]));
    root.style.setProperty('--color-primary-600-rgb', hexToRgbTuple(palette.shades[600]));
    root.style.setProperty('--color-primary-700-rgb', hexToRgbTuple(palette.shades[700]));

    root.style.setProperty('--primary', palette.shades[500]);
    root.style.setProperty('--primary-hover', palette.shades[600]);
    root.style.setProperty('--primary-light', `${palette.shades[500]}30`);
    root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${palette.shades[500]} 0%, ${palette.shades[700]} 100%)`);
    root.style.setProperty('--shadow-glow', `0 4px 18px ${palette.shades[500]}50`);
    root.style.setProperty('--border-hover', `${palette.shades[500]}80`);

    // WCAG-verified floating sidebar/frame colors derived strictly from active SMS primary palette
    const mfSidebarStart = pickAccessibleDarkShade(palette.shades, [600, 700, 800, 900, 950]);
    const mfSidebarEnd = pickAccessibleDarkShade(palette.shades, [700, 800, 900, 950]);
    const mfAccentContrast = checkColorContrast(palette.shades[600]);
    const mfSidebarActiveText =
      mfAccentContrast.valid && mfAccentContrast.whiteContrast >= 4.5
        ? palette.shades[600]
        : mfSidebarStart;

    root.style.setProperty('--mf-sidebar-start', mfSidebarStart);
    root.style.setProperty('--mf-sidebar-end', mfSidebarEnd);
    root.style.setProperty('--mf-sidebar-active-text', mfSidebarActiveText);

    const isCurrentDark = root.getAttribute('data-theme') === 'dark' || root.classList.contains('dark');
    if (isCurrentDark) {
      root.style.setProperty('--bg-sidebar', '#0B0B0D');
    } else {
      root.style.setProperty('--bg-sidebar', palette.shades[950] || '#0F172A');
    }
  }, [accentColor, customColor, mode]);

  // Sync font family
  useEffect(() => {
    localStorage.setItem('salon_font_family', fontFamily);
    const fontValue = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.Inter;
    document.documentElement.style.setProperty('--font-sans', fontValue);
  }, [fontFamily]);

  // Sync border radius scale
  useEffect(() => {
    localStorage.setItem('salon_border_radius', String(borderRadius));
    const root = document.documentElement;
    root.style.setProperty('--radius-sm', `${Math.max(4, borderRadius - 6)}px`);
    root.style.setProperty('--radius-md', `${Math.max(6, borderRadius - 2)}px`);
    root.style.setProperty('--radius-lg', `${borderRadius}px`);
    root.style.setProperty('--radius-xl', `${borderRadius + 4}px`);
    root.style.setProperty('--radius-2xl', `${borderRadius + 8}px`);
  }, [borderRadius]);

  // Sync density
  useEffect(() => {
    localStorage.setItem('salon_density', density);
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  // Sync smooth animations and bold focus rings
  useEffect(() => {
    localStorage.setItem('salon_smooth_animations', String(smoothAnimations));
    document.documentElement.classList.toggle('smooth-animations', smoothAnimations);
  }, [smoothAnimations]);

  useEffect(() => {
    localStorage.setItem('salon_bold_focus_rings', String(boldFocusRings));
    document.documentElement.classList.toggle('bold-focus-rings', boldFocusRings);
  }, [boldFocusRings]);

  const toggleTheme = () => {
    triggerSmoothThemeTransition();
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        layoutTheme,
        setLayoutTheme,
        theme: mode === 'auto' ? 'dark' : mode,
        isDark: mode !== 'light',
        toggleTheme,
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
        openThemeModal: () => setIsModalOpen(true),
        closeThemeModal: () => setIsModalOpen(false),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
