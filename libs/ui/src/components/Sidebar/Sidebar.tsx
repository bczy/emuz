/**
 * Sidebar Component
 * Navigation sidebar with platform and collection lists
 */

import React from 'react';
import type { Platform, Collection } from '@emuz/core';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  isActive?: boolean;
  type: 'platform' | 'collection' | 'action';
}

export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface SidebarProps {
  /** Platforms list */
  platforms?: Platform[];
  /** Collections list */
  collections?: Collection[];
  /** Game counts by platform ID */
  platformCounts?: Record<string, number>;
  /** Game counts by collection ID */
  collectionCounts?: Record<string, number>;
  /** Currently selected item ID */
  selectedId?: string;
  /** Sidebar collapsed state */
  collapsed?: boolean;
  /** Platform click handler */
  onPlatformClick?: (platform: Platform) => void;
  /** Collection click handler */
  onCollectionClick?: (collection: Collection) => void;
  /** Action click handler */
  onActionClick?: (actionId: string) => void;
  /** Toggle collapse handler */
  onToggleCollapse?: () => void;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  platforms = [],
  collections = [],
  platformCounts = {},
  collectionCounts = {},
  selectedId,
  collapsed = false,
  onPlatformClick,
  onCollectionClick,
  onActionClick: _onActionClick,
  onToggleCollapse,
  className = '',
  style,
  testID,
}) => {
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(new Set());
  
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };
  
  const containerStyle: React.CSSProperties = {
    width: collapsed ? 64 : 240,
    minWidth: collapsed ? 64 : 240,
    height: '100%',
    backgroundColor: 'var(--sidebar-bg, #1E293B)',
    borderRight: '1px solid var(--border, #334155)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.2s ease, min-width 0.2s ease',
    overflow: 'hidden',
    ...style,
  };
  
  const headerStyle: React.CSSProperties = {
    padding: collapsed ? 16 : '16px 16px 12px 16px',
    borderBottom: '1px solid var(--border, #334155)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'space-between',
  };
  
  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };
  
  const logoTextStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--color-primary, #10B981)',
    margin: 0,
    display: collapsed ? 'none' : 'block',
  };
  
  const collapseButtonStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-muted, #64748B)',
    cursor: 'pointer',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  };
  
  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: collapsed ? '12px 8px' : '12px 8px',
  };
  
  const sectionStyle: React.CSSProperties = {
    marginBottom: 16,
  };
  
  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 8px',
    cursor: 'pointer',
    borderRadius: 6,
    transition: 'background-color 0.15s ease',
  };
  
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-muted, #64748B)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0,
    display: collapsed ? 'none' : 'block',
  };
  
  const itemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: collapsed ? '10px' : '10px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    justifyContent: collapsed ? 'center' : 'flex-start',
    backgroundColor: isActive ? 'var(--sidebar-active-bg, rgba(16, 185, 129, 0.15))' : 'transparent',
    color: isActive ? 'var(--color-primary, #10B981)' : 'var(--text-secondary, #CBD5E1)',
  });
  
  const itemLabelStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: collapsed ? 'none' : 'block',
  };
  
  const countBadgeStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--text-muted, #64748B)',
    backgroundColor: 'var(--surface-secondary, #334155)',
    padding: '2px 6px',
    borderRadius: 10,
    display: collapsed ? 'none' : 'block',
  };
  
  const iconContainerStyle: React.CSSProperties = {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
  
  // Platform icon placeholder
  const PlatformIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <line x1="14" y1="10" x2="18" y2="10" />
      <line x1="14" y1="14" x2="18" y2="14" />
    </svg>
  );
  
  // Collection icon placeholder
  const CollectionIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
  
  // Chevron icon
  const ChevronIcon = ({ collapsed: isCollapsed }: { collapsed: boolean }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{
        transition: 'transform 0.2s ease',
        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
  
  return (
    <aside className={className} style={containerStyle} data-testid={testID}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={logoStyle}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#10B981" />
            <text x="16" y="22" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">E</text>
          </svg>
          <h1 style={logoTextStyle}>EmuZ</h1>
        </div>
        {!collapsed && onToggleCollapse && (
          <button
            style={collapseButtonStyle}
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        {collapsed && onToggleCollapse && (
          <button
            style={{ ...collapseButtonStyle, position: 'absolute', right: 8 }}
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Content */}
      <nav style={contentStyle}>
        {/* Platforms Section */}
        {platforms.length > 0 && (
          <div style={sectionStyle}>
            <div
              style={sectionHeaderStyle}
              onClick={() => toggleSection('platforms')}
              role="button"
              tabIndex={0}
            >
              <span style={sectionTitleStyle}>Platforms</span>
              {!collapsed && <ChevronIcon collapsed={collapsedSections.has('platforms')} />}
            </div>
            
            {!collapsedSections.has('platforms') && (
              <div>
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    style={itemStyle(selectedId === platform.id)}
                    onClick={() => onPlatformClick?.(platform)}
                    role="button"
                    tabIndex={0}
                    title={collapsed ? platform.name : undefined}
                  >
                    <span style={iconContainerStyle}>
                      <PlatformIcon />
                    </span>
                    <span style={itemLabelStyle}>{platform.name}</span>
                    {platformCounts[platform.id] !== undefined && (
                      <span style={countBadgeStyle}>{platformCounts[platform.id]}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Collections Section */}
        {collections.length > 0 && (
          <div style={sectionStyle}>
            <div
              style={sectionHeaderStyle}
              onClick={() => toggleSection('collections')}
              role="button"
              tabIndex={0}
            >
              <span style={sectionTitleStyle}>Collections</span>
              {!collapsed && <ChevronIcon collapsed={collapsedSections.has('collections')} />}
            </div>
            
            {!collapsedSections.has('collections') && (
              <div>
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    style={itemStyle(selectedId === collection.id)}
                    onClick={() => onCollectionClick?.(collection)}
                    role="button"
                    tabIndex={0}
                    title={collapsed ? collection.name : undefined}
                  >
                    <span style={iconContainerStyle}>
                      <CollectionIcon />
                    </span>
                    <span style={itemLabelStyle}>{collection.name}</span>
                    {collectionCounts[collection.id] !== undefined && (
                      <span style={countBadgeStyle}>{collectionCounts[collection.id]}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;
