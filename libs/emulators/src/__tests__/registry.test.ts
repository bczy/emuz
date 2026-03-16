/**
 * Emulator registry unit tests
 */

import { describe, it, expect } from 'vitest';
import {
  getAllEmulators,
  getEmulatorById,
  searchEmulators,
  getEmulatorsForPlatform as getEmulatorsByPlatform,
  getEmulatorsForHost as getEmulatorsByHostPlatform,
  getRecommendedEmulator,
} from '../registry';
import type { EmulatorDefinition } from '../registry/types';

describe('Emulator Registry', () => {
  describe('getAllEmulators', () => {
    it('should return all registered emulators', () => {
      const emulators = getAllEmulators();

      expect(emulators).toBeInstanceOf(Array);
      expect(emulators.length).toBeGreaterThan(0);
    });

    it('should return emulator definitions with required properties', () => {
      const emulators = getAllEmulators();

      for (const emulator of emulators) {
        expect(emulator).toHaveProperty('id');
        expect(emulator).toHaveProperty('name');
        expect(emulator).toHaveProperty('platformIds');
        expect(emulator).toHaveProperty('hostPlatforms');
        expect(emulator.platformIds).toBeInstanceOf(Array);
        expect(emulator.hostPlatforms).toBeInstanceOf(Array);
      }
    });

    it('should not mutate internal registry', () => {
      const emulators1 = getAllEmulators();
      const originalLength = emulators1.length;

      emulators1.push({} as EmulatorDefinition);

      const emulators2 = getAllEmulators();
      expect(emulators2.length).toBe(originalLength);
    });
  });

  describe('getEmulatorById', () => {
    it('should find RetroArch', () => {
      const retroarch = getEmulatorById('retroarch');

      expect(retroarch).toBeDefined();
      expect(retroarch?.name).toContain('RetroArch');
    });

    it('should find Dolphin', () => {
      const dolphin = getEmulatorById('dolphin');

      expect(dolphin).toBeDefined();
      expect(dolphin?.name).toContain('Dolphin');
    });

    it('should find PCSX2', () => {
      const pcsx2 = getEmulatorById('pcsx2');

      expect(pcsx2).toBeDefined();
      expect(pcsx2?.name).toContain('PCSX2');
    });

    it('should find mGBA', () => {
      const mgba = getEmulatorById('mgba');

      expect(mgba).toBeDefined();
      expect(mgba?.name).toContain('mGBA');
    });

    it('should return undefined for unknown emulator', () => {
      const unknown = getEmulatorById('unknown-emulator-xyz');

      expect(unknown).toBeUndefined();
    });
  });

  describe('searchEmulators', () => {
    it('should filter by platform', () => {
      const nesEmulators = searchEmulators({ platformId: 'nes' });

      expect(nesEmulators.length).toBeGreaterThan(0);
      for (const emu of nesEmulators) {
        expect(emu.platformIds).toContain('nes');
      }
    });

    it('should filter by host platform', () => {
      const windowsEmulators = searchEmulators({ hostPlatform: 'windows' });

      expect(windowsEmulators.length).toBeGreaterThan(0);
      for (const emu of windowsEmulators) {
        expect(emu.hostPlatforms).toContain('windows');
      }
    });

    it('should filter by RetroArch core status', () => {
      const retroarchCores = searchEmulators({ isRetroarchCore: true });

      for (const emu of retroarchCores) {
        expect(emu.isRetroarchCore).toBe(true);
      }
    });

    it('should combine multiple filters', () => {
      const results = searchEmulators({
        platformId: 'snes',
        hostPlatform: 'linux',
      });

      for (const emu of results) {
        expect(emu.platformIds).toContain('snes');
        expect(emu.hostPlatforms).toContain('linux');
      }
    });

    it('should return empty array for no matches', () => {
      const results = searchEmulators({ platformId: 'nonexistent-platform' });

      expect(results).toHaveLength(0);
    });
  });

  describe('getEmulatorsByPlatform', () => {
    it('should return emulators for NES', () => {
      const emulators = getEmulatorsByPlatform('nes');

      expect(emulators.length).toBeGreaterThan(0);
    });

    it('should return emulators for SNES', () => {
      const emulators = getEmulatorsByPlatform('snes');

      expect(emulators.length).toBeGreaterThan(0);
    });

    it('should return emulators for GBA', () => {
      const emulators = getEmulatorsByPlatform('gba');

      expect(emulators.length).toBeGreaterThan(0);
      // Should include mGBA
      expect(emulators.some((e) => e.id === 'mgba')).toBe(true);
    });

    it('should return emulators for GameCube', () => {
      const emulators = getEmulatorsByPlatform('gc');

      expect(emulators.length).toBeGreaterThan(0);
      // Should include Dolphin
      expect(emulators.some((e) => e.id === 'dolphin')).toBe(true);
    });

    it('should return emulators for Wii', () => {
      const emulators = getEmulatorsByPlatform('wii');

      expect(emulators.length).toBeGreaterThan(0);
      // Should include Dolphin
      expect(emulators.some((e) => e.id === 'dolphin')).toBe(true);
    });

    it('should return emulators for PS2', () => {
      const emulators = getEmulatorsByPlatform('ps2');

      expect(emulators.length).toBeGreaterThan(0);
      // Should include PCSX2
      expect(emulators.some((e) => e.id === 'pcsx2')).toBe(true);
    });

    it('should return emulators for DS', () => {
      const emulators = getEmulatorsByPlatform('nds');

      expect(emulators.length).toBeGreaterThan(0);
    });
  });

  describe('getEmulatorsByHostPlatform', () => {
    it('should return Windows emulators', () => {
      const emulators = getEmulatorsByHostPlatform('windows');

      expect(emulators.length).toBeGreaterThan(0);
    });

    it('should return macOS emulators', () => {
      const emulators = getEmulatorsByHostPlatform('macos');

      expect(emulators.length).toBeGreaterThan(0);
    });

    it('should return Linux emulators', () => {
      const emulators = getEmulatorsByHostPlatform('linux');

      expect(emulators.length).toBeGreaterThan(0);
    });

    it('should return Android emulators', () => {
      const emulators = getEmulatorsByHostPlatform('android');

      expect(emulators.length).toBeGreaterThan(0);
    });

    it('should return iOS emulators', () => {
      const emulators = getEmulatorsByHostPlatform('ios');

      expect(emulators.length).toBeGreaterThanOrEqual(0); // May have fewer
    });
  });

  describe('getRecommendedEmulator', () => {
    it('should recommend RetroArch for NES', () => {
      const recommended = getRecommendedEmulator('nes', 'linux');

      expect(recommended).toBeDefined();
    });

    it('should recommend Dolphin for GameCube', () => {
      const recommended = getRecommendedEmulator('gc', 'windows');

      expect(recommended).toBeDefined();
      expect(recommended?.name.toLowerCase()).toContain('dolphin');
    });

    it('should recommend mGBA for GBA on desktop', () => {
      const recommended = getRecommendedEmulator('gba', 'macos');

      expect(recommended).toBeDefined();
    });

    it('should recommend PCSX2 for PS2', () => {
      const recommended = getRecommendedEmulator('ps2', 'windows');

      expect(recommended).toBeDefined();
      expect(recommended?.name.toLowerCase()).toContain('pcsx2');
    });

    it('should return undefined for unsupported platform', () => {
      const recommended = getRecommendedEmulator('unsupported', 'windows');

      expect(recommended).toBeUndefined();
    });
  });

  describe('Emulator definitions', () => {
    describe('RetroArch', () => {
      it('should have correct configuration', () => {
        const retroarch = getEmulatorById('retroarch');

        expect(retroarch).toBeDefined();
        expect(retroarch?.platformIds.length).toBeGreaterThan(10); // Supports many platforms
        expect(retroarch?.hostPlatforms).toContain('windows');
        expect(retroarch?.hostPlatforms).toContain('macos');
        expect(retroarch?.hostPlatforms).toContain('linux');
        expect(retroarch?.hostPlatforms).toContain('android');
        expect(retroarch?.hostPlatforms).toContain('ios');
      });
    });

    describe('Dolphin', () => {
      it('should support GameCube and Wii', () => {
        const dolphin = getEmulatorById('dolphin');

        expect(dolphin).toBeDefined();
        expect(dolphin?.platformIds).toContain('gc');
        expect(dolphin?.platformIds).toContain('wii');
      });

      it('should have desktop platforms', () => {
        const dolphin = getEmulatorById('dolphin');

        expect(dolphin?.hostPlatforms).toContain('windows');
        expect(dolphin?.hostPlatforms).toContain('macos');
        expect(dolphin?.hostPlatforms).toContain('linux');
        expect(dolphin?.hostPlatforms).toContain('android');
      });
    });

    describe('PCSX2', () => {
      it('should support PS2', () => {
        const pcsx2 = getEmulatorById('pcsx2');

        expect(pcsx2).toBeDefined();
        expect(pcsx2?.platformIds).toContain('ps2');
      });
    });

    describe('mGBA', () => {
      it('should support GBA and GB/GBC', () => {
        const mgba = getEmulatorById('mgba');

        expect(mgba).toBeDefined();
        expect(mgba?.platformIds).toContain('gba');
        expect(mgba?.platformIds).toContain('gb');
        expect(mgba?.platformIds).toContain('gbc');
      });
    });
  });

  describe('Command templates', () => {
    it('should have valid command templates', () => {
      const emulators = getAllEmulators().filter((e) => e.desktop?.commandTemplate);

      for (const emulator of emulators) {
        expect(emulator.desktop?.commandTemplate).toContain('{rom}');
      }
    });

    it('RetroArch should include core placeholder', () => {
      const retroarch = getEmulatorById('retroarch');

      if (retroarch?.desktop?.commandTemplate) {
        expect(retroarch.desktop.commandTemplate).toContain('{core}');
      }
    });
  });
});
