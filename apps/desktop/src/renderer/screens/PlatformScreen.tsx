/**
 * Platform Screen - Games filtered by platform with wallpaper
 */

import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLibraryStore } from '@emuz/core';
import { GameGrid } from '@emuz/ui';
import type { Game, Platform } from '@emuz/core';

const PlatformScreen: React.FC = () => {
  const navigate = useNavigate();
  const { platformId } = useParams<{ platformId: string }>();
  
  const { games, platforms, updateGame } = useLibraryStore();
  
  // Find the platform
  const platform = useMemo(() => 
    platforms.find((p: Platform) => p.id === platformId),
    [platforms, platformId]
  );
  
  // Filter games for this platform
  const platformGames = useMemo(() =>
    games.filter((g: Game) => g.platformId === platformId),
    [games, platformId]
  );
  
  // Favorites set
  const favorites = useMemo(
    () => new Set(platformGames.filter((g: Game) => g.isFavorite).map((g: Game) => g.id)),
    [platformGames]
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
  
  // Not found state
  if (!platform) {
    return (
      <div style={notFoundStyle}>
        <h2>Platform not found</h2>
        <button onClick={handleBack}>Go back</button>
      </div>
    );
  }
  
  return (
    <div style={containerStyle}>
      {/* Hero section with wallpaper */}
      <div style={heroStyle(platform.wallpaperPath)}>
        <div style={heroOverlayStyle} />
        <div style={heroContentStyle}>
          <button style={backButtonStyle} onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          
          <div style={platformInfoStyle}>
            {platform.iconPath && (
              <img
                src={platform.iconPath}
                alt={platform.name}
                style={platformIconStyle}
              />
            )}
            <div>
              <h1 style={platformTitleStyle}>{platform.name}</h1>
              <p style={platformMetaStyle}>
                {platform.manufacturer && `${platform.manufacturer} • `}
                {platform.releaseYear && `${platform.releaseYear} • `}
                {platformGames.length} games
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Game grid */}
      <div style={gridContainerStyle}>
        <GameGrid
          games={platformGames}
          platforms={platforms}
          cardSize="medium"
          showPlatforms={false}
          favorites={favorites}
          emptyMessage={`No ${platform.name} games found. Add ROM directories containing ${platform.romExtensions?.join(', ')} files.`}
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
  margin: -24, // Offset parent padding for full-width hero
};

const heroStyle = (wallpaperPath?: string): React.CSSProperties => ({
  position: 'relative',
  height: 280,
  backgroundImage: wallpaperPath 
    ? `url(${wallpaperPath})`
    : 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'flex-end',
});

const heroOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(transparent 0%, rgba(15, 23, 42, 0.8) 70%, rgba(15, 23, 42, 1) 100%)',
};

const heroContentStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  padding: 24,
  width: '100%',
};

const backButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: 24,
  left: 24,
  width: 40,
  height: 40,
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  color: '#FFFFFF',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(8px)',
};

const platformInfoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
};

const platformIconStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 12,
  backgroundColor: 'var(--bg-secondary, #1E293B)',
};

const platformTitleStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  color: '#FFFFFF',
  marginBottom: 4,
};

const platformMetaStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'rgba(255, 255, 255, 0.7)',
};

const gridContainerStyle: React.CSSProperties = {
  padding: 24,
};

const notFoundStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: 16,
  color: 'var(--text-secondary, #94A3B8)',
};

export default PlatformScreen;
