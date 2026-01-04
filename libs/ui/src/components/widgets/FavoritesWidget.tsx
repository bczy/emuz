/**
 * FavoritesWidget Component
 * Display favorite games
 */

import React from 'react';
import type { Game } from '@emuz/core';
import { WidgetContainer, WidgetContainerProps } from './WidgetContainer';

export interface FavoritesWidgetProps extends Omit<WidgetContainerProps, 'children'> {
  /** Favorite games list */
  games: Game[];
  /** Max games to show */
  maxGames?: number;
  /** Game click handler */
  onGameClick?: (game: Game) => void;
  /** Game play handler */
  onGamePlay?: (game: Game) => void;
}

// Placeholder image
const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect fill='%23334155' width='64' height='64' rx='8'/%3E%3C/svg%3E`;

export const FavoritesWidget: React.FC<FavoritesWidgetProps> = ({
  games,
  maxGames = 8,
  onGameClick,
  onGamePlay,
  loading = false,
  ...containerProps
}) => {
  const displayGames = games.slice(0, maxGames);
  
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
    gap: 12,
  };
  
  const itemStyle: React.CSSProperties = {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
    aspectRatio: '3/4',
  };
  
  const coverStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    backgroundColor: 'var(--skeleton, #334155)',
  };
  
  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    opacity: 0,
    transition: 'opacity 0.15s ease',
  };
  
  const playIconStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary, #10B981)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
  };
  
  const heartBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  const emptyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-muted, #64748B)',
    textAlign: 'center',
    padding: 16,
  };
  
  return (
    <WidgetContainer
      title="Favorites"
      loading={loading}
      {...containerProps}
    >
      {displayGames.length === 0 ? (
        <div style={emptyStyle}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 8, opacity: 0.5 }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p style={{ margin: 0, fontSize: 13 }}>No favorites yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 11 }}>Mark games as favorite to see them here</p>
        </div>
      ) : (
        <div style={gridStyle}>
          {displayGames.map((game) => (
            <div
              key={game.id}
              style={itemStyle}
              onClick={() => onGameClick?.(game)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                const overlay = e.currentTarget.querySelector('[data-overlay]') as HTMLElement;
                if (overlay) overlay.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                const overlay = e.currentTarget.querySelector('[data-overlay]') as HTMLElement;
                if (overlay) overlay.style.opacity = '0';
              }}
              title={game.title}
            >
              <img
                src={game.coverPath || placeholderImage}
                alt={game.title}
                style={coverStyle}
                onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage; }}
              />
              
              <span style={heartBadgeStyle}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </span>
              
              <div
                data-overlay
                style={overlayStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  onGamePlay?.(game);
                }}
              >
                <span style={playIconStyle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetContainer>
  );
};

FavoritesWidget.displayName = 'FavoritesWidget';

export default FavoritesWidget;
