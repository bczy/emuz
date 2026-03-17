/**
 * React Query hooks for game metadata
 *
 * Provides cached metadata search and identification via IMetadataService.
 * The MetadataService already has its own in-memory cache; React Query adds
 * cross-component deduplication and stale-while-revalidate behaviour.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IMetadataService } from '../services/types';
import type { Game } from '../models/Game';

// ─── Query keys ──────────────────────────────────────────────────────────────

export const metadataQueryKeys = {
  all: ['metadata'] as const,
  search: (query: string, platformId?: string) =>
    [...metadataQueryKeys.all, 'search', query, platformId] as const,
  identify: (gameId: string) => [...metadataQueryKeys.all, 'identify', gameId] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Search for metadata by title (and optional platform).
 * Disabled when query is empty.
 */
export function useMetadataSearchQuery(
  service: IMetadataService,
  query: string,
  platformId?: string
) {
  return useQuery({
    queryKey: metadataQueryKeys.search(query, platformId),
    queryFn: () => service.searchMetadata(query, platformId),
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // metadata results are stable for 5 minutes
  });
}

/**
 * Identify a game and return its best metadata match.
 * Disabled when game is null.
 */
export function useIdentifyGameQuery(service: IMetadataService, game: Game | null) {
  return useQuery({
    queryKey: metadataQueryKeys.identify(game?.id ?? ''),
    queryFn: (): ReturnType<IMetadataService['identifyGame']> => {
      if (!game) return Promise.resolve(null);
      return service.identifyGame(game);
    },
    enabled: game !== null,
    staleTime: Infinity, // once identified, metadata doesn't change
  });
}

/**
 * Trigger a cover download for a game.
 * Invalidates the game's identity query on success.
 */
export function useDownloadCoverMutation(service: IMetadataService) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, url }: { gameId: string; url: string }) =>
      service.downloadCover(gameId, url),
    onSuccess: (_coverPath, { gameId }) => {
      queryClient.invalidateQueries({ queryKey: metadataQueryKeys.identify(gameId) });
    },
  });
}
