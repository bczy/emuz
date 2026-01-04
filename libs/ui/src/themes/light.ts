/**
 * EmuZ Light Theme
 * Alternative theme for the application
 */

import { colors, shadows, borderRadius, spacing, fontSizes } from './tokens';

export const lightTheme = {
  name: 'light' as const,

  // Base colors
  colors: {
    // Background
    background: {
      primary: colors.slate[50],
      secondary: colors.white,
      tertiary: colors.slate[100],
    },

    // Surface
    surface: {
      default: colors.white,
      hover: colors.slate[50],
      active: colors.slate[100],
    },

    // Brand colors
    brand: {
      primary: colors.primary[500],
      secondary: colors.primary[600],
      accent: colors.primary[500],
      hover: colors.primary[600],
      active: colors.primary[700],
      muted: colors.primary[500] + '15',
    },

    // Text
    text: {
      primary: colors.slate[900],
      secondary: colors.slate[700],
      tertiary: colors.slate[500],
      muted: colors.slate[400],
      inverse: colors.white,
      onPrimary: colors.white,
    },

    // Border
    border: {
      default: colors.slate[200],
      light: colors.slate[300],
      focus: colors.primary[500],
    },

    // Status colors
    status: {
      success: colors.success,
      successMuted: colors.success + '15',
      warning: colors.warning,
      warningMuted: colors.warning + '15',
      error: colors.error,
      errorMuted: colors.error + '15',
      info: colors.info,
      infoMuted: colors.info + '15',
    },

    // Overlay
    overlay: {
      default: 'rgba(0, 0, 0, 0.4)',
      light: 'rgba(0, 0, 0, 0.2)',
    },

    // Scrollbar
    scrollbar: {
      default: colors.slate[300],
      hover: colors.slate[400],
    },

    // Platform specific
    platforms: {
      nintendo: '#E60012',
      sony: '#003087',
      sega: '#0060A8',
      microsoft: '#107C10',
      atari: '#E40000',
      neoGeo: '#FFD700',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'sans-serif',
      ].join(', '),
      mono: ['SF Mono', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'].join(', '),
    },
    sizes: fontSizes,
  },

  // Spacing
  spacing,

  // Border radius
  borderRadius,

  // Shadows (lighter for light theme)
  shadows: {
    ...shadows,
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    modal: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 15,
    },
    gameCard: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    gameCardHover: {
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  // Component specific
  components: {
    skeleton: colors.slate[200],
    button: {
      primary: {
        background: colors.primary[500],
        text: colors.white,
        border: 'transparent',
        hoverBackground: colors.primary[600],
        activeBackground: colors.primary[700],
      },
      secondary: {
        background: colors.white,
        text: colors.slate[700],
        border: colors.slate[300],
        hoverBackground: colors.slate[50],
        activeBackground: colors.slate[100],
      },
      ghost: {
        background: 'transparent',
        text: colors.slate[600],
        border: 'transparent',
        hoverBackground: colors.slate[100],
        activeBackground: colors.slate[200],
      },
      danger: {
        background: colors.error,
        text: colors.white,
        border: 'transparent',
        hoverBackground: '#DC2626',
        activeBackground: '#B91C1C',
      },
    },
    card: {
      background: colors.white,
      border: colors.slate[200],
      hoverBorder: colors.primary[400],
    },
    input: {
      background: colors.white,
      text: colors.slate[900],
      placeholder: colors.slate[400],
      border: colors.slate[300],
      focusBorder: colors.primary[500],
    },
    sidebar: {
      background: colors.white,
      itemHover: colors.slate[100],
      itemActive: colors.primary[500] + '15',
      itemActiveText: colors.primary[600],
    },
    gameCard: {
      background: colors.white,
      border: colors.slate[200],
      hoverBorder: colors.primary[400],
      platformBadge: colors.slate[100] + 'EE',
    },
    widget: {
      background: colors.white,
      border: colors.slate[200],
      headerBorder: colors.slate[100],
    },
    bottomTab: {
      background: colors.white,
      inactiveColor: colors.slate[400],
      activeColor: colors.primary[500],
      border: colors.slate[200],
    },
    searchBar: {
      background: colors.white,
      text: colors.slate[900],
      placeholder: colors.slate[400],
      icon: colors.slate[500],
    },
  },
} as const;

export type LightTheme = typeof lightTheme;
