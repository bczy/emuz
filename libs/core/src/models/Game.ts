import { z } from 'zod';

/**
 * Game schema representing a ROM or game file
 */
export const GameSchema = z.object({
  id: z.string().uuid(),
  platformId: z.string().uuid(),
  title: z.string().min(1),
  filePath: z.string(),
  fileName: z.string(),
  fileSize: z.number().int().nonnegative().optional(),
  fileHash: z.string().optional(),
  coverPath: z.string().optional(),
  description: z.string().optional(),
  developer: z.string().optional(),
  publisher: z.string().optional(),
  releaseDate: z.string().optional(),
  genre: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  playCount: z.number().int().nonnegative().default(0),
  playTime: z.number().int().nonnegative().default(0), // in seconds
  lastPlayedAt: z.date().optional(),
  isFavorite: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Game = z.infer<typeof GameSchema>;

/**
 * Create a new Game with defaults
 */
export function createGame(
  data: Partial<Game> & Pick<Game, 'id' | 'platformId' | 'title' | 'filePath' | 'fileName'>
): Game {
  const now = new Date();
  return GameSchema.parse({
    playCount: 0,
    playTime: 0,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    ...data,
  });
}

/**
 * Game metadata from external sources
 */
export const GameMetadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  developer: z.string().optional(),
  publisher: z.string().optional(),
  releaseDate: z.string().optional(),
  genre: z.string().optional(),
  coverUrl: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
});

export type GameMetadata = z.infer<typeof GameMetadataSchema>;
