/**
 * Theme system tests
 */

import { describe, it, expect } from 'vitest';
import { themes, darkTheme, lightTheme, getTheme, isValidThemeName, defaultTheme } from '../themes';

describe('Theme Objects', () => {
  it('should export darkTheme', () => {
    expect(darkTheme).toBeDefined();
    expect(darkTheme.name).toBe('dark');
  });

  it('should export lightTheme', () => {
    expect(lightTheme).toBeDefined();
    expect(lightTheme.name).toBe('light');
  });

  it('should have both themes in themes object', () => {
    expect(themes.dark).toBe(darkTheme);
    expect(themes.light).toBe(lightTheme);
  });

  it('should use dark theme as default', () => {
    expect(defaultTheme).toBe(darkTheme);
  });
});

describe('Theme Structure', () => {
  it('should have required properties in dark theme', () => {
    expect(darkTheme.name).toBeDefined();
    expect(darkTheme.colors).toBeDefined();
    expect(darkTheme.typography).toBeDefined();
    expect(darkTheme.spacing).toBeDefined();
    expect(darkTheme.components).toBeDefined();
  });

  it('should have required properties in light theme', () => {
    expect(lightTheme.name).toBeDefined();
    expect(lightTheme.colors).toBeDefined();
    expect(lightTheme.typography).toBeDefined();
    expect(lightTheme.spacing).toBeDefined();
    expect(lightTheme.components).toBeDefined();
  });

  it('should have primary color in both themes', () => {
    expect(darkTheme.colors.brand.primary).toBeDefined();
    expect(lightTheme.colors.brand.primary).toBeDefined();
  });

  it('should have background colors in both themes', () => {
    expect(darkTheme.colors.background).toBeDefined();
    expect(lightTheme.colors.background).toBeDefined();
  });

  it('should have text colors in both themes', () => {
    expect(darkTheme.colors.text.primary).toBeDefined();
    expect(lightTheme.colors.text.primary).toBeDefined();
  });
});

describe('Theme Helpers', () => {
  it('should get theme by name', () => {
    const dark = getTheme('dark');
    const light = getTheme('light');

    expect(dark).toBe(darkTheme);
    expect(light).toBe(lightTheme);
  });

  it('should validate theme names', () => {
    expect(isValidThemeName('dark')).toBe(true);
    expect(isValidThemeName('light')).toBe(true);
    expect(isValidThemeName('invalid')).toBe(false);
    expect(isValidThemeName('')).toBe(false);
  });
});

describe('Color Tokens', () => {
  it('should have emerald green as primary (Daijishou style)', () => {
    // Primary should be emerald green (#10B981)
    expect(darkTheme.colors.brand.primary).toContain('10B981');
  });

  it('should have consistent spacing values', () => {
    expect(darkTheme.spacing).toBeDefined();
    expect(typeof darkTheme.spacing).toBe('object');
  });

  it('should have typography settings', () => {
    expect(darkTheme.typography).toBeDefined();
    expect(darkTheme.typography.fontFamily).toBeDefined();
  });
});

describe('Component Styles', () => {
  it('should have button component styles', () => {
    expect(darkTheme.components.button).toBeDefined();
    expect(lightTheme.components.button).toBeDefined();
  });

  it('should have card component styles', () => {
    expect(darkTheme.components.card).toBeDefined();
    expect(lightTheme.components.card).toBeDefined();
  });
});
