/**
 * settingsStore — unit tests
 *
 * Tests: default values, setters, ROM directory management, reset
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '../stores/settingsStore';

// ---------------------------------------------------------------------------
// localStorage stub
// ---------------------------------------------------------------------------

const localStorageStub: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  length: 0,
  key: () => null,
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageStub,
  writable: true,
});

// ---------------------------------------------------------------------------
// Reset helper
// ---------------------------------------------------------------------------

function resetStore(): void {
  useSettingsStore.getState().resetToDefaults();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('settingsStore — defaults', () => {
  beforeEach(resetStore);

  it('has dark theme by default', () => {
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('has English language by default', () => {
    expect(useSettingsStore.getState().language).toBe('en');
  });

  it('has medium grid size by default', () => {
    expect(useSettingsStore.getState().gridSize).toBe('medium');
  });

  it('has empty romDirectories by default', () => {
    expect(useSettingsStore.getState().romDirectories).toEqual([]);
  });

  it('has animations enabled by default', () => {
    expect(useSettingsStore.getState().enableAnimations).toBe(true);
  });
});

describe('settingsStore — appearance', () => {
  beforeEach(resetStore);

  it('setTheme updates theme', () => {
    useSettingsStore.getState().setTheme('light');
    expect(useSettingsStore.getState().theme).toBe('light');
  });

  it('setLanguage updates language', () => {
    useSettingsStore.getState().setLanguage('fr');
    expect(useSettingsStore.getState().language).toBe('fr');
  });

  it('setGridSize updates gridSize', () => {
    useSettingsStore.getState().setGridSize('large');
    expect(useSettingsStore.getState().gridSize).toBe('large');
  });

  it('setShowGameTitles updates showGameTitles', () => {
    useSettingsStore.getState().setShowGameTitles(false);
    expect(useSettingsStore.getState().showGameTitles).toBe(false);
  });

  it('setShowPlatformBadges updates showPlatformBadges', () => {
    useSettingsStore.getState().setShowPlatformBadges(false);
    expect(useSettingsStore.getState().showPlatformBadges).toBe(false);
  });
});

describe('settingsStore — ROM directories', () => {
  beforeEach(resetStore);

  it('addRomDirectory adds a path', () => {
    useSettingsStore.getState().addRomDirectory('/home/roms');
    expect(useSettingsStore.getState().romDirectories).toContain('/home/roms');
  });

  it('addRomDirectory does not duplicate existing paths', () => {
    useSettingsStore.getState().addRomDirectory('/home/roms');
    useSettingsStore.getState().addRomDirectory('/home/roms');
    expect(useSettingsStore.getState().romDirectories).toHaveLength(1);
  });

  it('addRomDirectory allows multiple distinct paths', () => {
    useSettingsStore.getState().addRomDirectory('/home/roms');
    useSettingsStore.getState().addRomDirectory('/media/games');
    expect(useSettingsStore.getState().romDirectories).toHaveLength(2);
  });

  it('removeRomDirectory removes a path', () => {
    useSettingsStore.getState().addRomDirectory('/home/roms');
    useSettingsStore.getState().addRomDirectory('/media/games');
    useSettingsStore.getState().removeRomDirectory('/home/roms');
    expect(useSettingsStore.getState().romDirectories).not.toContain('/home/roms');
    expect(useSettingsStore.getState().romDirectories).toContain('/media/games');
  });

  it('removeRomDirectory on non-existent path is a no-op', () => {
    useSettingsStore.getState().addRomDirectory('/home/roms');
    useSettingsStore.getState().removeRomDirectory('/does/not/exist');
    expect(useSettingsStore.getState().romDirectories).toHaveLength(1);
  });
});

describe('settingsStore — performance', () => {
  beforeEach(resetStore);

  it('setEnableAnimations updates enableAnimations', () => {
    useSettingsStore.getState().setEnableAnimations(false);
    expect(useSettingsStore.getState().enableAnimations).toBe(false);
  });

  it('setImageQuality updates imageQuality', () => {
    useSettingsStore.getState().setImageQuality('low');
    expect(useSettingsStore.getState().imageQuality).toBe('low');
  });
});

describe('settingsStore — reset', () => {
  beforeEach(resetStore);

  it('resetToDefaults restores all defaults', () => {
    useSettingsStore.getState().setTheme('light');
    useSettingsStore.getState().setLanguage('ja');
    useSettingsStore.getState().addRomDirectory('/home/roms');
    useSettingsStore.getState().resetToDefaults();

    const s = useSettingsStore.getState();
    expect(s.theme).toBe('dark');
    expect(s.language).toBe('en');
    expect(s.romDirectories).toEqual([]);
  });
});
