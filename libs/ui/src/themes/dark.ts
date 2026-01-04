/**
 * EmuZ Dark Theme
 * Primary theme for the application
 */

import { colors, shadows, borderRadius, spacing, fontSizes } from './tokens';

export const darkTheme = {
  name: 'dark' as const,

  // Base colors
  colors: {
    // Background
    background: {
      primary: colors.slate[900],
      secondary: colors.slate[800],
      tertiary: colors.slate[700],
    },

    // Surface
    surface: {
      default: colors.slate[800],
      hover: colors.slate[700],
      active: colors.slate[600],
    },

    // Brand colors
    brand: {
      primary: colors.primary[500],
      secondary: colors.primary[400],
      accent: colors.primary[400],
      hover: colors.primary[400],
      active: colors.primary[600],
      muted: colors.primary[500] + '20', // 12% opacity
    },

    // Text
    text: {
      primary: colors.slate[50],
      secondary: colors.slate[300],
      tertiary: colors.slate[400],
      muted: colors.slate[500],
      inverse: colors.slate[900],
      onPrimary: colors.white,
    },

    // Border
    border: {
      default: colors.slate[700],
      light: colors.slate[600],
      focus: colors.primary[500],
    },

    // Status colors
    status: {
      success: colors.success,
      successMuted: colors.success + '20',
      warning: colors.warning,
      warningMuted: colors.warning + '20',
      error: colors.error,
      errorMuted: colors.error + '20',
      info: colors.info,
      infoMuted: colors.info + '20',
    },

    // Overlay
    overlay: {
      default: 'rgba(0, 0, 0, 0.6)',
      light: 'rgba(0, 0, 0, 0.3)',
    },

    // Scrollbar
    scrollbar: {
      default: colors.slate[600],
      hover: colors.slate[500],
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

  // Shadows (darker for dark theme)
  shadows: {
    ...shadows,
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    modal: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 25,
      elevation: 20,
    },
    gameCard: {
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    gameCardHover: {
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Component specific
  components: {
    skeleton: colors.slate[700],
    button: {
      primary: {
        background: colors.primary[500],
        text: colors.white,
        border: 'transparent',
        hoverBackground: colors.primary[400],
        activeBackground: colors.primary[600],
      },
      secondary: {
        background: colors.slate[700],
        text: colors.slate[100],
        border: colors.slate[600],
        hoverBackground: colors.slate[600],
        activeBackground: colors.slate[500],
      },
      ghost: {
        background: 'transparent',
        text: colors.slate[300],
        border: 'transparent',
        hoverBackground: colors.slate[800],
        activeBackground: colors.slate[700],
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
      background: colors.slate[800],
      border: colors.slate[700],
      hoverBorder: colors.primary[500],
    },
    input: {
      background: colors.slate[800],
      text: colors.slate[100],
      placeholder: colors.slate[500],
      border: colors.slate[600],
      focusBorder: colors.primary[500],
    },
    sidebar: {
      background: colors.slate[800],
      itemHover: colors.slate[700],
      itemActive: colors.primary[500] + '20',
      itemActiveText: colors.primary[400],
    },
    gameCard: {
      background: colors.slate[800],
      border: colors.slate[700],
      hoverBorder: colors.primary[500],
      platformBadge: colors.slate[900] + 'CC',
    },
    widget: {
      background: colors.slate[800],
      border: colors.slate[700],
      headerBorder: colors.slate[600],
    },
    bottomTab: {
      background: colors.slate[900],
      inactiveColor: colors.slate[500],
      activeColor: colors.primary[400],
      border: colors.slate[800],
    },
    searchBar: {
      background: colors.slate[800],
      text: colors.slate[100],
      placeholder: colors.slate[500],
      icon: colors.slate[400],
    },
  },
} as const;

export type Theme = typeof darkTheme;
export type ThemeColors = typeof darkTheme.colors;
