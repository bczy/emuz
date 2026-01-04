/**
 * StatsWidget Component
 * Display library statistics
 */

import React from 'react';
import { WidgetContainer, WidgetContainerProps } from './WidgetContainer';

export interface LibraryStats {
  totalGames: number;
  totalPlatforms: number;
  totalPlayTime: number; // in minutes
  favoriteCount: number;
  recentlyAddedCount: number;
  recentlyPlayedCount: number;
}

export interface StatsWidgetProps extends Omit<WidgetContainerProps, 'children'> {
  /** Library statistics */
  stats: LibraryStats;
  /** Stat click handler */
  onStatClick?: (statKey: keyof LibraryStats) => void;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  onClick?: () => void;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 10,
    backgroundColor: isHovered ? 'var(--surface-hover, #334155)' : 'transparent',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background-color 0.15s ease',
    textAlign: 'center',
  };
  
  const iconStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: color ? `${color}20` : 'var(--surface-secondary, #334155)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color || 'var(--text-secondary, #CBD5E1)',
  };
  
  const valueStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary, #F8FAFC)',
    margin: 0,
    lineHeight: 1.2,
  };
  
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--text-muted, #64748B)',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  };
  
  return (
    <div
      style={style}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={iconStyle}>{icon}</span>
      <p style={valueStyle}>{value}</p>
      <p style={labelStyle}>{label}</p>
    </div>
  );
};

export const StatsWidget: React.FC<StatsWidgetProps> = ({
  stats,
  onStatClick,
  loading = false,
  ...containerProps
}) => {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 4,
  };
  
  const formatPlayTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };
  
  return (
    <WidgetContainer
      title="Library Stats"
      size="medium"
      loading={loading}
      {...containerProps}
    >
      <div style={gridStyle}>
        <StatItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          }
          label="Games"
          value={stats.totalGames}
          color="#10B981"
          onClick={() => onStatClick?.('totalGames')}
        />
        <StatItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="8" cy="12" r="2" />
            </svg>
          }
          label="Platforms"
          value={stats.totalPlatforms}
          color="#3B82F6"
          onClick={() => onStatClick?.('totalPlatforms')}
        />
        <StatItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          label="Play Time"
          value={formatPlayTime(stats.totalPlayTime)}
          color="#F59E0B"
          onClick={() => onStatClick?.('totalPlayTime')}
        />
        <StatItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          }
          label="Favorites"
          value={stats.favoriteCount}
          color="#EF4444"
          onClick={() => onStatClick?.('favoriteCount')}
        />
        <StatItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
          label="New"
          value={stats.recentlyAddedCount}
          color="#8B5CF6"
          onClick={() => onStatClick?.('recentlyAddedCount')}
        />
        <StatItem
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          }
          label="Played"
          value={stats.recentlyPlayedCount}
          color="#EC4899"
          onClick={() => onStatClick?.('recentlyPlayedCount')}
        />
      </div>
    </WidgetContainer>
  );
};

StatsWidget.displayName = 'StatsWidget';

export default StatsWidget;
