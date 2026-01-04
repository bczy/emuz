/**
 * Main Layout Component
 * Provides the app shell with sidebar and header
 */

import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLibraryStore, useUIStore } from '@emuz/core';
import { Sidebar, SearchBar } from '@emuz/ui';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const { platforms, collections } = useLibraryStore();
  const { sidebar, toggleSidebar, setSearchOpen } = useUIStore();

  // Handle platform click
  const handlePlatformClick = useCallback(
    (id: string) => {
      navigate(`/platform/${id}`);
    },
    [navigate]
  );

  // Handle collection click
  const handleCollectionClick = useCallback(
    (id: string) => {
      navigate(`/collection/${id}`);
    },
    [navigate]
  );

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    },
    [navigate]
  );

  // Get selected ID based on current route
  const getSelectedId = () => {
    const path = location.pathname;
    if (path.startsWith('/platform/')) {
      return path.replace('/platform/', '');
    }
    if (path.startsWith('/collection/')) {
      return path.replace('/collection/', '');
    }
    return undefined;
  };

  // Container style
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--bg-primary, #0F172A)',
    color: 'var(--text-primary, #F8FAFC)',
  };

  // Main content style
  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  // Header style
  const headerStyle: React.CSSProperties = {
    height: 64,
    minHeight: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '0 24px',
    backgroundColor: 'var(--bg-secondary, #1E293B)',
    borderBottom: '1px solid var(--border, #334155)',
    // macOS window controls space (Electron only)
    paddingLeft: typeof process !== 'undefined' && process.platform === 'darwin' ? 80 : 24,
    WebkitAppRegion: 'drag',
  } as React.CSSProperties;

  // Logo style
  const logoStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--color-primary, #10B981)',
    letterSpacing: '-0.5px',
    WebkitAppRegion: 'no-drag',
  } as React.CSSProperties;

  // Search container style
  const searchContainerStyle: React.CSSProperties = {
    flex: 1,
    maxWidth: 480,
    marginLeft: 'auto',
    marginRight: 'auto',
    WebkitAppRegion: 'no-drag',
  } as React.CSSProperties;

  // Window controls style (for Windows/Linux)
  const windowControlsStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    marginLeft: 16,
    WebkitAppRegion: 'no-drag',
  } as React.CSSProperties;

  // Window control button style
  const controlButtonStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary, #CBD5E1)',
  };

  // Content area style
  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: 24,
  };

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <Sidebar
        platforms={platforms}
        collections={collections}
        selectedId={getSelectedId()}
        collapsed={!sidebar.isOpen}
        onPlatformClick={handlePlatformClick}
        onCollectionClick={handleCollectionClick}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main content area */}
      <main style={mainStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <span style={logoStyle}>EmuZ</span>

          <div style={searchContainerStyle}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              placeholder="Search games..."
              shortcutHint="⌘K"
            />
          </div>

          {/* Window controls for Windows/Linux */}
          {typeof process !== 'undefined' && process.platform !== 'darwin' && (
            <div style={windowControlsStyle}>
              <button
                style={controlButtonStyle}
                onClick={() =>
                  (window as unknown as { electron: { minimize: () => void } }).electron.minimize()
                }
                title="Minimize"
              >
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <button
                style={controlButtonStyle}
                onClick={() =>
                  (window as unknown as { electron: { maximize: () => void } }).electron.maximize()
                }
                title="Maximize"
              >
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <rect
                    x="2"
                    y="2"
                    width="8"
                    height="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
              <button
                style={{ ...controlButtonStyle, color: 'var(--color-error, #EF4444)' }}
                onClick={() =>
                  (window as unknown as { electron: { close: () => void } }).electron.close()
                }
                title="Close"
              >
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          )}
        </header>

        {/* Page content */}
        <div style={contentStyle}>{children}</div>
      </main>
    </div>
  );
};
