import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LAYOUT_THEMES,
  ACCENT_PALETTES,
  generatePaletteFromHex,
  hexToRgbTuple,
  pickAccessibleDarkShade,
} from './themeTokens.js';
import { checkColorContrast } from '../utils/contrast.js';

test('LAYOUT_THEMES preserves classic and registers modern-floating', () => {
  assert.equal(LAYOUT_THEMES.classic.id, 'classic');
  assert.equal(LAYOUT_THEMES.classic.name, 'Classic SMS');
  assert.equal(LAYOUT_THEMES['modern-floating'].id, 'modern-floating');
  assert.equal(LAYOUT_THEMES['modern-floating'].name, 'Modern Floating Dashboard');
});

test('hexToRgbTuple converts 6-digit, 3-digit, and invalid hex cleanly', () => {
  assert.equal(hexToRgbTuple('#F97316'), '249 115 22');
  assert.equal(hexToRgbTuple('#fff'), '255 255 255');
  assert.equal(hexToRgbTuple('invalid'), '249 115 22');
});

test('pickAccessibleDarkShade yields >= 4.5 white contrast for all SMS accent palettes', () => {
  for (const [key, palette] of Object.entries(ACCENT_PALETTES)) {
    const chosen = pickAccessibleDarkShade(palette.shades, [700, 800, 900, 950]);
    const contrast = checkColorContrast(chosen);
    assert.equal(contrast.valid, true, `${key} shade should be valid hex`);
    assert.ok(
      contrast.whiteContrast >= 4.5,
      `${key} sidebar shade ${chosen} whiteContrast (${contrast.whiteContrast}) must be >= 4.5`,
    );
  }
});

test('pickAccessibleDarkShade handles ultra-bright custom hex colors safely', () => {
  const brightPalette = generatePaletteFromHex('#FEF08A');
  const chosen = pickAccessibleDarkShade(brightPalette, [700, 800, 900, 950]);
  const contrast = checkColorContrast(chosen);
  assert.equal(contrast.valid, true);
  assert.ok(
    contrast.whiteContrast >= 4.5,
    `bright custom shade ${chosen} whiteContrast (${contrast.whiteContrast}) must be >= 4.5`,
  );
});
