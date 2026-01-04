/**
 * Genre Screen - Games filtered by genre
 */

import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLibraryStore } from '@emuz/core';
import { GameGrid } from '@emuz/ui';
import type { Game } from '@emuz/core';

// Genre display info
const genreInfo: Record<string, { label: string; color: string; icon: string }> = {
  action: { label: 'Action', color: '#EF4444', icon: '⚔️' },
  adventure: { label: 'Adventure', color: '#8B5CF6', icon: '🗺️' },
  rpg: { label: 'RPG', color: '#10B981', icon: '🎭' },
  puzzle: { label: 'Puzzle', color: '#F59E0B', icon: '🧩' },
  sports: { label: 'Sports', color: '#3B82F6', icon: '⚽' },
  racing: { label: 'Racing', color: '#EC4899', icon: '🏎️' },
  fighting: { label: 'Fighting', color: '#F97316', icon: '👊' },
  platformer: { label: 'Platformer', color: '#14B8A6', icon: '🍄' },
  shooter: { label: 'Shooter', color: '#6366F1', icon: '🎯' },
  simulation: { label: 'Simulation', color: '#84CC16', icon: '🏗️' },
  strategy: { label: 'Strategy', color: '#A855F7', icon: '♟️' },
  horror: { label: 'Horror', color: '#DC2626', icon: '👻' },
  music: { label: 'Music & Rhythm', color: '#F472B6', icon: '🎵' },
  educational: { label: 'Educational', color: '#22D3EE', icon: '📚' },
  arcade: { label: 'Arcade', color: '#FBBF24', icon: '🕹️' },
};

const GenreScreen: React.FC = () => {
  const navigate = useNavigate();
  const { genreId } = useParams<{ genreId: string }>();
  
  const { games, platforms, updateGame } = useLibraryStore();
  
  // Get genre info
  const genre = genreId ? genreInfo[genreId] : null;
  
  // Filter games for this genre
  const genreGames = useMemo(() =>
    games.filter(g => g.genreId === genreId),
    [games, genreId]
  );
  
  // Favorites set
  const favorites = new Set(
    genreGames.filter(g => g.isFavorite).map(g => g.id)
  );
  
  // Handlers
  const handleGameClick = useCallback((game: Game) => {
    navigate(`/game/${game.id}`);
  }, [navigate]);
  
  const handleGameDoubleClick = useCallback((game: Game) => {
    console.log('Launch game:', game.title);
  }, []);
  
  const handleFavoriteToggle = useCallback((game: Game) => {
    updateGame(game.id, { isFavorite: !game.isFavorite });
  }, [updateGame]);
  
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  // Fallback for unknown genres
  const displayGenre = genre ?? { 
    label: genreId ?? 'Unknown', 
    color: '#64748B', 
    icon: '🎮' 
  };
  
  return (
    <div style={containerStyle}>
      {/* Header with genre info */}
      <div style={headerStyle}>
        <button style={backButtonStyle} onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        
        <div style={genreBadgeStyle(displayGenre.color)}>
          <span style={genreIconStyle}>{displayGenre.icon}</span>
          <div>
            <h1 style={genreTitleStyle}>{displayGenre.label}</h1>
            <p style={genreMetaStyle}>{genreGames.length} games</p>
          </div>
        </div>
      </div>
      
      {/* Game grid */}
      <div style={gridContainerStyle}>
        <GameGrid
          games={genreGames}
          platforms={platforms}
          cardSize="medium"
          showPlatforms={true}
          favorites={favorites}
          emptyMessage={`No ${displayGenre.label} games found in your library.`}
          onGameClick={handleGameClick}
          onGameDoubleClick={handleGameDoubleClick}
          onFavoriteToggle={handleFavoriteToggle}
        />
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
};

const backButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 8,
  border: '1px solid var(--border-color, #334155)',
  backgroundColor: 'transparent',
  color: 'var(--text-secondary, #94A3B8)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const genreBadgeStyle = (color: string): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '16px 24px',
  borderRadius: 12,
  background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
  border: `1px solid ${color}40`,
});

const genreIconStyle: React.CSSProperties = {
  fontSize: 40,
};

const genreTitleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: '#FFFFFF',
  marginBottom: 4,
};

const genreMetaStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary, #94A3B8)',
};

const gridContainerStyle: React.CSSProperties = {
  flex: 1,
};

export default GenreScreen;
