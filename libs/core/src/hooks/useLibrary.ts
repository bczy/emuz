/**
 * useLibrary hook - Provides library data and actions
 */

import { useCallback, useEffect } from 'react';
import { useLibraryStore } from '../stores/libraryStore';
import type { Game } from '../models/Game';
import type { ILibraryService } from '../services/types';

/**
 * Hook options
 */
export interface UseLibraryOptions {
  /** Library service instance */
  service: ILibraryService;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
}

/**
 * Hook return type
 */
export interface UseLibraryReturn {
  // Data
  games: Game[];
  filteredGames: Game[];
  isLoading: boolean;
  error: string | null;
  
  // Selected
  selectedGame: Game | undefined;
  
  // Actions
  refreshGames: () => Promise<void>;
  selectGame: (id: string | null) => void;
  toggleFavorite: (gameId: string) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  updateGame: (gameId: string, updates: Partial<Game>) => Promise<void>;
}

/**
 * Library hook for accessing game library
 */
export function useLibrary(options: UseLibraryOptions): UseLibraryReturn {
  const { service, autoFetch = true } = options;

  const {
    games,
    selectedGameId,
    isLoading,
    error,
    setGames,
    setLoading,
    setError,
    selectGame,
    updateGame: updateGameInStore,
    removeGame,
    getFilteredGames,
    getGameById,
  } = useLibraryStore();

  // Fetch all games
  const refreshGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allGames = await service.getAllGames();
      setGames(allGames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, [service, setGames, setLoading, setError]);

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (gameId: string) => {
      try {
        await service.toggleFavorite(gameId);
        const game = getGameById(gameId);
        if (game) {
          updateGameInStore(gameId, { isFavorite: !game.isFavorite });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      }
    },
    [service, getGameById, updateGameInStore, setError]
  );

  // Delete game
  const deleteGame = useCallback(
    async (gameId: string) => {
      try {
        await service.deleteGame(gameId);
        removeGame(gameId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete game');
      }
    },
    [service, removeGame, setError]
  );

  // Update game
  const updateGame = useCallback(
    async (gameId: string, updates: Partial<Game>) => {
      try {
        await service.updateGame(gameId, updates);
        updateGameInStore(gameId, updates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update game');
      }
    },
    [service, updateGameInStore, setError]
  );

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refreshGames();
    }
  }, [autoFetch, refreshGames]);

  return {
    games,
    filteredGames: getFilteredGames(),
    isLoading,
    error,
    selectedGame: selectedGameId ? getGameById(selectedGameId) : undefined,
    refreshGames,
    selectGame,
    toggleFavorite,
    deleteGame,
    updateGame,
  };
}
