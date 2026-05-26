import { describe, it, expect } from 'vitest';
import { v4 as uuid } from 'uuid';
import { GameSchema, createGame, GameMetadataSchema } from '../models/Game';
import { PlatformSchema, createPlatform, PlatformCategories } from '../models/Platform';
import {
  EmulatorSchema,
  createEmulator,
  EmulatorLaunchConfigSchema,
  KnownEmulators,
} from '../models/Emulator';
import { GenreSchema, createGenre, CommonGenres } from '../models/Genre';
import { CollectionSchema, createCollection, SystemCollections } from '../models/Collection';
import {
  SettingsSchema,
  getDefaultSettings,
  ThemeOptions,
  GridLayoutOptions,
  SortOptions,
} from '../models/Settings';
import {
  WidgetSchema,
  createWidget,
  WidgetTypes,
  WidgetSizes,
  RecentGamesWidgetConfigSchema,
  StatsWidgetConfigSchema,
  PlatformShortcutsWidgetConfigSchema,
} from '../models/Widget';

// ─── Game ────────────────────────────────────────────────────────────

describe('GameSchema', () => {
  const validGame = {
    id: uuid(),
    platformId: uuid(),
    title: 'Super Mario Bros',
    filePath: '/roms/mario.nes',
    fileName: 'mario.nes',
    playCount: 5,
    playTime: 3600,
    isFavorite: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('parses a valid game', () => {
    const result = GameSchema.parse(validGame);
    expect(result.title).toBe('Super Mario Bros');
  });

  it('applies defaults for optional numeric fields', () => {
    const minimal = {
      id: uuid(),
      platformId: uuid(),
      title: 'Test',
      filePath: '/a.nes',
      fileName: 'a.nes',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = GameSchema.parse(minimal);
    expect(result.playCount).toBe(0);
    expect(result.playTime).toBe(0);
    expect(result.isFavorite).toBe(false);
  });

  it('rejects empty title', () => {
    expect(() => GameSchema.parse({ ...validGame, title: '' })).toThrow();
  });

  it('rejects negative playCount', () => {
    expect(() => GameSchema.parse({ ...validGame, playCount: -1 })).toThrow();
  });

  it('rejects rating out of range', () => {
    expect(() => GameSchema.parse({ ...validGame, rating: 6 })).toThrow();
    expect(() => GameSchema.parse({ ...validGame, rating: -1 })).toThrow();
  });

  it('accepts rating within range', () => {
    const result = GameSchema.parse({ ...validGame, rating: 4.5 });
    expect(result.rating).toBe(4.5);
  });

  it('accepts optional metadata fields', () => {
    const result = GameSchema.parse({
      ...validGame,
      coverPath: '/covers/mario.png',
      description: 'A classic',
      developer: 'Nintendo',
      publisher: 'Nintendo',
      genre: 'platformer',
    });
    expect(result.developer).toBe('Nintendo');
  });
});

describe('createGame', () => {
  it('creates a game with defaults', () => {
    const game = createGame({
      id: uuid(),
      platformId: uuid(),
      title: 'Zelda',
      filePath: '/roms/zelda.nes',
      fileName: 'zelda.nes',
    });
    expect(game.playCount).toBe(0);
    expect(game.isFavorite).toBe(false);
    expect(game.createdAt).toBeInstanceOf(Date);
    expect(game.updatedAt).toBeInstanceOf(Date);
  });

  it('allows overriding defaults', () => {
    const game = createGame({
      id: uuid(),
      platformId: uuid(),
      title: 'Zelda',
      filePath: '/roms/zelda.nes',
      fileName: 'zelda.nes',
      isFavorite: true,
      playCount: 10,
    });
    expect(game.isFavorite).toBe(true);
    expect(game.playCount).toBe(10);
  });
});

describe('GameMetadataSchema', () => {
  it('parses valid metadata', () => {
    const meta = GameMetadataSchema.parse({
      title: 'Mario',
      description: 'A game',
      coverUrl: 'https://example.com/cover.png',
      rating: 4.5,
    });
    expect(meta.title).toBe('Mario');
  });

  it('rejects invalid URL', () => {
    expect(() => GameMetadataSchema.parse({ coverUrl: 'not-a-url' })).toThrow();
  });

  it('accepts empty object', () => {
    const meta = GameMetadataSchema.parse({});
    expect(meta.title).toBeUndefined();
  });
});

// ─── Platform ────────────────────────────────────────────────────────

describe('PlatformSchema', () => {
  const validPlatform = {
    id: uuid(),
    name: 'NES',
    romExtensions: ['.nes', '.unf'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('parses a valid platform', () => {
    const result = PlatformSchema.parse(validPlatform);
    expect(result.name).toBe('NES');
  });

  it('rejects empty name', () => {
    expect(() => PlatformSchema.parse({ ...validPlatform, name: '' })).toThrow();
  });

  it('validates color format', () => {
    const withColor = PlatformSchema.parse({ ...validPlatform, color: '#FF0000' });
    expect(withColor.color).toBe('#FF0000');

    expect(() => PlatformSchema.parse({ ...validPlatform, color: 'red' })).toThrow();
  });

  it('validates releaseYear range', () => {
    const valid = PlatformSchema.parse({ ...validPlatform, releaseYear: 1985 });
    expect(valid.releaseYear).toBe(1985);

    expect(() => PlatformSchema.parse({ ...validPlatform, releaseYear: 1900 })).toThrow();
  });
});

describe('createPlatform', () => {
  it('creates a platform with timestamps', () => {
    const p = createPlatform({ id: uuid(), name: 'SNES', romExtensions: ['.sfc'] });
    expect(p.createdAt).toBeInstanceOf(Date);
    expect(p.name).toBe('SNES');
  });
});

describe('PlatformCategories', () => {
  it('has expected categories', () => {
    expect(PlatformCategories.NINTENDO).toBe('nintendo');
    expect(PlatformCategories.SONY).toBe('sony');
    expect(PlatformCategories.ARCADE).toBe('arcade');
  });
});

// ─── Emulator ────────────────────────────────────────────────────────

describe('EmulatorSchema', () => {
  const validEmulator = {
    id: uuid(),
    name: 'RetroArch',
    platforms: ['nes', 'snes', 'gba'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('parses a valid emulator', () => {
    const result = EmulatorSchema.parse(validEmulator);
    expect(result.name).toBe('RetroArch');
    expect(result.isDefault).toBe(false);
    expect(result.isInstalled).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = EmulatorSchema.parse({
      ...validEmulator,
      executablePath: '/usr/bin/retroarch',
      commandTemplate: '{exe} -L {core} {rom}',
      corePath: '/cores/nestopia_libretro.so',
      packageName: 'com.retroarch',
      urlScheme: 'retroarch://',
    });
    expect(result.commandTemplate).toBe('{exe} -L {core} {rom}');
  });

  it('rejects empty name', () => {
    expect(() => EmulatorSchema.parse({ ...validEmulator, name: '' })).toThrow();
  });
});

describe('createEmulator', () => {
  it('creates an emulator with defaults', () => {
    const em = createEmulator({ id: uuid(), name: 'Dolphin', platforms: ['gc', 'wii'] });
    expect(em.isDefault).toBe(false);
    expect(em.isInstalled).toBe(false);
    expect(em.createdAt).toBeInstanceOf(Date);
  });
});

describe('EmulatorLaunchConfigSchema', () => {
  it('parses a valid launch config', () => {
    const config = EmulatorLaunchConfigSchema.parse({
      emulatorId: uuid(),
      gameId: uuid(),
      arguments: ['--fullscreen'],
      environment: { HOME: '/tmp' },
    });
    expect(config.arguments).toEqual(['--fullscreen']);
  });
});

describe('KnownEmulators', () => {
  it('contains standard emulators', () => {
    expect(KnownEmulators.RETROARCH).toBe('retroarch');
    expect(KnownEmulators.DOLPHIN).toBe('dolphin');
    expect(KnownEmulators.MGBA).toBe('mgba');
  });
});

// ─── Genre ───────────────────────────────────────────────────────────

describe('GenreSchema', () => {
  const validGenre = {
    id: uuid(),
    name: 'Action',
    slug: 'action',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('parses a valid genre', () => {
    const result = GenreSchema.parse(validGenre);
    expect(result.name).toBe('Action');
    expect(result.gameCount).toBe(0);
  });

  it('validates slug format (lowercase alphanumeric + hyphens)', () => {
    expect(() => GenreSchema.parse({ ...validGenre, slug: 'Invalid Slug!' })).toThrow();

    const ok = GenreSchema.parse({ ...validGenre, slug: 'visual-novel' });
    expect(ok.slug).toBe('visual-novel');
  });

  it('validates color format', () => {
    expect(() => GenreSchema.parse({ ...validGenre, color: 'blue' })).toThrow();

    const ok = GenreSchema.parse({ ...validGenre, color: '#10B981' });
    expect(ok.color).toBe('#10B981');
  });
});

describe('createGenre', () => {
  it('creates a genre with defaults', () => {
    const g = createGenre({ id: uuid(), name: 'RPG', slug: 'rpg' });
    expect(g.gameCount).toBe(0);
    expect(g.createdAt).toBeInstanceOf(Date);
  });
});

describe('CommonGenres', () => {
  it('has expected genre entries', () => {
    expect(CommonGenres.ACTION.slug).toBe('action');
    expect(CommonGenres.RPG.slug).toBe('rpg');
    expect(CommonGenres.VISUAL_NOVEL.slug).toBe('visual-novel');
  });

  it('all slugs match the slug regex', () => {
    const slugRegex = /^[a-z0-9-]+$/;
    for (const genre of Object.values(CommonGenres)) {
      expect(genre.slug).toMatch(slugRegex);
    }
  });
});

// ─── Collection ──────────────────────────────────────────────────────

describe('CollectionSchema', () => {
  const validCollection = {
    id: uuid(),
    name: 'My Favorites',
    gameIds: [uuid(), uuid()],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('parses a valid collection', () => {
    const result = CollectionSchema.parse(validCollection);
    expect(result.name).toBe('My Favorites');
    expect(result.isSystem).toBe(false);
    expect(result.sortOrder).toBe(0);
  });

  it('rejects empty name', () => {
    expect(() => CollectionSchema.parse({ ...validCollection, name: '' })).toThrow();
  });

  it('rejects non-UUID gameIds', () => {
    expect(() => CollectionSchema.parse({ ...validCollection, gameIds: ['not-a-uuid'] })).toThrow();
  });
});

describe('createCollection', () => {
  it('creates a collection with defaults', () => {
    const c = createCollection({ id: uuid(), name: 'RPGs' });
    expect(c.gameIds).toEqual([]);
    expect(c.isSystem).toBe(false);
    expect(c.sortOrder).toBe(0);
  });
});

describe('SystemCollections', () => {
  it('has expected system collections', () => {
    expect(SystemCollections.FAVORITES).toBe('favorites');
    expect(SystemCollections.RECENTLY_PLAYED).toBe('recently-played');
    expect(SystemCollections.MOST_PLAYED).toBe('most-played');
  });
});

// ─── Settings ────────────────────────────────────────────────────────

describe('SettingsSchema', () => {
  it('parses with all defaults when given minimal input', () => {
    const settings = SettingsSchema.parse({ scanDirectories: [] });
    expect(settings.theme).toBe('dark');
    expect(settings.language).toBe('en');
    expect(settings.gridLayout).toBe('comfortable');
    expect(settings.autoFetchMetadata).toBe(true);
  });

  it('rejects invalid accent color', () => {
    expect(() => SettingsSchema.parse({ scanDirectories: [], accentColor: 'green' })).toThrow();
  });

  it('accepts valid hex accent color', () => {
    const s = SettingsSchema.parse({ scanDirectories: [], accentColor: '#FF5733' });
    expect(s.accentColor).toBe('#FF5733');
  });

  it('rejects invalid theme value', () => {
    expect(() => SettingsSchema.parse({ scanDirectories: [], theme: 'neon' })).toThrow();
  });
});

describe('getDefaultSettings', () => {
  it('returns valid default settings', () => {
    const defaults = getDefaultSettings();
    expect(defaults.theme).toBe('dark');
    expect(defaults.scanDirectories).toEqual([]);
    expect(defaults.accentColor).toBe('#10B981');
    expect(defaults.showPlatformBadges).toBe(true);
    expect(defaults.autoScanOnStartup).toBe(true);
  });
});

describe('ThemeOptions', () => {
  it('has dark, light, system', () => {
    expect(ThemeOptions.DARK).toBe('dark');
    expect(ThemeOptions.LIGHT).toBe('light');
    expect(ThemeOptions.SYSTEM).toBe('system');
  });
});

describe('GridLayoutOptions', () => {
  it('has compact, comfortable, spacious', () => {
    expect(GridLayoutOptions.COMPACT).toBe('compact');
    expect(GridLayoutOptions.COMFORTABLE).toBe('comfortable');
    expect(GridLayoutOptions.SPACIOUS).toBe('spacious');
  });
});

describe('SortOptions', () => {
  it('has all sort options', () => {
    expect(SortOptions.TITLE_ASC).toBe('title-asc');
    expect(SortOptions.RECENTLY_PLAYED).toBe('recently-played');
    expect(SortOptions.MOST_PLAYED).toBe('most-played');
  });
});

// ─── Widget ──────────────────────────────────────────────────────────

describe('WidgetSchema', () => {
  const validWidget = {
    id: uuid(),
    type: 'recent_games',
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('parses a valid widget', () => {
    const result = WidgetSchema.parse(validWidget);
    expect(result.type).toBe('recent_games');
    expect(result.size).toBe('medium');
    expect(result.isVisible).toBe(true);
  });

  it('rejects invalid widget type', () => {
    expect(() => WidgetSchema.parse({ ...validWidget, type: 'unknown_widget' })).toThrow();
  });

  it('rejects negative position', () => {
    expect(() => WidgetSchema.parse({ ...validWidget, position: -1 })).toThrow();
  });
});

describe('createWidget', () => {
  it('creates a widget with defaults', () => {
    const w = createWidget({ id: uuid(), type: 'favorites', position: 1 });
    expect(w.size).toBe('medium');
    expect(w.isVisible).toBe(true);
    expect(w.createdAt).toBeInstanceOf(Date);
  });

  it('allows overriding size and visibility', () => {
    const w = createWidget({
      id: uuid(),
      type: 'stats',
      position: 0,
      size: 'large',
      isVisible: false,
    });
    expect(w.size).toBe('large');
    expect(w.isVisible).toBe(false);
  });
});

describe('WidgetTypes', () => {
  it('has all expected widget types', () => {
    expect(WidgetTypes.RECENT_GAMES).toBe('recent_games');
    expect(WidgetTypes.FAVORITES).toBe('favorites');
    expect(WidgetTypes.STATS).toBe('stats');
    expect(WidgetTypes.BY_GENRE).toBe('by_genre');
  });
});

describe('WidgetSizes', () => {
  it('has all sizes', () => {
    expect(WidgetSizes.SMALL).toBe('small');
    expect(WidgetSizes.MEDIUM).toBe('medium');
    expect(WidgetSizes.LARGE).toBe('large');
    expect(WidgetSizes.FULL).toBe('full');
  });
});

describe('RecentGamesWidgetConfigSchema', () => {
  it('parses with defaults', () => {
    const c = RecentGamesWidgetConfigSchema.parse({});
    expect(c.limit).toBe(8);
    expect(c.showPlatformBadge).toBe(true);
  });

  it('rejects limit out of range', () => {
    expect(() => RecentGamesWidgetConfigSchema.parse({ limit: 0 })).toThrow();
    expect(() => RecentGamesWidgetConfigSchema.parse({ limit: 25 })).toThrow();
  });
});

describe('StatsWidgetConfigSchema', () => {
  it('parses with defaults', () => {
    const c = StatsWidgetConfigSchema.parse({});
    expect(c.showTotalGames).toBe(true);
    expect(c.showTotalPlayTime).toBe(true);
    expect(c.showMostPlayed).toBe(true);
  });
});

describe('PlatformShortcutsWidgetConfigSchema', () => {
  it('parses valid config', () => {
    const ids = [uuid(), uuid()];
    const c = PlatformShortcutsWidgetConfigSchema.parse({
      platformIds: ids,
    });
    expect(c.platformIds).toEqual(ids);
    expect(c.showGameCount).toBe(true);
  });

  it('rejects non-UUID platform IDs', () => {
    expect(() => PlatformShortcutsWidgetConfigSchema.parse({ platformIds: ['bad'] })).toThrow();
  });
});
