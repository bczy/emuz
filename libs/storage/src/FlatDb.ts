import { CollectionStore } from './Collection.js';
import { CollectionGameStore } from './CollectionGame.js';
import { loadPlatformSeeds } from './seed.js';
import type { FileIO, FlatDb as IFlatDb } from './types.js';
import type {
  PlatformRow,
  GameRow,
  EmulatorRow,
  CollectionRow,
  WidgetRow,
  GenreRow,
  SettingsRow,
  ScanDirectoryRow,
  PlaySessionRow,
} from './rows.js';

/**
 * Creates a FlatDb instance backed by JSON files in `dataDir`.
 *
 * Call `open()` before accessing any store.
 */
export function createFlatDb(dataDir: string, io: FileIO): IFlatDb {
  const j = (...parts: string[]) => io.joinPath(...parts);

  const platforms = new CollectionStore<PlatformRow>(j(dataDir, 'platforms.json'), io);
  const games = new CollectionStore<GameRow>(j(dataDir, 'games.json'), io);
  const emulators = new CollectionStore<EmulatorRow>(j(dataDir, 'emulators.json'), io);
  const collections = new CollectionStore<CollectionRow>(j(dataDir, 'collections.json'), io);
  const collectionGames = new CollectionGameStore(j(dataDir, 'collection_games.json'), io);
  const widgets = new CollectionStore<WidgetRow>(j(dataDir, 'widgets.json'), io);
  const genres = new CollectionStore<GenreRow>(j(dataDir, 'genres.json'), io);
  const settings = new CollectionStore<SettingsRow>(j(dataDir, 'settings.json'), io, 'key');
  const scanDirectories = new CollectionStore<ScanDirectoryRow>(
    j(dataDir, 'scan_directories.json'),
    io
  );
  const playSessions = new CollectionStore<PlaySessionRow>(j(dataDir, 'play_sessions.json'), io);

  const allStores: Array<{ flush(): Promise<void>; load(): Promise<void> }> = [
    platforms,
    games,
    emulators,
    collections,
    collectionGames,
    widgets,
    genres,
    settings,
    scanDirectories,
    playSessions,
  ];

  return {
    platforms,
    games,
    emulators,
    collections,
    collectionGames,
    widgets,
    genres,
    settings,
    scanDirectories,
    playSessions,

    async open(): Promise<void> {
      await io.mkdir(dataDir);
      await Promise.all(allStores.map((s) => s.load()));
      loadPlatformSeeds(platforms);
    },

    async flush(): Promise<void> {
      await Promise.all(allStores.map((s) => s.flush()));
    },

    async close(): Promise<void> {
      await Promise.all(allStores.map((s) => s.flush()));
    },
  };
}
