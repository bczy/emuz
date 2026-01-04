/**
 * EmuZ Theme System
 * Exports all theme-related utilities and values
 */

export * from './tokens';
export * from './dark';
export * from './light';

import { darkTheme, Theme } from './dark';
import { lightTheme } from './light';

/**
 * Available themes
 */
export const themes = {
  dark: darkTheme,
  light: lightTheme,
} as const;

export type ThemeName = keyof typeof themes;

/**
 * Default theme
 */
export const defaultTheme = darkTheme;

/**
 * Get a theme by name
 */
export function getTheme(name: ThemeName): typeof darkTheme | typeof lightTheme {
  return themes[name];
}

/**
 * Check if a value is a valid theme name
 */
export function isValidThemeName(name: string): name is ThemeName {
  return name in themes;
}

export type { Theme };
