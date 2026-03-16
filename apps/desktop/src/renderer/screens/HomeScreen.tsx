/**
 * Home Screen - Dashboard with widgets (Daijishou-inspired)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore, type Game, type Platform } from '@emuz/core';
import {
  RecentGamesWidget,
  FavoritesWidget,
  StatsWidget,
  PlatformShortcutsWidget,
} from '@emuz/ui';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { games, platforms } = useLibraryStore();
  
  // Calculate stats
  const totalGames = games.length;
  const totalPlatforms = platforms.length;
  const totalPlayTime = games.reduce((acc: number, g: Game) => acc + (g.playTime || 0), 0);
  const favorites = games.filter((g: Game) => g.isFavorite);
  const recentGames = [...games]
    .filter((g: Game) => g.lastPlayedAt)
    .sort((a: Game, b: Game) => {
      const aTime = a.lastPlayedAt?.getTime() ?? 0;
      const bTime = b.lastPlayedAt?.getTime() ?? 0;
      return bTime - aTime;
    })
    .slice(0, 10);
  
  const stats = [
    { label: 'Total Games', value: totalGames.toString() },
    { label: 'Platforms', value: totalPlatforms.toString() },
    { label: 'Play Time', value: `${Math.floor(totalPlayTime / 3600)}h` },
    { label: 'Favorites', value: favorites.length.toString() },
    { label: 'Recently Played', value: recentGames.length.toString() },
    { label: 'This Week', value: getGamesThisWeek(games).toString() },
  ];
  
  // Handlers
  const handleGameClick = (game: Game) => {
    navigate(`/game/${game.id}`);
  };
  
  const handlePlatformClick = (platform: Platform) => {
    navigate(`/platform/${platform.id}`);
  };
  
  // Container style
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    maxWidth: 1400,
    margin: '0 auto',
  };
  
  // Welcome header style
  const headerStyle: React.CSSProperties = {
    marginBottom: 8,
  };
  
  const titleStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary, #F8FAFC)',
    marginBottom: 4,
  };
  
  const subtitleStyle: React.CSSProperties = {
    fontSize: 16,
    color: 'var(--text-secondary, #94A3B8)',
  };
  
  // Widget grid style
  const widgetGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20,
  };
  
  // Wide widget (spans 2 columns on large screens)
  const wideWidgetStyle: React.CSSProperties = {
    gridColumn: 'span 2',
  };
  
  return (
    <div style={containerStyle}>
      {/* Welcome header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Welcome back!</h1>
        <p style={subtitleStyle}>
          {recentGames.length > 0
            ? `Continue where you left off or explore your library.`
            : `Add some ROM directories in settings to get started.`}
        </p>
      </div>
      
      {/* Widget grid */}
      <div style={widgetGridStyle}>
        {/* Stats widget */}
        <StatsWidget
          stats={stats}
          title="Library Stats"
        />
        
        {/* Platform shortcuts */}
        <PlatformShortcutsWidget
          platforms={platforms}
          onPlatformClick={handlePlatformClick}
          maxPlatforms={6}
        />
        
        {/* Recent games (wide) */}
        {recentGames.length > 0 && (
          <div style={wideWidgetStyle}>
            <RecentGamesWidget
              games={recentGames}
              onGameClick={handleGameClick}
              maxGames={5}
            />
          </div>
        )}
        
        {/* Favorites */}
        {favorites.length > 0 && (
          <FavoritesWidget
            games={favorites}
            onGameClick={handleGameClick}
            maxGames={6}
          />
        )}
      </div>
      
      {/* Empty state if no games */}
      {games.length === 0 && (
        <EmptyState />
      )}
    </div>
  );
};

/**
 * Calculate games played this week
 */
function getGamesThisWeek(games: { lastPlayedAt?: Date }[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return games.filter(g => {
    if (!g.lastPlayedAt) return false;
    return new Date(g.lastPlayedAt) > weekAgo;
  }).length;
}

/**
 * Empty state component
 */
const EmptyState: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    backgroundColor: 'var(--bg-secondary, #1E293B)',
    borderRadius: 16,
    textAlign: 'center',
  };
  
  const iconStyle: React.CSSProperties = {
    width: 64,
    height: 64,
    marginBottom: 16,
    color: 'var(--text-muted, #64748B)',
  };
  
  const titleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 600,
    color: 'var(--text-primary, #F8FAFC)',
    marginBottom: 8,
  };
  
  const descStyle: React.CSSProperties = {
    fontSize: 14,
    color: 'var(--text-secondary, #94A3B8)',
    marginBottom: 24,
    maxWidth: 400,
  };
  
  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'var(--color-primary, #10B981)',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
  
  return (
    <div style={containerStyle}>
      <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
        />
      </svg>
      <h2 style={titleStyle}>No games yet</h2>
      <p style={descStyle}>
        Get started by adding ROM directories in Settings. EmuZ will scan for games and organize them by platform.
      </p>
      <button style={buttonStyle}>
        Open Settings
      </button>
    </div>
  );
};

export default HomeScreen;
