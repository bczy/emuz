/**
 * App Router Configuration
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load screens for better performance
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const LibraryScreen = lazy(() => import('./screens/LibraryScreen'));
const PlatformScreen = lazy(() => import('./screens/PlatformScreen'));
const GenreScreen = lazy(() => import('./screens/GenreScreen'));
const CollectionScreen = lazy(() => import('./screens/CollectionScreen'));
const GameDetailScreen = lazy(() => import('./screens/GameDetailScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));
const SetupWizard = lazy(() => import('./screens/SetupWizard'));

// Loading fallback component
const LoadingFallback: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  };
  
  const spinnerStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    border: '3px solid var(--border, #334155)',
    borderTopColor: 'var(--color-primary, #10B981)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };
  
  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={spinnerStyle} />
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Home - Dashboard with widgets */}
        <Route path="/" element={<HomeScreen />} />
        
        {/* Library - Grid view of all games */}
        <Route path="/library" element={<LibraryScreen />} />
        
        {/* Platform - Games filtered by platform */}
        <Route path="/platform/:platformId" element={<PlatformScreen />} />
        
        {/* Genre - Games filtered by genre */}
        <Route path="/genre/:genreId" element={<GenreScreen />} />
        
        {/* Collection - Games in a collection */}
        <Route path="/collection/:collectionId" element={<CollectionScreen />} />
        
        {/* Game Detail - Full game view */}
        <Route path="/game/:gameId" element={<GameDetailScreen />} />
        
        {/* Settings */}
        <Route path="/settings" element={<SettingsScreen />} />
        
        {/* Setup wizard for first run */}
        <Route path="/setup" element={<SetupWizard />} />
        
        {/* Fallback - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
