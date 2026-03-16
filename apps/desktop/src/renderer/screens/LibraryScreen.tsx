/**
 * Library Screen - Grid view of all games
 */

import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '@emuz/core';
import { GameGrid } from '@emuz/ui';
import type { Game, Platform } from '@emuz/core';

const LibraryScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    games,
    platforms,
    filters,
    isLoading,
    getFilteredGames,
    selectGame,
    updateGame,
  } = useLibraryStore();
  
  const filteredGames = getFilteredGames();
  
  // Create favorites set
  const favorites = useMemo(
    () => new Set(games.filter((g: Game) => g.isFavorite).map((g: Game) => g.id)),
    [games]
  );
  
  // Handlers
  const handleGameClick = useCallback((game: Game) => {
    selectGame(game.id);
    navigate(`/game/${game.id}`);
  }, [navigate, selectGame]);
  
  const handleGameDoubleClick = useCallback((game: Game) => {
    // TODO: Launch game
    console.log('Launch game:', game.title);
  }, []);
  
  const handleFavoriteToggle = useCallback((game: Game) => {
    updateGame(game.id, { isFavorite: !game.isFavorite });
  }, [updateGame]);
  
  // Container style
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    height: '100%',
  };
  
  // Header style
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  };
  
  const titleStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-primary, #F8FAFC)',
  };
  
  const countStyle: React.CSSProperties = {
    fontSize: 14,
    color: 'var(--text-secondary, #94A3B8)',
  };
  
  // Filter bar style
  const filterBarStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  };
  
  const filterChipStyle: React.CSSProperties = {
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 16,
    border: '1px solid var(--border, #334155)',
    backgroundColor: 'var(--bg-secondary, #1E293B)',
    color: 'var(--text-secondary, #CBD5E1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
  
  const activeChipStyle: React.CSSProperties = {
    ...filterChipStyle,
    backgroundColor: 'var(--color-primary, #10B981)',
    borderColor: 'var(--color-primary, #10B981)',
    color: '#FFFFFF',
  };
  
  // Active filters
  const activeFilters = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== false)
    .map(([key]) => key);
  
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Library</h1>
          <span style={countStyle}>
            {filteredGames.length} of {games.length} games
          </span>
        </div>
        
        {/* Sort/View toggle could go here */}
      </div>
      
      {/* Filter bar */}
      {activeFilters.length > 0 && (
        <div style={filterBarStyle}>
          {filters.favoritesOnly && (
            <span style={activeChipStyle}>Favorites Only</span>
          )}
          {filters.platformId && (
            <span style={activeChipStyle}>
              Platform: {platforms.find((p: Platform) => p.id === filters.platformId)?.name || filters.platformId}
            </span>
          )}
          {filters.searchQuery && (
            <span style={activeChipStyle}>
              Search: "{filters.searchQuery}"
            </span>
          )}
        </div>
      )}
      
      {/* Game grid */}
      <GameGrid
        games={filteredGames}
        platforms={platforms}
        cardSize="medium"
        showPlatforms={true}
        favorites={favorites}
        loading={isLoading}
        emptyMessage={
          activeFilters.length > 0
            ? 'No games match your filters'
            : 'No games in library. Add ROM directories in settings.'
        }
        onGameClick={handleGameClick}
        onGameDoubleClick={handleGameDoubleClick}
        onFavoriteToggle={handleFavoriteToggle}
      />
    </div>
  );
};

export default LibraryScreen;
