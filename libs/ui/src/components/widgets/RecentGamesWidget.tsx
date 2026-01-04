/**
 * RecentGamesWidget Component
 * Display recently played games
 */

import React from 'react';
import type { Game } from '@emuz/core';
import { WidgetContainer, WidgetContainerProps } from './WidgetContainer';

export interface RecentGamesWidgetProps extends Omit<WidgetContainerProps, 'children'> {
  /** Recent games list */
  games: Game[];
  /** Max games to show */
  maxGames?: number;
  /** Game click handler */
  onGameClick?: (game: Game) => void;
  /** Game play handler */
  onGamePlay?: (game: Game) => void;
}

// Placeholder image
const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect fill='%23334155' width='48' height='48' rx='6'/%3E%3C/svg%3E`;

export const RecentGamesWidget: React.FC<RecentGamesWidgetProps> = ({
  games,
  maxGames = 5,
  onGameClick,
  onGamePlay,
  loading = false,
  ...containerProps
}) => {
  const displayGames = games.slice(0, maxGames);
  
  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };
  
  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    backgroundColor: 'transparent',
  };
  
  const coverStyle: React.CSSProperties = {
    width: 40,
    height: 52,
    borderRadius: 6,
    objectFit: 'cover',
    backgroundColor: 'var(--skeleton, #334155)',
    flexShrink: 0,
  };
  
  const infoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };
  
  const titleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-primary, #F8FAFC)',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
  
  const metaStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-muted, #64748B)',
    margin: 0,
  };
  
  const playButtonStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    border: 'none',
    backgroundColor: 'var(--color-primary, #10B981)',
    color: '#FFFFFF',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    opacity: 0,
    flexShrink: 0,
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
  
  const formatLastPlayed = (date?: Date): string => {
    if (!date) return '';
    const now = new Date();
    const lastPlayed = new Date(date);
    const diffMs = now.getTime() - lastPlayed.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return lastPlayed.toLocaleDateString();
  };
  
  return (
    <WidgetContainer
      title="Recent Games"
      loading={loading}
      {...containerProps}
    >
      {displayGames.length === 0 ? (
        <div style={emptyStyle}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 8, opacity: 0.5 }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p style={{ margin: 0, fontSize: 13 }}>No recently played games</p>
        </div>
      ) : (
        <div style={listStyle}>
          {displayGames.map((game) => (
            <div
              key={game.id}
              style={itemStyle}
              onClick={() => onGameClick?.(game)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover, #334155)';
                const playBtn = e.currentTarget.querySelector('[data-play-btn]') as HTMLElement;
                if (playBtn) playBtn.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                const playBtn = e.currentTarget.querySelector('[data-play-btn]') as HTMLElement;
                if (playBtn) playBtn.style.opacity = '0';
              }}
            >
              <img
                src={game.coverPath || placeholderImage}
                alt={game.title}
                style={coverStyle}
                onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage; }}
              />
              <div style={infoStyle}>
                <p style={titleStyle}>{game.title}</p>
                <p style={metaStyle}>{formatLastPlayed(game.lastPlayedAt)}</p>
              </div>
              <button
                data-play-btn
                style={playButtonStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  onGamePlay?.(game);
                }}
                aria-label={`Play ${game.title}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </WidgetContainer>
  );
};

RecentGamesWidget.displayName = 'RecentGamesWidget';

export default RecentGamesWidget;
