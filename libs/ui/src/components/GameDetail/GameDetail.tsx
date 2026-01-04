/**
 * GameDetail Component
 * Detailed view of a game with metadata and actions
 */

import React from 'react';
import type { Game, Platform, Emulator } from '@emuz/core';

export interface GameDetailProps {
  /** Game data */
  game: Game;
  /** Platform info */
  platform?: Platform;
  /** Available emulators */
  emulators?: Emulator[];
  /** Selected emulator ID */
  selectedEmulatorId?: string;
  /** Is favorite */
  isFavorite?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Play handler */
  onPlay?: (game: Game, emulatorId?: string) => void;
  /** Favorite toggle handler */
  onFavoriteToggle?: (game: Game) => void;
  /** Edit handler */
  onEdit?: (game: Game) => void;
  /** Close handler */
  onClose?: () => void;
  /** Emulator select handler */
  onEmulatorSelect?: (emulatorId: string) => void;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// Placeholder image
const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect fill='%23334155' width='300' height='400'/%3E%3Ctext x='150' y='200' fill='%2364748B' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='middle'%3ENo Cover%3C/text%3E%3C/svg%3E`;

export const GameDetail: React.FC<GameDetailProps> = ({
  game,
  platform,
  emulators = [],
  selectedEmulatorId,
  isFavorite = false,
  loading = false,
  onPlay,
  onFavoriteToggle,
  onEdit,
  onClose,
  onEmulatorSelect,
  className = '',
  style,
  testID,
}) => {
  const [imageError, setImageError] = React.useState(false);
  
  const coverUrl = imageError ? placeholderImage : (game.coverPath || placeholderImage);
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    padding: 24,
    backgroundColor: 'var(--surface, #1E293B)',
    borderRadius: 16,
    maxWidth: 600,
    width: '100%',
    ...style,
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };
  
  const closeButtonStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    border: 'none',
    backgroundColor: 'var(--surface-secondary, #334155)',
    color: 'var(--text-secondary, #CBD5E1)',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  };
  
  const contentStyle: React.CSSProperties = {
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap',
  };
  
  const coverContainerStyle: React.CSSProperties = {
    width: 180,
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'var(--skeleton, #334155)',
    flexShrink: 0,
  };
  
  const coverStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };
  
  const infoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 200,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  };
  
  const titleStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-primary, #F8FAFC)',
    margin: 0,
    lineHeight: 1.3,
  };
  
  const platformBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 6,
    backgroundColor: 'var(--surface-secondary, #334155)',
    color: 'var(--text-secondary, #CBD5E1)',
    fontSize: 13,
    fontWeight: 500,
    width: 'fit-content',
  };
  
  const metadataStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '8px 16px',
  };
  
  const metaLabelStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--text-muted, #64748B)',
    fontWeight: 500,
  };
  
  const metaValueStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--text-secondary, #CBD5E1)',
  };
  
  const descriptionStyle: React.CSSProperties = {
    fontSize: 14,
    color: 'var(--text-secondary, #CBD5E1)',
    lineHeight: 1.6,
    margin: 0,
    maxHeight: 120,
    overflow: 'auto',
  };
  
  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    paddingTop: 8,
  };
  
  const playButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 24px',
    backgroundColor: 'var(--color-primary, #10B981)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flex: 1,
    minWidth: 120,
  };
  
  const secondaryButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '12px 16px',
    backgroundColor: 'var(--surface-secondary, #334155)',
    color: 'var(--text-secondary, #CBD5E1)',
    border: '1px solid var(--border, #475569)',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };
  
  const emulatorSelectStyle: React.CSSProperties = {
    padding: '10px 12px',
    backgroundColor: 'var(--surface-secondary, #334155)',
    color: 'var(--text-secondary, #CBD5E1)',
    border: '1px solid var(--border, #475569)',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    outline: 'none',
    minWidth: 150,
  };
  
  const formatPlayTime = (seconds?: number): string => {
    if (!seconds) return 'Never played';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
  };
  
  const formatDate = (date?: Date): string => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };
  
  return (
    <div className={className} style={containerStyle} data-testid={testID}>
      {/* Header with close button */}
      <div style={headerStyle}>
        <span />
        {onClose && (
          <button
            style={closeButtonStyle}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Content */}
      <div style={contentStyle}>
        {/* Cover Image */}
        <div style={coverContainerStyle}>
          <img
            src={coverUrl}
            alt={game.title}
            style={coverStyle}
            onError={() => setImageError(true)}
          />
        </div>
        
        {/* Info */}
        <div style={infoStyle}>
          <h2 style={titleStyle}>{game.title}</h2>
          
          {platform && (
            <span style={platformBadgeStyle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="8" cy="12" r="2" />
              </svg>
              {platform.name}
            </span>
          )}
          
          {/* Metadata */}
          <div style={metadataStyle}>
            {game.developer && (
              <>
                <span style={metaLabelStyle}>Developer</span>
                <span style={metaValueStyle}>{game.developer}</span>
              </>
            )}
            {game.releaseDate && (
              <>
                <span style={metaLabelStyle}>Release Date</span>
                <span style={metaValueStyle}>{game.releaseDate}</span>
              </>
            )}
            <span style={metaLabelStyle}>Play Time</span>
            <span style={metaValueStyle}>{formatPlayTime(game.playTime)}</span>
            <span style={metaLabelStyle}>Last Played</span>
            <span style={metaValueStyle}>{formatDate(game.lastPlayedAt)}</span>
          </div>
          
          {/* Description */}
          {game.description && (
            <p style={descriptionStyle}>{game.description}</p>
          )}
        </div>
      </div>
      
      {/* Emulator Select */}
      {emulators.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={metaLabelStyle}>Emulator:</span>
          <select
            style={emulatorSelectStyle}
            value={selectedEmulatorId || emulators[0]?.id}
            onChange={(e) => onEmulatorSelect?.(e.target.value)}
          >
            {emulators.map((emu) => (
              <option key={emu.id} value={emu.id}>
                {emu.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Actions */}
      <div style={actionsStyle}>
        <button
          style={playButtonStyle}
          onClick={() => onPlay?.(game, selectedEmulatorId)}
          disabled={loading}
        >
          {loading ? (
            <span>Launching...</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Play</span>
            </>
          )}
        </button>
        
        <button
          style={{
            ...secondaryButtonStyle,
            color: isFavorite ? '#EF4444' : undefined,
          }}
          onClick={() => onFavoriteToggle?.(game)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {isFavorite ? 'Favorited' : 'Favorite'}
        </button>
        
        {onEdit && (
          <button
            style={secondaryButtonStyle}
            onClick={() => onEdit(game)}
            aria-label="Edit game"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

GameDetail.displayName = 'GameDetail';

export default GameDetail;
