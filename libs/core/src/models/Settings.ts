import { z } from 'zod';

/**
 * Theme options
 */
export const ThemeOptions = {
  DARK: 'dark',
  LIGHT: 'light',
  SYSTEM: 'system',
} as const;

export type ThemeOption = (typeof ThemeOptions)[keyof typeof ThemeOptions];

/**
 * Grid layout options
 */
export const GridLayoutOptions = {
  COMPACT: 'compact',
  COMFORTABLE: 'comfortable',
  SPACIOUS: 'spacious',
} as const;

export type GridLayoutOption = (typeof GridLayoutOptions)[keyof typeof GridLayoutOptions];

/**
 * Sort options for games
 */
export const SortOptions = {
  TITLE_ASC: 'title-asc',
  TITLE_DESC: 'title-desc',
  RECENTLY_ADDED: 'recently-added',
  RECENTLY_PLAYED: 'recently-played',
  MOST_PLAYED: 'most-played',
  RELEASE_DATE: 'release-date',
} as const;

export type SortOption = (typeof SortOptions)[keyof typeof SortOptions];

/**
 * Settings schema representing user preferences
 */
export const SettingsSchema = z.object({
  // Appearance
  theme: z.nativeEnum(ThemeOptions).default('dark'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#10B981'),
  language: z.string().default('en'),

  // Library
  gridLayout: z.nativeEnum(GridLayoutOptions).default('comfortable'),
  defaultSort: z.nativeEnum(SortOptions).default('title-asc'),
  showPlatformBadges: z.boolean().default(true),
  showGameTitles: z.boolean().default(true),

  // Scanning
  scanDirectories: z.array(z.string()),
  autoScanOnStartup: z.boolean().default(true),
  skipHiddenFiles: z.boolean().default(true),

  // Metadata
  autoFetchMetadata: z.boolean().default(true),
  autoDownloadCovers: z.boolean().default(true),
  preferredMetadataLanguage: z.string().default('en'),

  // Emulators
  preferRetroArch: z.boolean().default(false),
  retroArchPath: z.string().optional(),
  retroArchCoresPath: z.string().optional(),

  // Advanced
  enableAnalytics: z.boolean().default(false),
  enableDebugMode: z.boolean().default(false),
});

export type Settings = z.infer<typeof SettingsSchema>;

/**
 * Default settings
 */
export function getDefaultSettings(): Settings {
  return SettingsSchema.parse({
    scanDirectories: [],
  });
}
