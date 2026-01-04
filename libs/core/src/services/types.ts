/**
 * Service types and interfaces for @emuz/core
 */

import type { Game, GameMetadata } from '../models/Game';
import type { Platform } from '../models/Platform';
import type { Emulator } from '../models/Emulator';
import type { Collection } from '../models/Collection';
import type { Widget } from '../models/Widget';
import type { Genre } from '../models/Genre';

/**
 * Pagination options
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

/**
 * Sort configuration for queries
 */
export interface SortConfig<T> {
  field: keyof T;
  order: 'asc' | 'desc';
}

/**
 * Search options
 */
export interface SearchOptions extends PaginationOptions {
  platformId?: string;
  genreId?: string;
  favorite?: boolean;
}

/**
 * Create collection input
 */
export interface CreateCollectionInput {
  name: string;
  description?: string;
  coverPath?: string;
  isSystem?: boolean;
}

/**
 * Create emulator input
 */
export interface CreateEmulatorInput {
  name: string;
  platformIds: string[];
  executablePath?: string;
  packageName?: string;
  urlScheme?: string;
  iconPath?: string;
  commandTemplate?: string;
  corePath?: string;
}

/**
 * Scan options for ROM directories
 */
export interface ScanOptions {
  recursive?: boolean;
  platformId?: string;
  includeHidden?: boolean;
}

/**
 * Scan progress update
 */
export interface ScanProgress {
  phase: 'scanning' | 'identifying' | 'complete' | 'error';
  currentPath?: string;
  filesFound: number;
  filesProcessed: number;
  gamesAdded: number;
  gamesUpdated: number;
  errors: string[];
}

/**
 * ROM directory configuration
 */
export interface RomDirectory {
  id: string;
  path: string;
  platformId?: string;
  recursive: boolean;
  enabled: boolean;
  lastScanned?: Date;
  createdAt: Date;
}

/**
 * Metadata progress update
 */
export interface MetadataProgress {
  phase: 'searching' | 'downloading' | 'complete' | 'error';
  gameId: string;
  gamesProcessed: number;
  gamesTotal: number;
  found: number;
  notFound: number;
  errors: string[];
}

/**
 * Library service interface
 */
export interface ILibraryService {
  // Games
  getAllGames(options?: PaginationOptions): Promise<Game[]>;
  getGameById(id: string): Promise<Game | null>;
  getGamesByPlatform(platformId: string, options?: PaginationOptions): Promise<Game[]>;
  searchGames(query: string, options?: SearchOptions): Promise<Game[]>;
  updateGame(id: string, data: Partial<Game>): Promise<void>;
  deleteGame(id: string): Promise<void>;
  getGameCount(): Promise<number>;
  getRecentGames(limit?: number): Promise<Game[]>;

  // Collections
  getCollections(): Promise<Collection[]>;
  createCollection(data: CreateCollectionInput): Promise<Collection>;
  deleteCollection(id: string): Promise<void>;
  addToCollection(gameId: string, collectionId: string): Promise<void>;
  removeFromCollection(gameId: string, collectionId: string): Promise<void>;
  getCollectionGames(collectionId: string): Promise<Game[]>;

  // Favorites
  toggleFavorite(gameId: string): Promise<void>;
  getFavorites(): Promise<Game[]>;
}

/**
 * Scanner service interface
 */
export interface IScannerService {
  // Directory management
  addDirectory(path: string, options?: ScanOptions): Promise<RomDirectory>;
  removeDirectory(path: string): Promise<void>;
  getDirectories(): Promise<RomDirectory[]>;
  updateDirectory(id: string, data: Partial<RomDirectory>): Promise<void>;

  // Scanning
  scanDirectory(path: string): AsyncGenerator<ScanProgress>;
  scanAllDirectories(): AsyncGenerator<ScanProgress>;
  cancelScan(): void;

  // ROM detection
  detectPlatform(filePath: string): Promise<Platform | null>;
  calculateHash(filePath: string): Promise<string>;
}

/**
 * Metadata service interface
 */
export interface IMetadataService {
  // Identification
  identifyGame(game: Game): Promise<GameMetadata | null>;
  searchMetadata(query: string, platformId?: string): Promise<GameMetadata[]>;

  // Artwork
  downloadCover(gameId: string, url: string): Promise<string>;
  getCoverPath(gameId: string): string;

  // Batch operations
  refreshMetadata(gameIds: string[]): AsyncGenerator<MetadataProgress>;
}

/**
 * Launch service interface
 */
export interface ILaunchService {
  // Emulator management
  getEmulators(): Promise<Emulator[]>;
  getEmulatorById(id: string): Promise<Emulator | null>;
  detectEmulators(): Promise<Emulator[]>;
  addEmulator(data: CreateEmulatorInput): Promise<Emulator>;
  updateEmulator(id: string, data: Partial<Emulator>): Promise<void>;
  deleteEmulator(id: string): Promise<void>;
  setDefaultEmulator(platformId: string, emulatorId: string): Promise<void>;
  getDefaultEmulator(platformId: string): Promise<Emulator | null>;

  // Launching
  launchGame(gameId: string, emulatorId?: string): Promise<void>;
  buildLaunchCommand(game: Game, emulator: Emulator): string;

  // Tracking
  recordPlaySession(gameId: string, duration: number): Promise<void>;
}

/**
 * Widget service interface
 */
export interface IWidgetService {
  getWidgets(): Promise<Widget[]>;
  getWidgetById(id: string): Promise<Widget | null>;
  addWidget(type: Widget['type'], position?: number): Promise<Widget>;
  removeWidget(id: string): Promise<void>;
  updateWidget(id: string, data: Partial<Widget>): Promise<void>;
  reorderWidgets(widgetIds: string[]): Promise<void>;
  getWidgetData(widget: Widget): Promise<unknown>;
}

/**
 * Genre service interface
 */
export interface IGenreService {
  getGenres(): Promise<Genre[]>;
  getGenreById(id: string): Promise<Genre | null>;
  getGamesByGenre(genreId: string, options?: PaginationOptions): Promise<Game[]>;
  assignGenre(gameId: string, genreId: string): Promise<void>;
  removeGenre(gameId: string, genreId: string): Promise<void>;
  extractGenreFromMetadata(metadata: GameMetadata): string | null;
}

/**
 * Platform service interface
 */
export interface IPlatformService {
  getPlatforms(): Promise<Platform[]>;
  getPlatformById(id: string): Promise<Platform | null>;
  getPlatformByExtension(extension: string): Promise<Platform | null>;
  getGameCountByPlatform(platformId: string): Promise<number>;
}
