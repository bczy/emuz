/**
 * Service types and interfaces for @emuz/core
 */

import type { Game } from '../models/Game';
import type { Platform } from '../models/Platform';
import type { Emulator } from '../models/Emulator';
import type { Collection } from '../models/Collection';
import type { Widget } from '../models/Widget';

/**
 * Pagination options
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: number;
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
  query?: string;
  platformId?: string;
  genreId?: string;
  genre?: string;
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
  platforms: string[];
  executablePath?: string;
  packageName?: string;
  urlScheme?: string;
  iconPath?: string;
  commandTemplate?: string;
  corePath?: string;
}

export interface PlaySession {
  id: string;
  gameId: string;
  startedAt: Date;
  endedAt?: Date;
  duration: number;
}

export interface ScanStatus {
  isScanning: boolean;
  currentDirectory?: string;
  filesScanned: number;
  gamesFound: number;
}

/**
 * Scan options for ROM directories
 */
export interface ScanOptions {
  recursive?: boolean;
  platformId?: string;
  includeHidden?: boolean;
  skipExisting?: boolean;
}

/**
 * Scan progress update
 */
export interface ScanProgress {
  phase: 'scanning' | 'identifying' | 'complete' | 'error';
  currentPath?: string;
  fileName?: string;
  progress?: number;
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
  searchGames(options: SearchOptions | string | { query?: string; platformId?: string; genre?: string }): Promise<Game[]>;
  updateGame(id: string, data: Partial<Game>): Promise<Game | null>;
  deleteGame(id: string): Promise<void>;
  getGameCount(): Promise<number>;
  getRecentGames(limit?: number): Promise<Game[]>;
  getRecentlyPlayed(limit?: number): Promise<Game[]>;
  recordPlaySession(gameId: string, duration: number): Promise<void>;

  // Collections
  getCollections(): Promise<Collection[]>;
  createCollection(data: CreateCollectionInput): Promise<Collection>;
  deleteCollection(id: string): Promise<void>;
  addToCollection(collectionId: string, gameId: string): Promise<void>;
  removeFromCollection(collectionId: string, gameId: string): Promise<void>;
  getCollectionGames(collectionId: string): Promise<Game[]>;

  // Favorites
  toggleFavorite(gameId: string): Promise<void>;
  addToFavorites(gameId: string): Promise<void>;
  removeFromFavorites(gameId: string): Promise<void>;
  getFavorites(): Promise<Game[]>;
}

/**
 * Scanner service interface
 */
export interface IScannerService {
  // Directory management
  addDirectory(path: string, options?: ScanOptions): Promise<RomDirectory>;
  removeDirectory(path: string, options?: { removeGames?: boolean }): Promise<void>;
  getDirectories(): Promise<RomDirectory[]>;
  updateDirectory(id: string, data: Partial<RomDirectory>): Promise<void>;

  // Scanning
  scan(path: string, options?: ScanOptions): AsyncGenerator<ScanProgress>;
  scanDirectory(path: string): AsyncGenerator<ScanProgress>;
  scanAllDirectories(): AsyncGenerator<ScanProgress>;
  cancelScan(): void;
  getScanStatus(): ScanStatus;

  // ROM detection
  detectPlatform(filePath: string): Promise<Platform | null>;
  detectPlatformByExtension(ext: string): string | null;
  calculateHash(filePath: string): Promise<string>;
}

/**
 * Metadata service interface
 */
export interface IMetadataService {
  // Identification
  identifyGame(game: Game): Promise<import('../models/Game').GameMetadata | null>;
  searchMetadata(query: string, platformId?: string): Promise<import('../models/Game').GameMetadata[]>;

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
  getEmulators(options?: { platformId?: string }): Promise<Emulator[]>;
  getEmulatorById(id: string): Promise<Emulator | null>;
  detectEmulators(): Promise<Array<{ name: string; path: string }>>;
  addEmulator(data: CreateEmulatorInput): Promise<Emulator>;
  updateEmulator(id: string, data: Partial<Emulator>): Promise<void>;
  deleteEmulator(id: string): Promise<void>;
  setDefaultEmulator(emulatorId: string, platformId: string): Promise<void>;
  getDefaultEmulator(platformId: string): Promise<Emulator | null>;

  // Launching
  launchGame(game: Game, emulatorId?: string): Promise<{ success: boolean }>;
  buildCommand(emulator: Emulator, vars: { romPath: string; core?: string }): string;
  buildLaunchCommand(game: Game, emulator: Emulator): string;

  // Tracking
  recordPlaySession(gameId: string, duration: number): Promise<void>;
  endPlaySession(sessionId: string, duration: number): Promise<void>;
  getPlayHistory(gameId: string, options?: { limit?: number }): Promise<PlaySession[]>;
}

/**
 * Widget service interface
 */
export interface IWidgetService {
  getWidgets(options?: { visibleOnly?: boolean }): Promise<Widget[]>;
  getWidgetById(id: string): Promise<Widget | null>;
  addWidget(config: { type: Widget['type']; title?: string; size?: string }): Promise<Widget>;
  removeWidget(id: string): Promise<void>;
  updateWidget(id: string, data: Partial<Widget>): Promise<Widget | null>;
  reorderWidgets(widgetIds: string[]): Promise<void>;
  getWidgetData(id: string, type: Widget['type']): Promise<unknown>;
  getDefaultWidgets(): Array<{ type: Widget['type']; title?: string; size?: string }>;
}

/**
 * Genre service interface
 */
export interface IGenreService {
  getGenres(): Promise<Array<{ id: string; name: string; gameCount: number }>>;
  getGamesByGenre(genre: string, options?: PaginationOptions): Promise<Game[]>;
  assignGenre(gameId: string, genreId: string | null): Promise<void>;
  removeGenre(gameId: string, genreId: string): Promise<void>;
  extractGenreFromMetadata(input: string | null): string | null;
  getGenreStats(genre: string): Promise<{ totalGames: number; totalPlayTime: number; averageRating: number }>;
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
