/**
 * MetadataService - Fetches and manages game metadata
 */

import type { Game, GameMetadata } from '../models/Game';
import type { DatabaseAdapter } from '@emuz/database';
import type { FileSystemAdapter } from '@emuz/platform';
import type { IMetadataService, MetadataProgress } from './types';

/**
 * Metadata provider interface
 */
export interface MetadataProvider {
  name: string;
  search(query: string, platformId?: string): Promise<GameMetadata[]>;
  getById(id: string): Promise<GameMetadata | null>;
}

/**
 * MetadataService implementation
 */
export class MetadataService implements IMetadataService {
  private providers: MetadataProvider[] = [];
  private coverCacheDir: string;

  /** In-memory cache: gameId → metadata (null means "looked up, not found") */
  private readonly identityCache = new Map<string, GameMetadata | null>();
  /** In-memory cache: "query:platformId" → search results */
  private readonly searchCache = new Map<string, GameMetadata[]>();

  constructor(
    private readonly db: DatabaseAdapter,
    private readonly fs: FileSystemAdapter,
    coverCacheDir?: string
  ) {
    this.coverCacheDir = coverCacheDir ?? '.emuz/covers';
  }

  /** Clear all in-memory caches (useful for testing) */
  clearCache(): void {
    this.identityCache.clear();
    this.searchCache.clear();
  }

  /**
   * Register a metadata provider
   */
  registerProvider(provider: MetadataProvider): void {
    this.providers.push(provider);
  }

  /**
   * Identify a game and fetch its metadata.
   * Returns cached result immediately if already scraped (in-memory or DB).
   */
  async identifyGame(game: Game): Promise<GameMetadata | null> {
    // 1. In-memory cache hit
    if (this.identityCache.has(game.id)) {
      return this.identityCache.get(game.id) ?? null;
    }

    // 2. DB-level cache: game already has metadata stored
    const existing = await this.getExistingMetadata(game.id);
    if (existing) {
      this.identityCache.set(game.id, existing);
      return existing;
    }

    // 3. Try hash-based lookup
    if (game.fileHash) {
      const hashResult = await this.searchByHash(game.fileHash);
      if (hashResult) {
        this.identityCache.set(game.id, hashResult);
        return hashResult;
      }
    }

    // 4. Fall back to title search
    const searchQuery = this.cleanTitleForSearch(game.title);
    const results = await this.searchMetadata(searchQuery, game.platformId);
    const result = results.length > 0 ? results[0] : null;

    this.identityCache.set(game.id, result);
    return result;
  }

