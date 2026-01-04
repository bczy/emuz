/**
 * Library Store - Manages game library state with Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Game } from '../models/Game';
import type { Platform } from '../models/Platform';
import type { Collection } from '../models/Collection';

/**
 * Library filter options
 */
export interface LibraryFilters {
  platformId?: string;
  collectionId?: string;
  genreId?: string;
  searchQuery?: string;
  favoritesOnly?: boolean;
}

/**
 * Library sort options
 */
export interface LibrarySort {
  field: 'title' | 'lastPlayedAt' | 'playCount' | 'releaseDate' | 'createdAt';
  order: 'asc' | 'desc';
}

/**
 * Library state interface
 */
export interface LibraryState {
  // Data
  games: Game[];
  platforms: Platform[];
  collections: Collection[];
  
  // Selection
  selectedGameId: string | null;
  selectedPlatformId: string | null;
  selectedCollectionId: string | null;
  
  // Filters & sorting
  filters: LibraryFilters;
  sort: LibrarySort;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Actions
  setGames: (games: Game[]) => void;
  addGame: (game: Game) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  removeGame: (id: string) => void;
  
  setPlatforms: (platforms: Platform[]) => void;
  setCollections: (collections: Collection[]) => void;
  
  selectGame: (id: string | null) => void;
  selectPlatform: (id: string | null) => void;
  selectCollection: (id: string | null) => void;
  
  setFilters: (filters: Partial<LibraryFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: LibrarySort) => void;
  
  setLoading: (isLoading: boolean) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed helpers
  getFilteredGames: () => Game[];
  getGameById: (id: string) => Game | undefined;
  getPlatformById: (id: string) => Platform | undefined;
}

/**
 * Default filter state
 */
const defaultFilters: LibraryFilters = {
  platformId: undefined,
  collectionId: undefined,
  genreId: undefined,
  searchQuery: undefined,
  favoritesOnly: false,
};

/**
 * Default sort state
 */
const defaultSort: LibrarySort = {
  field: 'title',
  order: 'asc',
};

/**
 * Library store
 */
export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      // Initial state
      games: [],
      platforms: [],
      collections: [],
      selectedGameId: null,
      selectedPlatformId: null,
      selectedCollectionId: null,
      filters: defaultFilters,
      sort: defaultSort,
      isLoading: false,
      isRefreshing: false,
      error: null,

      // Data setters
      setGames: (games: Game[]) => set({ games }),
      addGame: (game: Game) => set((state) => ({ games: [...state.games, game] })),
      updateGame: (id: string, updates: Partial<Game>) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g
          ),
        })),
      removeGame: (id: string) =>
        set((state) => ({
          games: state.games.filter((g) => g.id !== id),
          selectedGameId: state.selectedGameId === id ? null : state.selectedGameId,
        })),

      setPlatforms: (platforms: Platform[]) => set({ platforms }),
      setCollections: (collections: Collection[]) => set({ collections }),

      // Selection
      selectGame: (id: string | null) => set({ selectedGameId: id }),
      selectPlatform: (id: string | null) =>
        set({
          selectedPlatformId: id,
          filters: { ...get().filters, platformId: id ?? undefined },
        }),
      selectCollection: (id: string | null) =>
        set({
          selectedCollectionId: id,
          filters: { ...get().filters, collectionId: id ?? undefined },
        }),

      // Filters
      setFilters: (filters: Partial<LibraryFilters>) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      clearFilters: () => set({ filters: defaultFilters }),
      setSort: (sort: LibrarySort) => set({ sort }),

      // Loading states
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setRefreshing: (isRefreshing: boolean) => set({ isRefreshing }),
      setError: (error: string | null) => set({ error }),

      // Computed helpers
      getFilteredGames: () => {
        const { games, filters, sort } = get();
        let result = [...games];

        // Apply filters
        if (filters.platformId) {
          result = result.filter((g) => g.platformId === filters.platformId);
        }
        if (filters.genreId) {
          result = result.filter((g) => g.genre === filters.genreId);
        }
        if (filters.favoritesOnly) {
          result = result.filter((g) => g.isFavorite);
        }
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          result = result.filter(
            (g) =>
              g.title.toLowerCase().includes(query) ||
              g.developer?.toLowerCase().includes(query) ||
              g.publisher?.toLowerCase().includes(query)
          );
        }

        // Apply sorting
        result.sort((a, b) => {
          let aVal: string | number;
          let bVal: string | number;

          switch (sort.field) {
            case 'title':
              aVal = a.title.toLowerCase();
              bVal = b.title.toLowerCase();
              break;
            case 'lastPlayedAt':
              aVal = a.lastPlayedAt?.getTime() ?? 0;
              bVal = b.lastPlayedAt?.getTime() ?? 0;
              break;
            case 'playCount':
              aVal = a.playCount;
              bVal = b.playCount;
              break;
            case 'releaseDate':
              aVal = a.releaseDate ?? '';
              bVal = b.releaseDate ?? '';
              break;
            case 'createdAt':
              aVal = a.createdAt.getTime();
              bVal = b.createdAt.getTime();
              break;
            default:
              aVal = a.title.toLowerCase();
              bVal = b.title.toLowerCase();
          }

          if (aVal < bVal) return sort.order === 'asc' ? -1 : 1;
          if (aVal > bVal) return sort.order === 'asc' ? 1 : -1;
          return 0;
        });

        return result;
      },

      getGameById: (id: string) => get().games.find((g) => g.id === id),
      getPlatformById: (id: string) => get().platforms.find((p) => p.id === id),
    }),
    {
      name: 'emuz-library',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
        sort: state.sort,
        selectedPlatformId: state.selectedPlatformId,
      }),
    }
  )
);
