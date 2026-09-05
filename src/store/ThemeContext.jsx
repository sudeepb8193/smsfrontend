import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext(null);

export const ACCENT_PALETTES = {
  burgundy: {
    name: 'Burgundy',
    hex: '#8A4A52',
    shades: {
      50: '#FAF0F2',
      100: '#F5E1E5',
      200: '#E9C4CB',
      300: '#D79AA4',
      400: '#BF6E7C',
      500: '#8A4A52',
      600: '#753C44',
      700: '#602F36',
      800: '#4E262C',
      900: '#3D1F24',
      950: '#21141A',
    },
  },
  blue: {
    name: 'Blue',
    hex: '#2563EB',
    shades: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#2563EB',
      600: '#1D4ED8',
      700: '#1E40AF',
      800: '#1E3A8A',
      900: '#172554',
      950: '#0B132B',
    },
  },
  emerald: {
    name: 'Emerald',
    hex: '#10B981',
    shades: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
      950: '#022C22',
    },
  },
  amber: {
    name: 'Amber',
    hex: '#F59E0B',
    shades: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03',
    },
  },
  orange: {
    name: 'Orange',
    hex: '#F97316',
    shades: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316',
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
      950: '#431407',
    },
  },
  rose: {
    name: 'Rose',
    hex: '#F43F5E',
    shades: {
      50: '#FFF1F2',
      100: '#FFE4E6',
      200: '#FECDD3',
      300: '#FDA4AF',
      400: '#FB7185',
      500: '#F43F5E',
      600: '#E11D48',
      700: '#BE123C',
      800: '#9F1239',
      900: '#881337',
      950: '#4C0519',
    },
  },
  purple: {
    name: 'Purple',
    hex: '#A855F7',
    shades: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#A855F7',
      600: '#9333EA',
      700: '#7E22CE',
      800: '#6B21A8',
      900: '#581C87',
      950: '#3B0764',
    },
  },
  violet: {
    name: 'Violet',
    hex: '#8B5CF6',
    shades: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6',
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
      950: '#2E1065',
    },
  },
  cyan: {
    name: 'Cyan',
    hex: '#06B6D4',
    shades: {
      50: '#ECFEFF',
      100: '#CFFAFE',
      200: '#A5F3FC',
      300: '#67E8F9',
      400: '#22D3EE',
      500: '#06B6D4',
      600: '#0891B2',
      700: '#0E7490',
      800: '#155E75',
      900: '#164E63',
      950: '#083344',
    },
  },
  coral: {
    name: 'Coral',
    hex: '#FF6B6B',
    shades: {
      50: '#FFF0F0',
      100: '#FFE0E0',
      200: '#FFC2C2',
      300: '#FFA1A1',
      400: '#FF8080',
      500: '#FF6B6B',
      600: '#E64A4A',
      700: '#C43131',
      800: '#A02222',
      900: '#801616',
      950: '#4D0808',
    },
  },
};

export const FONT_FAMILIES = {
  Inter: "'Inter', system-ui, -apple-system, sans-serif",
  Roboto: "'Roboto', system-ui, -apple-system, sans-serif",
  Outfit: "'Outfit', system-ui, -apple-system, sans-serif",
  'Plus Jakarta Sans': "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  'SF Pro': "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('salon_theme_mode') || 'dark');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('salon_accent_color') || 'burgundy');
  const [density, setDensity] = useState(() => localStorage.getItem('salon_density') || 'tight');
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('salon_font_family') || 'Inter');
  const [borderRadius, setBorderRadius] = useState(() => Number(localStorage.getItem('salon_border_radius')) || 12);
  const [smoothAnimations, setSmoothAnimations] = useState(() => localStorage.getItem('salon_smooth_animations') !== 'false');
  const [boldFocusRings, setBoldFocusRings] = useState(() => localStorage.getItem('salon_bold_focus_rings') === 'true');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync mode changes to document
  useEffect(() => {
    localStorage.setItem('salon_theme_mode', mode);
    localStorage.setItem('salon_theme', mode === 'auto' ? 'dark' : mode);
    const activeTheme = mode === 'auto' ? 'dark' : mode;
    document.documentElement.setAttribute('data-theme', activeTheme);
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  // Sync accent color shade scale variables
  useEffect(() => {
    localStorage.setItem('salon_accent_color', accentColor);
    const palette = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.burgundy;
    const root = document.documentElement;

    Object.entries(palette.shades).forEach(([shade, hex]) => {
      root.style.setProperty(`--color-primary-${shade}`, hex);
    });

    root.style.setProperty('--primary', palette.shades[500]);
    root.style.setProperty('--primary-hover', palette.shades[600]);
    root.style.setProperty('--primary-light', `${palette.shades[500]}30`);
    root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${palette.shades[500]} 0%, ${palette.shades[700]} 100%)`);
    root.style.setProperty('--shadow-glow', `0 4px 18px ${palette.shades[500]}50`);
    root.style.setProperty('--border-hover', `${palette.shades[500]}80`);
  }, [accentColor]);

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
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        theme: mode === 'auto' ? 'dark' : mode,
        isDark: mode !== 'light',
        toggleTheme,
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
        openThemeModal: () => setIsModalOpen(true),
        closeThemeModal: () => setIsModalOpen(false),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
