import { checkColorContrast } from '../utils/contrast.js';

export const LAYOUT_THEMES = {
  classic: {
    id: 'classic',
    name: 'Classic SMS',
    shortName: 'Classic',
    description: 'Traditional docked sidebar with crisp full-bleed workspace',
  },
  'modern-floating': {
    id: 'modern-floating',
    name: 'Modern Floating Dashboard',
    shortName: 'Modern Floating',
    description: 'Floating rounded sidebar, carved active pill, and airy elevated cards',
  },
};

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

export const hexToRgbTuple = (hex) => {
  if (!hex || typeof hex !== 'string') return '249 115 22';
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return '249 115 22';
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
};

export const pickAccessibleDarkShade = (shades, candidateKeys = [700, 800, 900, 950]) => {
  for (const key of candidateKeys) {
    const hex = shades?.[key];
    if (hex) {
      const { valid, whiteContrast } = checkColorContrast(hex);
      if (valid && whiteContrast >= 4.5) {
        return hex;
      }
    }
  }
  return shades?.[900] || shades?.[950] || '#1E1B4B';
};

export const generatePaletteFromHex = (hex) => {
  if (!hex || typeof hex !== 'string') hex = '#F97316';
  let c = hex.replace('#', '');
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  if (!/^[0-9A-Fa-f]{6}$/.test(c)) c = 'F97316';
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hslToHex = (hue, sat, lig) => {
    let rr;
    let gg;
    let bb;
    if (sat === 0) {
      rr = gg = bb = lig;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = lig < 0.5 ? lig * (1 + sat) : lig + sat - lig * sat;
      const p = 2 * lig - q;
      rr = hue2rgb(p, q, hue + 1 / 3);
      gg = hue2rgb(p, q, hue);
      bb = hue2rgb(p, q, hue - 1 / 3);
    }
    const toHex = (x) => {
      const hx = Math.round(Math.min(255, Math.max(0, x * 255))).toString(16);
      return hx.length === 1 ? '0' + hx : hx;
    };
    return `#${toHex(rr)}${toHex(gg)}${toHex(bb)}`.toUpperCase();
  };

  return {
    50: hslToHex(h, Math.min(1, s * 0.9), 0.96),
    100: hslToHex(h, Math.min(1, s * 0.9), 0.91),
    200: hslToHex(h, Math.min(1, s * 0.92), 0.82),
    300: hslToHex(h, Math.min(1, s * 0.95), 0.71),
    400: hslToHex(h, s, 0.59),
    500: `#${c}`.toUpperCase(),
    600: hslToHex(h, s, Math.max(0.05, l * 0.85)),
    700: hslToHex(h, s, Math.max(0.05, l * 0.7)),
    800: hslToHex(h, s, Math.max(0.04, l * 0.55)),
    900: hslToHex(h, s, Math.max(0.03, l * 0.4)),
    950: hslToHex(h, s, Math.max(0.02, l * 0.22)),
  };
};
