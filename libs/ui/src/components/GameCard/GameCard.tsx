/**
 * GameCard Component
 * Display a game with cover art and metadata
 */

import React from 'react';
import type { Game, Platform } from '@emuz/core';

export interface GameCardProps {
  /** Game data */
  game: Game;
  /** Platform info (optional) */
  platform?: Platform;
  /** Card size */
  size?: 'small' | 'medium' | 'large';
  /** Show platform badge */
  showPlatform?: boolean;
  /** Is favorite */
  isFavorite?: boolean;
  /** Is selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: (game: Game) => void;
  /** Double click handler (for play) */
  onDoubleClick?: (game: Game) => void;
  /** Context menu handler */
  onContextMenu?: (game: Game, event: React.MouseEvent) => void;
  /** Favorite toggle handler */
  onFavoriteToggle?: (game: Game) => void;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

const sizeConfig = {
  small: {
    width: 120,
    height: 160,
    titleSize: 12,
    badgeSize: 10,
    padding: 8,
  },
  medium: {
    width: 160,
    height: 220,
    titleSize: 14,
    badgeSize: 11,
    padding: 10,
  },
  large: {
    width: 200,
    height: 280,
    titleSize: 16,
    badgeSize: 12,
    padding: 12,
  },
};

// Placeholder image as inline SVG data URL
const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='280' viewBox='0 0 200 280'%3E%3Crect fill='%23334155' width='200' height='280'/%3E%3Ctext x='100' y='140' fill='%2364748B' font-family='sans-serif' font-size='14' text-anchor='middle' dominant-baseline='middle'%3ENo Cover%3C/text%3E%3C/svg%3E`;

export const GameCard: React.FC<GameCardProps> = ({
  game,
  platform,
  size = 'medium',
  showPlatform = true,
  isFavorite = false,
  isSelected = false,
  onClick,
  onDoubleClick,
  onContextMenu,
  onFavoriteToggle,
  className = '',
  style,
  testID,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  
  const config = sizeConfig[size];
  
  const coverUrl = imageError ? placeholderImage : (game.coverPath || placeholderImage);
  
  const containerStyle: React.CSSProperties = {
    width: config.width,
    position: 'relative',
    cursor: 'pointer',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'var(--gamecard-bg, #1E293B)',
    border: '2px solid var(--gamecard-border, #334155)',
    transition: 'all 0.2s ease',
    ...(isHovered && {
      borderColor: 'var(--color-primary, #10B981)',
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
    }),
    ...(isPressed && {
      transform: 'translateY(-2px) scale(1.01)',
    }),
    ...(isSelected && {
      borderColor: 'var(--color-primary, #10B981)',
      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.3)',
    }),
    ...style,
  };
  
  const imageContainerStyle: React.CSSProperties = {
    width: '100%',
    height: config.height - 48,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'var(--skeleton, #334155)',
  };
  
  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.2s ease',
    ...(isHovered && {
      transform: 'scale(1.05)',
    }),
  };
  
  const infoStyle: React.CSSProperties = {
    padding: config.padding,
    backgroundColor: 'var(--gamecard-bg, #1E293B)',
  };
  
  const titleStyle: React.CSSProperties = {
    fontSize: config.titleSize,
    fontWeight: 500,
    color: 'var(--text-primary, #F8FAFC)',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1.3,
  };
  
  const platformBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: '2px 6px',
    borderRadius: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(4px)',
    fontSize: config.badgeSize,
    fontWeight: 500,
    color: 'var(--text-secondary, #CBD5E1)',
  };
  
  const favoriteButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(4px)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    opacity: isHovered || isFavorite ? 1 : 0,
    transform: isHovered ? 'scale(1)' : 'scale(0.8)',
  };
  
  const playOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    opacity: isHovered ? 1 : 0,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none',
  };
  
  const playIconStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary, #10B981)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: isHovered ? 'scale(1)' : 'scale(0.8)',
    transition: 'transform 0.2s ease',
  };
  
  const handleClick = (_e: React.MouseEvent) => {
    onClick?.(game);
  };
  
  const handleDoubleClick = (_e: React.MouseEvent) => {
    onDoubleClick?.(game);
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(game, e);
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(game);
  };
  
  return (
    <div
      className={className}
      style={containerStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      role="button"
      tabIndex={0}
      aria-label={`${game.title}${platform ? ` (${platform.name})` : ''}`}
      data-testid={testID}
    >
      {/* Cover Image */}
      <div style={imageContainerStyle}>
        <img
          src={coverUrl}
          alt={game.title}
          style={imageStyle}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {/* Platform Badge */}
        {showPlatform && (platform || game.platformId) && (
          <span style={platformBadgeStyle}>
            {platform?.shortName || platform?.name || game.platformId}
          </span>
        )}
        
        {/* Favorite Button */}
        <button
          style={favoriteButtonStyle}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isFavorite ? '#EF4444' : 'none'}
            stroke={isFavorite ? '#EF4444' : '#CBD5E1'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        
        {/* Play Overlay */}
        <div style={playOverlayStyle}>
          <div style={playIconStyle}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#FFFFFF"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Game Info */}
      <div style={infoStyle}>
        <p style={titleStyle} title={game.title}>
          {game.title}
        </p>
      </div>
    </div>
  );
};

GameCard.displayName = 'GameCard';

export default GameCard;
