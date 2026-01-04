/**
 * GenreList Component
 * Display list of genres with game counts
 */

import React from 'react';
import type { Genre } from '@emuz/core';

export interface GenreListProps {
  /** Genres list */
  genres: Genre[];
  /** Game counts by genre ID */
  gameCounts?: Record<string, number>;
  /** Selected genre ID */
  selectedId?: string;
  /** Layout mode */
  layout?: 'list' | 'grid' | 'horizontal';
  /** Genre click handler */
  onGenreClick?: (genre: Genre) => void;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// Genre color mapping
const genreColors: Record<string, string> = {
  action: '#EF4444',
  adventure: '#10B981',
  rpg: '#8B5CF6',
  puzzle: '#F59E0B',
  racing: '#06B6D4',
  sports: '#22C55E',
  simulation: '#6366F1',
  strategy: '#EC4899',
  fighting: '#DC2626',
  platformer: '#F97316',
  shooter: '#EF4444',
  horror: '#7C3AED',
  default: '#64748B',
};

// Genre icon placeholder
const GenreIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color} stroke="none">
    <circle cx="12" cy="12" r="10" opacity="0.2" />
    <circle cx="12" cy="12" r="5" />
  </svg>
);

export const GenreItem: React.FC<{
  genre: Genre;
  count?: number;
  isSelected?: boolean;
  layout?: 'list' | 'grid' | 'horizontal';
  onClick?: () => void;
}> = ({ genre, count = 0, isSelected = false, layout = 'list', onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const getGenreColor = (): string => {
    const key = genre.name.toLowerCase().replace(/[^a-z]/g, '');
    return genre.color || genreColors[key] || genreColors['default'];
  };
  
  const color = getGenreColor();
  
  const isGrid = layout === 'grid';
  const isHorizontal = layout === 'horizontal';
  
  const itemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isGrid ? 'column' : 'row',
    alignItems: 'center',
    gap: isGrid ? 8 : 12,
    padding: isGrid ? 16 : (isHorizontal ? '8px 16px' : '10px 12px'),
    borderRadius: isGrid ? 12 : (isHorizontal ? 20 : 8),
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    backgroundColor: isSelected 
      ? `${color}20`
      : (isHovered ? 'var(--surface-hover, #334155)' : 'transparent'),
    border: isHorizontal 
      ? `1px solid ${isSelected ? color : (isHovered ? 'var(--border-hover, #475569)' : 'var(--border, #334155)')}`
      : 'none',
    minWidth: isHorizontal ? 'auto' : undefined,
    textAlign: isGrid ? 'center' : 'left',
  };
  
  const iconContainerStyle: React.CSSProperties = {
    width: isGrid ? 40 : 24,
    height: isGrid ? 40 : 24,
    borderRadius: isGrid ? 10 : 6,
    backgroundColor: `${color}20`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
  
  const labelStyle: React.CSSProperties = {
    flex: isHorizontal ? undefined : 1,
    fontSize: isGrid ? 13 : 14,
    fontWeight: isSelected ? 600 : 500,
    color: isSelected ? color : 'var(--text-primary, #F8FAFC)',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
  
  const countStyle: React.CSSProperties = {
    fontSize: isGrid ? 11 : 12,
    fontWeight: 500,
    color: 'var(--text-muted, #64748B)',
    margin: 0,
    ...(isHorizontal && { marginLeft: 4 }),
  };
  
  return (
    <div
      style={itemStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
    >
      <span style={iconContainerStyle}>
        <GenreIcon color={color} />
      </span>
      <p style={labelStyle}>{genre.name}</p>
      {!isGrid && (
        <span style={countStyle}>{count}</span>
      )}
      {isGrid && (
        <span style={countStyle}>{count} games</span>
      )}
    </div>
  );
};

export const GenreList: React.FC<GenreListProps> = ({
  genres,
  gameCounts = {},
  selectedId,
  layout = 'list',
  onGenreClick,
  className = '',
  style,
  testID,
}) => {
  const containerStyle: React.CSSProperties = {
    display: layout === 'horizontal' ? 'flex' : (layout === 'grid' ? 'grid' : 'flex'),
    flexDirection: layout === 'list' ? 'column' : 'row',
    gap: layout === 'grid' ? 12 : 8,
    ...(layout === 'grid' && {
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    }),
    ...(layout === 'horizontal' && {
      overflowX: 'auto',
      paddingBottom: 8,
      scrollbarWidth: 'thin',
    }),
    ...style,
  };
  
  const emptyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    color: 'var(--text-muted, #64748B)',
    textAlign: 'center',
  };
  
  if (genres.length === 0) {
    return (
      <div className={className} style={emptyStyle} data-testid={testID}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 8, opacity: 0.5 }}>
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
        </svg>
        <p style={{ margin: 0, fontSize: 13 }}>No genres found</p>
      </div>
    );
  }
  
  return (
    <div className={className} style={containerStyle} data-testid={testID}>
      {genres.map((genre) => (
        <GenreItem
          key={genre.id}
          genre={genre}
          count={gameCounts[genre.id] || 0}
          isSelected={selectedId === genre.id}
          layout={layout}
          onClick={() => onGenreClick?.(genre)}
        />
      ))}
    </div>
  );
};

GenreList.displayName = 'GenreList';

export default GenreList;
