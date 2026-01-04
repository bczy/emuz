/**
 * Theme Provider
 * Manages light/dark theme state and CSS variables
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useSettingsStore, type Theme } from '@emuz/core';
import { themes, type ThemeColors } from '@emuz/ui';

interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Apply theme colors as CSS variables
 */
function applyTheme(theme: Theme): ThemeColors {
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const colors = isDark ? themes.dark : themes.light;
  
  // Apply CSS variables to document root
  const root = document.documentElement;
  
  // Background colors
  root.style.setProperty('--bg-primary', colors.background.primary);
  root.style.setProperty('--bg-secondary', colors.background.secondary);
  root.style.setProperty('--bg-tertiary', colors.background.tertiary);
  
  // Text colors
  root.style.setProperty('--text-primary', colors.text.primary);
  root.style.setProperty('--text-secondary', colors.text.secondary);
  root.style.setProperty('--text-tertiary', colors.text.tertiary);
  root.style.setProperty('--text-muted', colors.text.muted);
  root.style.setProperty('--text-inverse', colors.text.inverse);
  
  // Brand colors
  root.style.setProperty('--color-primary', colors.brand.primary);
  root.style.setProperty('--color-secondary', colors.brand.secondary);
  root.style.setProperty('--color-accent', colors.brand.accent);
  
  // Border
  root.style.setProperty('--border', colors.border.default);
  root.style.setProperty('--border-light', colors.border.light);
  root.style.setProperty('--border-focus', colors.border.focus);
  
  // Status colors
  root.style.setProperty('--color-success', colors.status.success);
  root.style.setProperty('--color-error', colors.status.error);
  root.style.setProperty('--color-warning', colors.status.warning);
  root.style.setProperty('--color-info', colors.status.info);
  
  // Component-specific
  root.style.setProperty('--skeleton', colors.components.skeleton);
  root.style.setProperty('--sidebar-bg', colors.components.sidebar.background);
  root.style.setProperty('--gamecard-bg', colors.components.gameCard.background);
  root.style.setProperty('--gamecard-border', colors.components.gameCard.border);
  root.style.setProperty('--input-bg', colors.components.input.background);
  root.style.setProperty('--input-border', colors.components.input.border);
  
  return colors;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme, setTheme } = useSettingsStore();
  const [colors, setColors] = React.useState<ThemeColors>(() => applyTheme(theme));
  
  // Apply theme on mount and changes
  useEffect(() => {
    const newColors = applyTheme(theme);
    setColors(newColors);
    
    // Update body background
    document.body.style.backgroundColor = newColors.background.primary;
    document.body.style.color = newColors.text.primary;
  }, [theme]);
  
  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const newColors = applyTheme('system');
      setColors(newColors);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  const value: ThemeContextValue = {
    theme,
    colors,
    setTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
