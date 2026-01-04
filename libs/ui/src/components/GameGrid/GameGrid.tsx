/**
 * GameGrid Component
 * Responsive grid layout for displaying games
 */

import React from 'react';
import type { Game, Platform } from '@emuz/core';

export interface GameGridProps {
  /** List of games to display */
  games: Game[];
  /** Map of platforms by ID */
  platforms?: Map<string, Platform>;
  /** Card size */
  cardSize?: 'small' | 'medium' | 'large';
  /** Show platform badges */
  showPlatforms?: boolean;
  /** Set of favorite game IDs */
  favorites?: Set<string>;
  /** Selected game ID */
  selectedGameId?: string;
  /** Loading state */
  loading?: boolean;
  /** Number of skeleton items to show */
  skeletonCount?: number;
  /** Empty state message */
  emptyMessage?: string;
  /** Click handler */
  onGameClick?: (game: Game) => void;
  /** Double click handler */
  onGameDoubleClick?: (game: Game) => void;
  /** Context menu handler */
  onGameContextMenu?: (game: Game, event: React.MouseEvent) => void;
  /** Favorite toggle handler */
  onFavoriteToggle?: (game: Game) => void;
  /** Load more handler for infinite scroll */
  onLoadMore?: () => void;
  /** Whether there are more games to load */
  hasMore?: boolean;
  /** Gap between cards */
  gap?: number;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

const cardSizeWidths = {
  small: 120,
  medium: 160,
  large: 200,
};

const cardSizeHeights = {
  small: 160,
  medium: 220,
  large: 280,
};

// Lazy import GameCard to avoid circular dependencies
const GameCard = React.lazy(() => import('../GameCard').then(m => ({ default: m.GameCard })));

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  platforms,
  cardSize = 'medium',
  showPlatforms = true,
  favorites = new Set(),
  selectedGameId,
  loading = false,
  skeletonCount = 12,
  emptyMessage = 'No games found',
  onGameClick,
  onGameDoubleClick,
  onGameContextMenu,
  onFavoriteToggle,
  onLoadMore,
  hasMore = false,
  gap = 16,
  className = '',
  style,
  testID,
}) => {
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  
  // Infinite scroll observer
  React.useEffect(() => {
    if (!onLoadMore || !hasMore) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      observerRef.current?.disconnect();
    };
  }, [onLoadMore, hasMore, loading]);
  
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${cardSizeWidths[cardSize]}px, 1fr))`,
    gap,
    padding: 16,
    ...style,
  };
  
  const emptyStateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 64,
    color: 'var(--text-muted, #64748B)',
  };
  
  const emptyIconStyle: React.CSSProperties = {
    width: 64,
    height: 64,
    marginBottom: 16,
    opacity: 0.5,
  };
  
  const skeletonStyle: React.CSSProperties = {
    width: cardSizeWidths[cardSize],
    height: cardSizeHeights[cardSize],
    borderRadius: 12,
    backgroundColor: 'var(--skeleton, #334155)',
    animation: 'pulse 1.5s ease-in-out infinite',
  };
  
  const loadMoreStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    padding: 32,
  };
  
  const spinnerStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    border: '3px solid var(--border, #334155)',
    borderTopColor: 'var(--color-primary, #10B981)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };
  
  // Empty state
  if (!loading && games.length === 0) {
    return (
      <div className={className} style={emptyStateStyle} data-testid={testID}>
        <svg
          style={emptyIconStyle}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
        <p style={{ margin: 0, fontSize: 16 }}>{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className={className} style={gridStyle} data-testid={testID}>
        {/* Loading skeletons */}
        {loading && games.length === 0 && (
          Array.from({ length: skeletonCount }).map((_, index) => (
            <div key={`skeleton-${index}`} style={skeletonStyle} />
          ))
        )}
        
        {/* Game cards */}
        <React.Suspense fallback={null}>
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              platform={platforms?.get(game.platformId)}
              size={cardSize}
              showPlatform={showPlatforms}
              isFavorite={favorites.has(game.id)}
              isSelected={selectedGameId === game.id}
              onClick={onGameClick}
              onDoubleClick={onGameDoubleClick}
              onContextMenu={onGameContextMenu}
              onFavoriteToggle={onFavoriteToggle}
            />
          ))}
        </React.Suspense>
        
        {/* Loading more skeletons */}
        {loading && games.length > 0 && (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-more-${index}`} style={skeletonStyle} />
          ))
        )}
      </div>
      
      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} style={loadMoreStyle}>
          {loading && <div style={spinnerStyle} />}
        </div>
      )}
    </>
  );
};

GameGrid.displayName = 'GameGrid';

export default GameGrid;
