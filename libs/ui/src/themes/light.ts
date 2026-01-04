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
    background: colors.slate[50],
    backgroundSecondary: colors.white,
    backgroundTertiary: colors.slate[100],
    
    // Surface
    surface: colors.white,
    surfaceHover: colors.slate[50],
    surfaceActive: colors.slate[100],
    
    // Primary (Emerald Green)
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    primaryActive: colors.primary[700],
    primaryMuted: colors.primary[500] + '15',
    
    // Accent
    accent: colors.primary[500],
    accentHover: colors.primary[600],
    
    // Text
    textPrimary: colors.slate[900],
    textSecondary: colors.slate[700],
    textTertiary: colors.slate[500],
    textMuted: colors.slate[400],
    textInverse: colors.white,
    textOnPrimary: colors.white,
    
    // Border
    border: colors.slate[200],
    borderHover: colors.slate[300],
    borderFocus: colors.primary[500],
    
    // Semantic
    success: colors.success,
    successMuted: colors.success + '15',
    warning: colors.warning,
    warningMuted: colors.warning + '15',
    error: colors.error,
    errorMuted: colors.error + '15',
    info: colors.info,
    infoMuted: colors.info + '15',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.4)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
    
    // Skeleton/Loading
    skeleton: colors.slate[200],
    skeletonHighlight: colors.slate[100],
    
    // Scrollbar
    scrollbar: colors.slate[300],
    scrollbarHover: colors.slate[400],
    
    // Platform specific
    platformNintendo: '#E60012',
    platformSony: '#003087',
    platformSega: '#0060A8',
    platformMicrosoft: '#107C10',
    platformAtari: '#E40000',
    platformNeoGeo: '#FFD700',
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
      mono: [
        'SF Mono',
        'Consolas',
        'Liberation Mono',
        'Menlo',
        'monospace',
      ].join(', '),
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
      background: colors.slate[100],
      text: colors.slate[900],
      placeholder: colors.slate[400],
      icon: colors.slate[500],
    },
  },
} as const;

export type LightTheme = typeof lightTheme;
