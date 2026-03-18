/**
 * MetadataService - Fetches and manages game metadata
 *
 * Refactored to use Drizzle ORM query builder (Story 1.7 / ADR-013).
 * No raw SQL strings.
 */

import { eq, and, isNotNull } from 'drizzle-orm';
import type { Game, GameMetadata } from '../models/Game';
import type { DrizzleDb } from '@emuz/database/schema';
import { games } from '@emuz/database/schema';
import type { FileSystemAdapter } from '@emuz/platform';
import type { IMetadataService, MetadataProgress } from './types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isAbsolutePath(p: string): boolean {
  return p.startsWith('/') || /^[A-Za-z]:[\\/]/.test(p);
}

/**
 * Metadata provider interface
 */
export interface MetadataProvider {
  name: string;
  search(query: string, platformId?: string): Promise<GameMetadata[]>;
  getById(id: string): Promise<GameMetadata | null>;
}

/**
 * MetadataService implementation using Drizzle ORM
 */
export class MetadataService implements IMetadataService {
  private providers: MetadataProvider[] = [];
  private coverCacheDir: string;

  /** In-memory cache: gameId → metadata (null means "looked up, not found") */
  private readonly identityCache = new Map<string, GameMetadata | null>();
  /** In-memory cache: "query:platformId" → search results */
  private readonly searchCache = new Map<string, GameMetadata[]>();

  constructor(
    private readonly db: DrizzleDb,
    private readonly fs: FileSystemAdapter,
    coverCacheDir?: string
  ) {
    if (coverCacheDir !== undefined && !isAbsolutePath(coverCacheDir)) {
      throw new Error(`coverCacheDir must be an absolute path, got: "${coverCacheDir}"`);
    }
    this.coverCacheDir = coverCacheDir ?? '.emuz/covers';
  }

  clearCache(): void {
    this.identityCache.clear();
    this.searchCache.clear();
  }

  registerProvider(provider: MetadataProvider): void {
    this.providers.push(provider);
  }

  async identifyGame(game: Game): Promise<GameMetadata | null> {
    if (this.identityCache.has(game.id)) {
      return this.identityCache.get(game.id) ?? null;
    }

    const existing = await this.getExistingMetadata(game.id);
    if (existing) {
      this.identityCache.set(game.id, existing);
      return existing;
    }

    if (game.fileHash) {
      const hashResult = await this.searchByHash(game.fileHash);
      if (hashResult) {
        this.identityCache.set(game.id, hashResult);
        return hashResult;
      }
    }

    const searchQuery = this.cleanTitleForSearch(game.title);
    const results = await this.searchMetadata(searchQuery, game.platformId);
    const result = results.length > 0 ? results[0] : null;

    this.identityCache.set(game.id, result);
    return result;
  }

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

  async downloadCover(gameId: string, url: string): Promise<string> {
    if (!UUID_RE.test(gameId)) {
      throw new Error(`Invalid gameId: "${gameId}" — must be a UUID`);
    }
    const cacheDir = this.coverCacheDir;
    await this.ensureDirectory(cacheDir);

    const extension = this.getExtensionFromUrl(url);
    const coverPath = `${cacheDir}/${gameId}${extension}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download cover: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      await this.fs.writeBinary(coverPath, new Uint8Array(buffer));

      await this.db
        .update(games)
        .set({ coverPath, updatedAt: new Date() })
        .where(eq(games.id, gameId));

      return coverPath;
    } catch (error) {
      throw new Error(
        `Failed to download cover for game ${gameId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  getCoverPath(gameId: string): string {
    return `${this.coverCacheDir}/${gameId}`;
  }

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
        const game = await this.getGameById(gameId);
        if (!game) {
          progress.errors.push(`Game not found: ${gameId}`);
          progress.gamesProcessed++;
          yield { ...progress };
          continue;
        }

        const metadata = await this.identifyGame(game);

        if (metadata) {
          await this.applyMetadata(gameId, metadata);
          progress.found++;

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

  private async getExistingMetadata(gameId: string): Promise<GameMetadata | null> {
    const rows = await this.db
      .select({
        title: games.title,
        description: games.description,
        developer: games.developer,
        publisher: games.publisher,
        releaseDate: games.releaseDate,
        genre: games.genre,
        rating: games.rating,
      })
      .from(games)
      .where(and(eq(games.id, gameId), isNotNull(games.description)));

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      title: row.title,
      description: row.description ?? undefined,
      developer: row.developer ?? undefined,
      publisher: row.publisher ?? undefined,
      releaseDate: row.releaseDate ?? undefined,
      genre: row.genre ?? undefined,
      rating: row.rating ?? undefined,
    };
  }

  private async searchByHash(_hash: string): Promise<GameMetadata | null> {
    // TODO: Implement hash-based lookup using databases like No-Intro, Redump, etc.
    return null;
  }

  private cleanTitleForSearch(title: string): string {
    return title
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getExtensionFromUrl(url: string): string {
    const match = url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
    return match ? `.${match[1].toLowerCase()}` : '.jpg';
  }

  private async ensureDirectory(path: string): Promise<void> {
    try {
      await this.fs.mkdir(path, true);
    } catch {
      // Directory may already exist
    }
  }

  private async getGameById(id: string): Promise<Game | null> {
    const rows = await this.db
      .select({
        id: games.id,
        platformId: games.platformId,
        title: games.title,
        filePath: games.filePath,
        fileName: games.fileName,
        fileHash: games.fileHash,
      })
      .from(games)
      .where(eq(games.id, id));

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      platformId: row.platformId,
      title: row.title,
      filePath: row.filePath,
      fileName: row.fileName,
      fileHash: row.fileHash ?? undefined,
      playCount: 0,
      playTime: 0,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async applyMetadata(gameId: string, metadata: GameMetadata): Promise<void> {
    const updates: Partial<typeof games.$inferInsert> = { updatedAt: new Date() };

    if (metadata.title) updates.title = metadata.title;
    if (metadata.description) updates.description = metadata.description;
    if (metadata.developer) updates.developer = metadata.developer;
    if (metadata.publisher) updates.publisher = metadata.publisher;
    if (metadata.releaseDate) updates.releaseDate = metadata.releaseDate;
    if (metadata.genre) updates.genre = metadata.genre;
    if (metadata.rating !== undefined) updates.rating = metadata.rating;

    if (Object.keys(updates).length <= 1) return; // only updatedAt

    await this.db.update(games).set(updates).where(eq(games.id, gameId));
  }
}

/**
 * Create a new MetadataService instance
 */
export function createMetadataService(
  db: DrizzleDb,
  fs: FileSystemAdapter,
  coverCacheDir?: string
): IMetadataService {
  return new MetadataService(db, fs, coverCacheDir);
}
