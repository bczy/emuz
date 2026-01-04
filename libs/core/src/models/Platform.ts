import { z } from 'zod';

/**
 * Platform schema representing a gaming console or system
 */
export const PlatformSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  shortName: z.string().optional(),
  manufacturer: z.string().optional(),
  generation: z.number().int().optional(),
  releaseYear: z.number().int().min(1970).max(2100).optional(),
  iconPath: z.string().optional(),
  wallpaperPath: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  romExtensions: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Platform = z.infer<typeof PlatformSchema>;

/**
 * Create a new Platform with defaults
 */
export function createPlatform(data: Partial<Platform> & Pick<Platform, 'id' | 'name' | 'romExtensions'>): Platform {
  const now = new Date();
  return PlatformSchema.parse({
    createdAt: now,
    updatedAt: now,
    ...data,
  });
}

/**
 * Platform categories for grouping
 */
export const PlatformCategories = {
  NINTENDO: 'nintendo',
  SONY: 'sony',
  SEGA: 'sega',
  MICROSOFT: 'microsoft',
  ATARI: 'atari',
  NEC: 'nec',
  SNK: 'snk',
  ARCADE: 'arcade',
  COMPUTER: 'computer',
  HANDHELD: 'handheld',
  OTHER: 'other',
} as const;

export type PlatformCategory = (typeof PlatformCategories)[keyof typeof PlatformCategories];
