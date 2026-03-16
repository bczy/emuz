import { z } from 'zod';

/**
 * Emulator schema representing an emulator application
 */
export const EmulatorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  platforms: z.array(z.string()),
  executablePath: z.string().optional(),
  packageName: z.string().optional(), // Android package name
  urlScheme: z.string().optional(), // iOS URL scheme
  iconPath: z.string().optional(),
  commandTemplate: z.string().optional(), // e.g., "{exe} -L {core} {rom}"
  corePath: z.string().optional(), // For RetroArch cores
  isDefault: z.boolean().default(false),
  isInstalled: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Emulator = z.infer<typeof EmulatorSchema>;

/**
 * Create a new Emulator with defaults
 */
export function createEmulator(
  data: Partial<Emulator> & Pick<Emulator, 'id' | 'name' | 'platforms'>
): Emulator {
  const now = new Date();
  return EmulatorSchema.parse({
    isDefault: false,
    isInstalled: false,
    createdAt: now,
    updatedAt: now,
    ...data,
  });
}

/**
 * Emulator launch configuration
 */
export const EmulatorLaunchConfigSchema = z.object({
  emulatorId: z.string().uuid(),
  gameId: z.string().uuid(),
  arguments: z.array(z.string()).optional(),
  environment: z.record(z.string(), z.string()).optional(),
});

export type EmulatorLaunchConfig = z.infer<typeof EmulatorLaunchConfigSchema>;

/**
 * Known emulator definitions
 */
export const KnownEmulators = {
  RETROARCH: 'retroarch',
  DOLPHIN: 'dolphin',
  PCSX2: 'pcsx2',
  PPSSPP: 'ppsspp',
  DESMUME: 'desmume',
  MELONDS: 'melonds',
  MGBA: 'mgba',
  CITRA: 'citra',
  YUZU: 'yuzu',
  RYUJINX: 'ryujinx',
  DELTA: 'delta', // iOS
  PROVENANCE: 'provenance', // iOS
} as const;

export type KnownEmulator = (typeof KnownEmulators)[keyof typeof KnownEmulators];
