import { z } from 'zod';

/**
 * Widget types for the home screen (Daijishou-inspired)
 */
export const WidgetTypes = {
  RECENT_GAMES: 'recent_games',
  FAVORITES: 'favorites',
  PLATFORM_SHORTCUTS: 'platform_shortcuts',
  STATS: 'stats',
  CONTINUE_PLAYING: 'continue_playing',
  RANDOM_PICKS: 'random_picks',
  BY_GENRE: 'by_genre',
} as const;

export type WidgetType = (typeof WidgetTypes)[keyof typeof WidgetTypes];

/**
 * Widget sizes
 */
export const WidgetSizes = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  FULL: 'full',
} as const;

export type WidgetSize = (typeof WidgetSizes)[keyof typeof WidgetSizes];

/**
 * Widget schema representing a home screen widget
 */
export const WidgetSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(WidgetTypes),
  title: z.string().optional(),
  size: z.nativeEnum(WidgetSizes).default('medium'),
  position: z.number().int().nonnegative(),
  config: z.record(z.string(), z.unknown()).optional(), // Widget-specific configuration
  isVisible: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Widget = z.infer<typeof WidgetSchema>;

/**
 * Create a new Widget with defaults
 */
export function createWidget(
  data: Partial<Widget> & Pick<Widget, 'id' | 'type' | 'position'>
): Widget {
  const now = new Date();
  return WidgetSchema.parse({
    size: 'medium',
    isVisible: true,
    createdAt: now,
    updatedAt: now,
    ...data,
  });
}

/**
 * Widget configuration schemas for specific widget types
 */
export const RecentGamesWidgetConfigSchema = z.object({
  limit: z.number().int().min(1).max(20).default(8),
  showPlatformBadge: z.boolean().default(true),
});

export type RecentGamesWidgetConfig = z.infer<typeof RecentGamesWidgetConfigSchema>;

export const StatsWidgetConfigSchema = z.object({
  showTotalGames: z.boolean().default(true),
  showTotalPlayTime: z.boolean().default(true),
  showMostPlayed: z.boolean().default(true),
});

export type StatsWidgetConfig = z.infer<typeof StatsWidgetConfigSchema>;

export const PlatformShortcutsWidgetConfigSchema = z.object({
  platformIds: z.array(z.string().uuid()),
  showGameCount: z.boolean().default(true),
});

export type PlatformShortcutsWidgetConfig = z.infer<typeof PlatformShortcutsWidgetConfigSchema>;