  /**
   * Search for game metadata by title.
   * Results are cached in-memory by query+platformId key.
   */
  async searchMetadata(query: string, platformId?: string): Promise<GameMetadata[]> {
    const cacheKey = `${query}:${platformId ?? ''}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached) return cached;

    const allResults: GameMetadata[] = [];

    for (const provider of this.providers) {
      try {
        const results = await provider.search(query, platformId);
        allResults.push(...results);
      } catch (error) {
        console.warn(`Metadata provider ${provider.name} failed:`, error);
      }
    }

    // Deduplicate by title
    const seen = new Set<string>();
    const results = allResults.filter((meta) => {
      const key = `${meta.title?.toLowerCase()}-${meta.developer?.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    this.searchCache.set(cacheKey, results);
    return results;
  }

  /**
   * Download a cover image for a game
   */
  async downloadCover(gameId: string, url: string): Promise<string> {
    // Ensure cache directory exists
    const cacheDir = this.coverCacheDir;
    await this.ensureDirectory(cacheDir);

    // Determine file extension from URL
    const extension = this.getExtensionFromUrl(url);
    const coverPath = `${cacheDir}/${gameId}${extension}`;

    // Download the image
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download cover: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      await this.fs.writeBinary(coverPath, new Uint8Array(buffer));

      // Update game record
      const now = Math.floor(Date.now() / 1000);
      await this.db.execute('UPDATE games SET cover_path = ?, updated_at = ? WHERE id = ?', [
        coverPath,
        now,
        gameId,
      ]);

      return coverPath;
    } catch (error) {
      throw new Error(
        `Failed to download cover for game ${gameId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get the cover path for a game
   */
  getCoverPath(gameId: string): string {
    return `${this.coverCacheDir}/${gameId}`;
  }

  /**
   * Refresh metadata for multiple games
   */
  async *refreshMetadata(gameIds: string[]): AsyncGenerator<MetadataProgress> {
    const progress: MetadataProgress = {
      phase: 'searching',
      gameId: '',
      gamesProcessed: 0,
      gamesTotal: gameIds.length,
      found: 0,
      notFound: 0,
      errors: [],
    };

    yield { ...progress };

    for (const gameId of gameIds) {
      progress.gameId = gameId;
      progress.phase = 'searching';

      try {
        // Get game from database
        const game = await this.getGameById(gameId);
        if (!game) {
          progress.errors.push(`Game not found: ${gameId}`);
          progress.gamesProcessed++;
          yield { ...progress };
          continue;
        }

        // Search for metadata
        const metadata = await this.identifyGame(game);

        if (metadata) {
          // Update game with metadata
          await this.applyMetadata(gameId, metadata);
          progress.found++;

          // Download cover if available
          if (metadata.coverUrl) {
            progress.phase = 'downloading';
            yield { ...progress };

            try {
              await this.downloadCover(gameId, metadata.coverUrl);
            } catch (error) {
              progress.errors.push(
                `Cover download failed for ${game.title}: ${error instanceof Error ? error.message : String(error)}`
              );
            }
          }
        } else {
          progress.notFound++;
        }
      } catch (error) {
        progress.errors.push(
          `Failed to process ${gameId}: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      progress.gamesProcessed++;
      yield { ...progress };
    }

    progress.phase = 'complete';
    yield { ...progress };
  }

  /**
   * Check if the game already has metadata stored in the DB.
   * Returns the stored metadata if description is present, null otherwise.
   */
  private async getExistingMetadata(gameId: string): Promise<GameMetadata | null> {
    interface GameMetaRow {
      title: string;
      description: string | null;
      developer: string | null;
      publisher: string | null;
      release_date: string | null;
      genre: string | null;
      rating: number | null;
    }

    const rows = await this.db.query<GameMetaRow>(
      'SELECT title, description, developer, publisher, release_date, genre, rating FROM games WHERE id = ? AND description IS NOT NULL',
      [gameId]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      title: row.title,
      description: row.description ?? undefined,
      developer: row.developer ?? undefined,
      publisher: row.publisher ?? undefined,
      releaseDate: row.release_date ?? undefined,
      genre: row.genre ?? undefined,
      rating: row.rating ?? undefined,
    };
  }

  /**
   * Search for game by hash (stub - would connect to hash database)
   */
  private async searchByHash(_hash: string): Promise<GameMetadata | null> {
    // TODO: Implement hash-based lookup using databases like No-Intro, Redump, etc.
    return null;
  }

  /**
   * Clean title for search query
   */
  private cleanTitleForSearch(title: string): string {
    return title
      .replace(/\([^)]*\)/g, '') // Remove parentheses content
      .replace(/\[[^\]]*\]/g, '') // Remove brackets content
      .replace(/[^\w\s]/g, ' ') // Replace special chars with space
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }

  /**
   * Get file extension from URL
   */
  private getExtensionFromUrl(url: string): string {
    const match = url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
    return match ? `.${match[1].toLowerCase()}` : '.jpg';
  }

  /**
   * Ensure a directory exists
   */
  private async ensureDirectory(path: string): Promise<void> {
    try {
      await this.fs.mkdir(path, true);
    } catch {
      // Directory may already exist
    }
  }

  /**
   * Get game by ID from database
   */
  private async getGameById(id: string): Promise<Game | null> {
    interface GameRow {
      id: string;
      platform_id: string;
      title: string;
      file_path: string;
      file_name: string;
      file_hash: string | null;
    }

    const rows = await this.db.query<GameRow>(
      'SELECT id, platform_id, title, file_path, file_name, file_hash FROM games WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      platformId: row.platform_id,
      title: row.title,
      filePath: row.file_path,
      fileName: row.file_name,
      fileHash: row.file_hash ?? undefined,
      playCount: 0,
      playTime: 0,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Apply metadata to a game
   */
  private async applyMetadata(gameId: string, metadata: GameMetadata): Promise<void> {
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (metadata.title) {
      updates.push('title = ?');
      params.push(metadata.title);
    }
    if (metadata.description) {
      updates.push('description = ?');
      params.push(metadata.description);
    }
    if (metadata.developer) {
      updates.push('developer = ?');
      params.push(metadata.developer);
    }
    if (metadata.publisher) {
      updates.push('publisher = ?');
      params.push(metadata.publisher);
    }
    if (metadata.releaseDate) {
      updates.push('release_date = ?');
      params.push(metadata.releaseDate);
    }
    if (metadata.genre) {
      updates.push('genre = ?');
      params.push(metadata.genre);
    }
    if (metadata.rating !== undefined) {
      updates.push('rating = ?');
      params.push(metadata.rating);
    }

    if (updates.length === 0) return;

    updates.push('updated_at = ?');
    params.push(Math.floor(Date.now() / 1000));
    params.push(gameId);

    await this.db.execute(`UPDATE games SET ${updates.join(', ')} WHERE id = ?`, params);
  }
}

/**
 * Create a new MetadataService instance
 */
export function createMetadataService(
  db: DatabaseAdapter,
  fs: FileSystemAdapter,
  coverCacheDir?: string
): IMetadataService {
  return new MetadataService(db, fs, coverCacheDir);
}
