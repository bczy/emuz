import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  FIRST_RUN: '@emuz/first_run',
  SETTINGS: '@emuz/settings',
  ROM_FOLDERS: '@emuz/rom_folders',
  THEME: '@emuz/theme',
  GRID_COLUMNS: '@emuz/grid_columns',
  LAST_SYNC: '@emuz/last_sync',
  EMULATOR_PREFS: '@emuz/emulator_prefs',
} as const;

/**
 * ROM folder configuration
 */
export interface ROMFolder {
  id: string;
  path: string;
  name: string;
  platformId?: string;
  enabled: boolean;
  lastScanned?: Date;
  gameCount?: number;
}

/**
 * Emulator preference
 */
export interface EmulatorPreference {
  platformId: string;
  emulatorId: string;
}

/**
 * StorageService - Persistent storage for app settings and preferences
 */
export class StorageService {
  /**
   * Check if this is the first run
   */
  async isFirstRun(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_RUN);
    return value !== 'false';
  }

  /**
   * Mark first run as complete
   */
  async completeFirstRun(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_RUN, 'false');
  }

  /**
   * Get stored settings
   */
  async getSettings<T>(defaultValue: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return value ? JSON.parse(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Save settings
   */
  async saveSettings(settings: Record<string, unknown>): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  /**
   * Get ROM folders
   */
  async getROMFolders(): Promise<ROMFolder[]> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ROM_FOLDERS);
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save ROM folders
   */
  async saveROMFolders(folders: ROMFolder[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ROM_FOLDERS, JSON.stringify(folders));
  }

  /**
   * Add a ROM folder
   */
  async addROMFolder(folder: Omit<ROMFolder, 'id'>): Promise<ROMFolder> {
    const folders = await this.getROMFolders();
    const newFolder: ROMFolder = {
      ...folder,
      id: Date.now().toString(),
    };
    folders.push(newFolder);
    await this.saveROMFolders(folders);
    return newFolder;
  }

  /**
   * Remove a ROM folder
   */
  async removeROMFolder(id: string): Promise<void> {
    const folders = await this.getROMFolders();
    const filtered = folders.filter((f) => f.id !== id);
    await this.saveROMFolders(filtered);
  }

  /**
   * Update a ROM folder
   */
  async updateROMFolder(id: string, updates: Partial<ROMFolder>): Promise<void> {
    const folders = await this.getROMFolders();
    const index = folders.findIndex((f) => f.id === id);
    if (index !== -1) {
      folders[index] = { ...folders[index], ...updates };
      await this.saveROMFolders(folders);
    }
  }

  /**
   * Get theme preference
   */
  async getTheme(): Promise<'dark' | 'light' | 'system'> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return (value as 'dark' | 'light' | 'system') || 'dark';
  }

  /**
   * Set theme preference
   */
  async setTheme(theme: 'dark' | 'light' | 'system'): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  /**
   * Get grid columns preference
   */
  async getGridColumns(): Promise<number> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.GRID_COLUMNS);
    return value ? parseInt(value, 10) : 3;
  }

  /**
   * Set grid columns preference
   */
  async setGridColumns(columns: number): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.GRID_COLUMNS, columns.toString());
  }

  /**
   * Get last sync timestamp
   */
  async getLastSync(): Promise<Date | null> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return value ? new Date(value) : null;
  }

  /**
   * Set last sync timestamp
   */
  async setLastSync(date: Date): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, date.toISOString());
  }

  /**
   * Get emulator preferences
   */
  async getEmulatorPreferences(): Promise<EmulatorPreference[]> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.EMULATOR_PREFS);
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }

  /**
   * Set default emulator for a platform
   */
  async setDefaultEmulator(platformId: string, emulatorId: string): Promise<void> {
    const prefs = await this.getEmulatorPreferences();
    const index = prefs.findIndex((p) => p.platformId === platformId);
    
    if (index !== -1) {
      prefs[index].emulatorId = emulatorId;
    } else {
      prefs.push({ platformId, emulatorId });
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.EMULATOR_PREFS, JSON.stringify(prefs));
  }

  /**
   * Get default emulator for a platform
   */
  async getDefaultEmulator(platformId: string): Promise<string | null> {
    const prefs = await this.getEmulatorPreferences();
    const pref = prefs.find((p) => p.platformId === platformId);
    return pref?.emulatorId || null;
  }

  /**
   * Clear all stored data
   */
  async clearAll(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  }

  /**
   * Get storage size estimate
   */
  async getStorageSize(): Promise<number> {
    const keys = await AsyncStorage.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length * 2; // Approximate bytes (UTF-16)
      }
    }

    return totalSize;
  }
}

// Singleton instance
export const storageService = new StorageService();
