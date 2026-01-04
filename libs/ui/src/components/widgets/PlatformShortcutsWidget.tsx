/**
 * PlatformShortcutsWidget Component
 * Quick access to platforms
 */

import React from 'react';
import type { Platform } from '@emuz/core';
import { WidgetContainer, WidgetContainerProps } from './WidgetContainer';

export interface PlatformShortcutsWidgetProps extends Omit<WidgetContainerProps, 'children'> {
  /** Platforms list */
  platforms: Platform[];
  /** Game counts by platform ID */
  gameCounts?: Record<string, number>;
  /** Max platforms to show */
  maxPlatforms?: number;
  /** Platform click handler */
  onPlatformClick?: (platform: Platform) => void;
}

// Platform color mapping
const platformColors: Record<string, string> = {
  nes: '#E60012',
  snes: '#7B5AA6',
  n64: '#009E60',
  gamecube: '#6A5ACD',
  wii: '#1BA1E2',
  switch: '#E60012',
  gb: '#8B956D',
  gba: '#5A3D90',
  nds: '#CCCCCC',
  '3ds': '#D12228',
  psx: '#003087',
  ps2: '#003087',
  psp: '#003087',
  genesis: '#0060A8',
  saturn: '#0060A8',
  dreamcast: '#F7971C',
  xbox: '#107C10',
  default: '#64748B',
};

// Platform icon placeholder
const PlatformIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="8" cy="12" r="2" />
    <line x1="14" y1="10" x2="18" y2="10" />
    <line x1="14" y1="14" x2="18" y2="14" />
  </svg>
);

export const PlatformShortcutsWidget: React.FC<PlatformShortcutsWidgetProps> = ({
  platforms,
  gameCounts = {},
  maxPlatforms = 6,
  onPlatformClick,
  loading = false,
  ...containerProps
}) => {
  const displayPlatforms = platforms.slice(0, maxPlatforms);
  
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: 12,
  };
  
  const itemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
  };
  
  const iconContainerStyle = (color: string): React.CSSProperties => ({
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${color}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });
  
  const nameStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-primary, #F8FAFC)',
    margin: 0,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  };
  
  const countStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 500,
    color: 'var(--text-muted, #64748B)',
    margin: 0,
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
  
  const getPlatformColor = (platformId: string): string => {
    const key = platformId.toLowerCase().replace(/[^a-z0-9]/g, '');
    return platformColors[key] || platformColors['default'];
  };
  
  return (
    <WidgetContainer
      title="Platforms"
      loading={loading}
      {...containerProps}
    >
      {displayPlatforms.length === 0 ? (
        <div style={emptyStyle}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 8, opacity: 0.5 }}>
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="8" cy="12" r="2" />
          </svg>
          <p style={{ margin: 0, fontSize: 13 }}>No platforms found</p>
        </div>
      ) : (
        <div style={gridStyle}>
          {displayPlatforms.map((platform) => {
            const color = getPlatformColor(platform.id);
            const count = gameCounts[platform.id] || 0;
            
            return (
              <div
                key={platform.id}
                style={itemStyle}
                onClick={() => onPlatformClick?.(platform)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover, #334155)';
                  e.currentTarget.style.borderColor = `${color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                title={`${platform.name} (${count} games)`}
              >
                <span style={iconContainerStyle(color)}>
                  <PlatformIcon color={color} />
                </span>
                <p style={nameStyle}>{platform.shortName || platform.name}</p>
                <p style={countStyle}>{count} games</p>
              </div>
            );
          })}
        </div>
      )}
    </WidgetContainer>
  );
};

PlatformShortcutsWidget.displayName = 'PlatformShortcutsWidget';

export default PlatformShortcutsWidget;
