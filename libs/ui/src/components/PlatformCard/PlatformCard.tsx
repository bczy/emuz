/**
 * PlatformCard Component
 * Display a platform with wallpaper background
 */

import React from 'react';
import type { Platform } from '@emuz/core';

export interface PlatformCardProps {
  /** Platform data */
  platform: Platform;
  /** Game count */
  gameCount?: number;
  /** Wallpaper image URL */
  wallpaperUrl?: string;
  /** Card size */
  size?: 'small' | 'medium' | 'large';
  /** Is selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: (platform: Platform) => void;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

const sizeConfig = {
  small: { width: 160, height: 100, titleSize: 14, iconSize: 24 },
  medium: { width: 240, height: 140, titleSize: 18, iconSize: 32 },
  large: { width: 320, height: 180, titleSize: 24, iconSize: 40 },
};

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
  default: '#10B981',
};

export const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  gameCount = 0,
  wallpaperUrl,
  size = 'medium',
  isSelected = false,
  onClick,
  className = '',
  style,
  testID,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  
  const config = sizeConfig[size];
  
  const getPlatformColor = (): string => {
    const key = platform.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    return platformColors[key] || platformColors['default'];
  };
  
  const platformColor = getPlatformColor();
  
  const containerStyle: React.CSSProperties = {
    width: config.width,
    height: config.height,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '2px solid transparent',
    ...(isHovered && {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: `0 10px 30px ${platformColor}40`,
      borderColor: platformColor,
    }),
    ...(isSelected && {
      borderColor: platformColor,
      boxShadow: `0 0 0 3px ${platformColor}40`,
    }),
    ...style,
  };
  
  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--surface, #1E293B)',
  };
  
  const wallpaperStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: wallpaperUrl && !imageError ? `url(${wallpaperUrl})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'transform 0.3s ease',
    ...(isHovered && {
      transform: 'scale(1.1)',
    }),
  };
  
  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${platformColor}CC 0%, rgba(15, 23, 42, 0.9) 100%)`,
  };
  
  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: size === 'small' ? 12 : 16,
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  };
  
  const iconContainerStyle: React.CSSProperties = {
    width: config.iconSize + 8,
    height: config.iconSize + 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  const gameCountBadgeStyle: React.CSSProperties = {
    padding: '4px 10px',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(4px)',
    fontSize: size === 'small' ? 11 : 12,
    fontWeight: 600,
    color: '#FFFFFF',
  };
  
  const infoStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };
  
  const titleStyle: React.CSSProperties = {
    fontSize: config.titleSize,
    fontWeight: 700,
    color: '#FFFFFF',
    margin: 0,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  };
  
  const subtitleStyle: React.CSSProperties = {
    fontSize: size === 'small' ? 11 : 12,
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
  };
  
  // Platform icon
  const PlatformIcon = () => (
    <svg
      width={config.iconSize}
      height={config.iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <line x1="14" y1="10" x2="18" y2="10" />
      <line x1="14" y1="14" x2="18" y2="14" />
    </svg>
  );
  
  return (
    <div
      className={className}
      style={containerStyle}
      onClick={() => onClick?.(platform)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${platform.name} - ${gameCount} games`}
      data-testid={testID}
    >
      {/* Background */}
      <div style={backgroundStyle}>
        {wallpaperUrl && !imageError && (
          <div style={wallpaperStyle}>
            <img
              src={wallpaperUrl}
              alt=""
              style={{ display: 'none' }}
              onError={() => setImageError(true)}
            />
          </div>
        )}
        <div style={overlayStyle} />
      </div>
      
      {/* Content */}
      <div style={contentStyle}>
        <div style={headerStyle}>
          <span style={iconContainerStyle}>
            <PlatformIcon />
          </span>
          <span style={gameCountBadgeStyle}>
            {gameCount} {gameCount === 1 ? 'game' : 'games'}
          </span>
        </div>
        
        <div style={infoStyle}>
          <h3 style={titleStyle}>{platform.name}</h3>
          {platform.manufacturer && (
            <p style={subtitleStyle}>{platform.manufacturer}</p>
          )}
        </div>
      </div>
    </div>
  );
};

PlatformCard.displayName = 'PlatformCard';

export default PlatformCard;
