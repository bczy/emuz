import { z } from 'zod';

/**
 * Collection schema representing a user-created game collection
 */
export const CollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  coverPath: z.string().optional(),
  gameIds: z.array(z.string().uuid()),
  isSystem: z.boolean().default(false), // System collections like "Favorites", "Recently Played"
  sortOrder: z.number().int().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Collection = z.infer<typeof CollectionSchema>;

/**
 * Create a new Collection with defaults
 */
export function createCollection(
  data: Partial<Collection> & Pick<Collection, 'id' | 'name'>
): Collection {
  const now = new Date();
  return CollectionSchema.parse({
    gameIds: [],
    isSystem: false,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    ...data,
  });
}

/**
 * System collection identifiers
 */
export const SystemCollections = {
  FAVORITES: 'favorites',
  RECENTLY_PLAYED: 'recently-played',
  MOST_PLAYED: 'most-played',
} as const;

export type SystemCollection = (typeof SystemCollections)[keyof typeof SystemCollections];
