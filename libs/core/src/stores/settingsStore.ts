/**
 * Settings Store - Manages app settings with Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Theme options
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Grid size options
 */
export type GridSize = 'small' | 'medium' | 'large';

/**
 * Language codes
 */
export type Language = 'en' | 'fr' | 'es' | 'de' | 'ja' | 'zh';

/**
 * Settings state interface
 */
export interface SettingsState {
  // Appearance
  theme: Theme;
  language: Language;
  gridSize: GridSize;
  showGameTitles: boolean;
  showPlatformBadges: boolean;
  
  // Library
  autoScanOnStartup: boolean;
  scanHiddenFiles: boolean;
  scanRecursively: boolean;
  
  // Emulation
  autoSelectEmulator: boolean;
  trackPlayTime: boolean;
  confirmBeforeLaunch: boolean;
  
  // Metadata
  autoFetchMetadata: boolean;
  metadataLanguage: Language;
  downloadCovers: boolean;
  
  // Performance
  enableAnimations: boolean;
  enableVirtualization: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  
  // Paths
  romDirectories: string[];
  coversDirectory: string;
  
  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setGridSize: (size: GridSize) => void;
  setShowGameTitles: (show: boolean) => void;
  setShowPlatformBadges: (show: boolean) => void;
  
  setAutoScanOnStartup: (enabled: boolean) => void;
  setScanHiddenFiles: (enabled: boolean) => void;
  setScanRecursively: (enabled: boolean) => void;
  
  setAutoSelectEmulator: (enabled: boolean) => void;
  setTrackPlayTime: (enabled: boolean) => void;
  setConfirmBeforeLaunch: (enabled: boolean) => void;
  
  setAutoFetchMetadata: (enabled: boolean) => void;
  setMetadataLanguage: (language: Language) => void;
  setDownloadCovers: (enabled: boolean) => void;
  
  setEnableAnimations: (enabled: boolean) => void;
  setEnableVirtualization: (enabled: boolean) => void;
  setImageQuality: (quality: 'low' | 'medium' | 'high') => void;
  
  addRomDirectory: (path: string) => void;
  removeRomDirectory: (path: string) => void;
  setCoversDirectory: (path: string) => void;
  
  resetToDefaults: () => void;
}

/**
 * Default settings
 */
const defaultSettings = {
  theme: 'dark' as Theme,
  language: 'en' as Language,
  gridSize: 'medium' as GridSize,
  showGameTitles: true,
  showPlatformBadges: true,
  autoScanOnStartup: true,
  scanHiddenFiles: false,
  scanRecursively: true,
  autoSelectEmulator: true,
  trackPlayTime: true,
  confirmBeforeLaunch: false,
  autoFetchMetadata: true,
  metadataLanguage: 'en' as Language,
  downloadCovers: true,
  enableAnimations: true,
  enableVirtualization: true,
  imageQuality: 'high' as const,
  romDirectories: [] as string[],
  coversDirectory: '.emuz/covers',
};

/**
 * Settings store
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      ...defaultSettings,

      // Appearance actions
      setTheme: (theme: Theme) => set({ theme }),
      setLanguage: (language: Language) => set({ language }),
      setGridSize: (gridSize: GridSize) => set({ gridSize }),
      setShowGameTitles: (showGameTitles: boolean) => set({ showGameTitles }),
      setShowPlatformBadges: (showPlatformBadges: boolean) => set({ showPlatformBadges }),

      // Library actions
      setAutoScanOnStartup: (autoScanOnStartup: boolean) => set({ autoScanOnStartup }),
      setScanHiddenFiles: (scanHiddenFiles: boolean) => set({ scanHiddenFiles }),
      setScanRecursively: (scanRecursively: boolean) => set({ scanRecursively }),

      // Emulation actions
      setAutoSelectEmulator: (autoSelectEmulator: boolean) => set({ autoSelectEmulator }),
      setTrackPlayTime: (trackPlayTime: boolean) => set({ trackPlayTime }),
      setConfirmBeforeLaunch: (confirmBeforeLaunch: boolean) => set({ confirmBeforeLaunch }),

      // Metadata actions
      setAutoFetchMetadata: (autoFetchMetadata: boolean) => set({ autoFetchMetadata }),
      setMetadataLanguage: (metadataLanguage: Language) => set({ metadataLanguage }),
      setDownloadCovers: (downloadCovers: boolean) => set({ downloadCovers }),

      // Performance actions
      setEnableAnimations: (enableAnimations: boolean) => set({ enableAnimations }),
      setEnableVirtualization: (enableVirtualization: boolean) => set({ enableVirtualization }),
      setImageQuality: (imageQuality: 'low' | 'medium' | 'high') => set({ imageQuality }),

      // Path actions
      addRomDirectory: (path: string) =>
        set((state) => ({
          romDirectories: state.romDirectories.includes(path)
            ? state.romDirectories
            : [...state.romDirectories, path],
        })),
      removeRomDirectory: (path: string) =>
        set((state) => ({
          romDirectories: state.romDirectories.filter((p) => p !== path),
        })),
      setCoversDirectory: (coversDirectory: string) => set({ coversDirectory }),

      // Reset
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'emuz-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
