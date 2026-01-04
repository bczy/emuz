/**
 * useSettings hook - Provides settings access with persistence
 */

import { useSettingsStore } from '../stores/settingsStore';
import type { Theme, GridSize, Language } from '../stores/settingsStore';

/**
 * Hook return type
 */
export interface UseSettingsReturn {
  // Appearance
  theme: Theme;
  language: Language;
  gridSize: GridSize;
  showGameTitles: boolean;
  showPlatformBadges: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setGridSize: (size: GridSize) => void;
  toggleGameTitles: () => void;
  togglePlatformBadges: () => void;
  
  // Library settings
  autoScanOnStartup: boolean;
  romDirectories: string[];
  addRomDirectory: (path: string) => void;
  removeRomDirectory: (path: string) => void;
  
  // Performance
  enableAnimations: boolean;
  toggleAnimations: () => void;
  
  // Reset
  resetToDefaults: () => void;
}

/**
 * Settings hook for accessing app settings
 */
export function useSettings(): UseSettingsReturn {
  const store = useSettingsStore();

  return {
    // Appearance
    theme: store.theme,
    language: store.language,
    gridSize: store.gridSize,
    showGameTitles: store.showGameTitles,
    showPlatformBadges: store.showPlatformBadges,

    // Actions
    setTheme: store.setTheme,
    setLanguage: store.setLanguage,
    setGridSize: store.setGridSize,
    toggleGameTitles: () => store.setShowGameTitles(!store.showGameTitles),
    togglePlatformBadges: () => store.setShowPlatformBadges(!store.showPlatformBadges),

    // Library settings
    autoScanOnStartup: store.autoScanOnStartup,
    romDirectories: store.romDirectories,
    addRomDirectory: store.addRomDirectory,
    removeRomDirectory: store.removeRomDirectory,

    // Performance
    enableAnimations: store.enableAnimations,
    toggleAnimations: () => store.setEnableAnimations(!store.enableAnimations),

    // Reset
    resetToDefaults: store.resetToDefaults,
  };
}
