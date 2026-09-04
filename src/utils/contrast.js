/**
 * Calculate WCAG AA contrast ratio between a hex color and white/black text.
 */
function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return null;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r, g, b];
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function checkColorContrast(hexColor) {
  if (!hexColor || !/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
    return { valid: false, whiteContrast: 0, darkContrast: 0, warning: null };
  }

  const rgb = hexToRgb(hexColor);
  if (!rgb) return { valid: false, whiteContrast: 0, darkContrast: 0, warning: null };

  const bgLuminance = getLuminance(...rgb);
  const whiteLuminance = getLuminance(255, 255, 255);
  const darkLuminance = getLuminance(30, 41, 59);

  const whiteContrast = (Math.max(bgLuminance, whiteLuminance) + 0.05) / (Math.min(bgLuminance, whiteLuminance) + 0.05);
  const darkContrast = (Math.max(bgLuminance, darkLuminance) + 0.05) / (Math.min(bgLuminance, darkLuminance) + 0.05);

  let warning = null;
  if (whiteContrast < 4.5 && darkContrast < 4.5) {
    warning = 'Color may not provide sufficient contrast (WCAG AA ratio < 4.5) against light or dark text.';
  } else if (whiteContrast < 4.5) {
    warning = 'Low contrast against white text. Recommended ratio is at least 4.5:1.';
  }

  return {
    valid: true,
    whiteContrast: parseFloat(whiteContrast.toFixed(2)),
    darkContrast: parseFloat(darkContrast.toFixed(2)),
    warning,
    recommendedText: whiteContrast >= darkContrast ? '#ffffff' : '#1e293b',
  };
}
