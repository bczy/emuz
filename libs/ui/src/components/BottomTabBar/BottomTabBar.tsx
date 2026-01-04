/**
 * BottomTabBar Component
 * Bottom navigation for mobile apps
 */

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface BottomTabBarProps {
  /** Tab items */
  tabs: TabItem[];
  /** Active tab ID */
  activeTabId: string;
  /** Tab change handler */
  onTabChange: (tabId: string) => void;
  /** Hide labels */
  hideLabels?: boolean;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

// Default tabs for EmuZ
export const defaultTabs: TabItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'platforms',
    label: 'Platforms',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="8" cy="12" r="2" />
        <line x1="14" y1="10" x2="18" y2="10" />
        <line x1="14" y1="14" x2="18" y2="14" />
      </svg>
    ),
  },
  {
    id: 'genres',
    label: 'Genres',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'search',
    label: 'Search',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  tabs = defaultTabs,
  activeTabId,
  onTabChange,
  hideLabels = false,
  className = '',
  style,
  testID,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'var(--bottomtab-bg, #0F172A)',
    borderTop: '1px solid var(--bottomtab-border, #1E293B)',
    paddingBottom: 'env(safe-area-inset-bottom, 0)',
    minHeight: 56,
    ...style,
  };
  
  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hideLabels ? 0 : 4,
    flex: 1,
    padding: '8px 4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    color: isActive ? 'var(--color-primary, #10B981)' : 'var(--bottomtab-inactive, #64748B)',
    position: 'relative',
    minWidth: 0,
  });
  
  const iconContainerStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...(isActive && {
      filter: 'drop-shadow(0 0 8px var(--color-primary, #10B981))',
    }),
  });
  
  const labelStyle = (isActive: boolean): React.CSSProperties => ({
    fontSize: 11,
    fontWeight: isActive ? 600 : 500,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  });
  
  const badgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'var(--color-error, #EF4444)',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  };
  
  const activeIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 32,
    height: 3,
    borderRadius: '0 0 3px 3px',
    backgroundColor: 'var(--color-primary, #10B981)',
  };
  
  return (
    <nav className={className} style={containerStyle} data-testid={testID} role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        
        return (
          <button
            key={tab.id}
            style={tabStyle(isActive)}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
          >
            {isActive && <span style={activeIndicatorStyle} />}
            
            <span style={iconContainerStyle(isActive)}>
              {tab.icon}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span style={badgeStyle}>
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </span>
            
            {!hideLabels && (
              <span style={labelStyle(isActive)}>{tab.label}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

BottomTabBar.displayName = 'BottomTabBar';

export default BottomTabBar;
