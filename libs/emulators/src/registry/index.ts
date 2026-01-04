/**
 * Emulator registry - central database of known emulators
 */

import type { EmulatorDefinition, EmulatorSearchCriteria, HostPlatform } from './types';
export * from './types';

// Import all emulator definitions
import { allRetroarch } from './retroarch';
import { allDolphin } from './dolphin';
import { allPcsx2 } from './pcsx2';
import { allDsEmulators } from './desmume';
import { allMgba } from './mgba';

/**
 * All registered emulators
 */
export const emulatorRegistry: EmulatorDefinition[] = [
  ...allRetroarch,
  ...allDolphin,
  ...allPcsx2,
  ...allDsEmulators,
  ...allMgba,
];

/**
 * Get all emulator definitions
 */
export function getAllEmulators(): EmulatorDefinition[] {
  return [...emulatorRegistry];
}

/**
 * Get an emulator by ID
 */
export function getEmulatorById(id: string): EmulatorDefinition | undefined {
  return emulatorRegistry.find((e) => e.id === id);
}

/**
 * Search emulators by criteria
 */
export function searchEmulators(criteria: EmulatorSearchCriteria): EmulatorDefinition[] {
  let results = [...emulatorRegistry];

  if (criteria.platformId) {
    results = results.filter((e) => e.platformIds.includes(criteria.platformId!));
  }

  if (criteria.hostPlatform) {
    results = results.filter((e) => e.hostPlatforms.includes(criteria.hostPlatform!));
  }

  if (criteria.isRetroarchCore !== undefined) {
    results = results.filter((e) => Boolean(e.isRetroarchCore) === criteria.isRetroarchCore);
  }

  return results;
}

/**
 * Get emulators for a specific gaming platform
 */
export function getEmulatorsForPlatform(platformId: string): EmulatorDefinition[] {
  return emulatorRegistry.filter((e) => e.platformIds.includes(platformId));
}

/**
 * Get emulators available on a specific host platform
 */
export function getEmulatorsForHost(hostPlatform: HostPlatform): EmulatorDefinition[] {
  return emulatorRegistry.filter((e) => e.hostPlatforms.includes(hostPlatform));
}

/**
 * Get standalone (non-RetroArch) emulators
 */
export function getStandaloneEmulators(): EmulatorDefinition[] {
  return emulatorRegistry.filter((e) => !e.isRetroarchCore && e.id !== 'retroarch');
}

/**
 * Get RetroArch cores
 */
export function getRetroarchCores(): EmulatorDefinition[] {
  return emulatorRegistry.filter((e) => e.isRetroarchCore);
}

/**
 * Get recommended emulator for a platform
 * Returns the first standalone emulator or RetroArch core for the platform
 */
export function getRecommendedEmulator(
  platformId: string,
  hostPlatform: HostPlatform
): EmulatorDefinition | undefined {
  const candidates = emulatorRegistry.filter(
    (e) => e.platformIds.includes(platformId) && e.hostPlatforms.includes(hostPlatform)
  );

  // Prefer standalone emulators over RetroArch cores
  const standalone = candidates.find((e) => !e.isRetroarchCore);
  if (standalone) return standalone;

  // Fall back to first RetroArch core
  return candidates.find((e) => e.isRetroarchCore);
}
