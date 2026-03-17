/**
 * React Query hooks for game library data
 *
 * Provides cached, async access to game data via ILibraryService.
 * Use alongside useLibraryStore for UI state (selection, filters).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ILibraryService, SearchOptions } from '../services/types';
import type { Game } from '../models/Game';

// ─── Query keys ─────────────────────────────────────────────────────────────

export const gameQueryKeys = {
  all: ['games'] as const,
  lists: () => [...gameQueryKeys.all, 'list'] as const,
  list: (options?: SearchOptions) => [...gameQueryKeys.lists(), options] as const,
  detail: (id: string) => [...gameQueryKeys.all, 'detail', id] as const,
  recent: (limit?: number) => [...gameQueryKeys.all, 'recent', limit] as const,
  favorites: () => [...gameQueryKeys.all, 'favorites'] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetch all games, with optional search/filter options.
 * Results are cached and shared across components.
 */
export function useGamesQuery(service: ILibraryService, options?: SearchOptions) {
  return useQuery({
    queryKey: gameQueryKeys.list(options),
    queryFn: () =>
      options?.query || options?.platformId || options?.genre
        ? service.searchGames(options)
        : service.getAllGames(),
  });
}

/**
 * Fetch a single game by ID.
 */
export function useGameQuery(service: ILibraryService, gameId: string | null) {
  return useQuery({
    queryKey: gameQueryKeys.detail(gameId ?? ''),
    queryFn: (): Promise<Game | null> => {
      if (!gameId) return Promise.resolve(null);
      return service.getGameById(gameId);
    },
    enabled: gameId !== null,
  });
}

/**
 * Fetch recently added games.
 */
export function useRecentGamesQuery(service: ILibraryService, limit = 12) {
  return useQuery({
    queryKey: gameQueryKeys.recent(limit),
    queryFn: () => service.getRecentGames(limit),
  });
}

/**
 * Fetch favorite games.
 */
export function useFavoritesQuery(service: ILibraryService) {
  return useQuery({
    queryKey: gameQueryKeys.favorites(),
    queryFn: () => service.getFavorites(),
  });
}

/**
 * Toggle favorite with optimistic update.
 * Invalidates affected queries on settle.
 */
export function useToggleFavoriteMutation(service: ILibraryService) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId }: { gameId: string }) => service.toggleFavorite(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameQueryKeys.all });
    },
  });
}

/**
 * Update a game with optimistic cache update.
 */
export function useUpdateGameMutation(service: ILibraryService) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Game> }) =>
      service.updateGame(id, updates),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: gameQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: gameQueryKeys.lists() });
    },
  });
}
