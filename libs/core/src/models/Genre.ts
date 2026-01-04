import { z } from 'zod';

/**
 * Genre schema representing a game genre
 */
export const GenreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  iconName: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  gameCount: z.number().int().nonnegative().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Genre = z.infer<typeof GenreSchema>;

/**
 * Create a new Genre with defaults
 */
export function createGenre(data: Partial<Genre> & Pick<Genre, 'id' | 'name' | 'slug'>): Genre {
  const now = new Date();
  return GenreSchema.parse({
    gameCount: 0,
    createdAt: now,
    updatedAt: now,
    ...data,
  });
}

/**
 * Common game genres
 */
export const CommonGenres = {
  ACTION: { name: 'Action', slug: 'action' },
  ADVENTURE: { name: 'Adventure', slug: 'adventure' },
  RPG: { name: 'RPG', slug: 'rpg' },
  PLATFORMER: { name: 'Platformer', slug: 'platformer' },
  PUZZLE: { name: 'Puzzle', slug: 'puzzle' },
  RACING: { name: 'Racing', slug: 'racing' },
  SPORTS: { name: 'Sports', slug: 'sports' },
  FIGHTING: { name: 'Fighting', slug: 'fighting' },
  SHOOTER: { name: 'Shooter', slug: 'shooter' },
  STRATEGY: { name: 'Strategy', slug: 'strategy' },
  SIMULATION: { name: 'Simulation', slug: 'simulation' },
  ARCADE: { name: 'Arcade', slug: 'arcade' },
  HORROR: { name: 'Horror', slug: 'horror' },
  MUSIC: { name: 'Music', slug: 'music' },
  EDUCATIONAL: { name: 'Educational', slug: 'educational' },
  VISUAL_NOVEL: { name: 'Visual Novel', slug: 'visual-novel' },
} as const;
