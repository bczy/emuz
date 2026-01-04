/**
 * Collection Screen - Games in a user collection
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLibraryStore } from '@emuz/core';
import { GameGrid, Button, Input } from '@emuz/ui';
import type { Game } from '@emuz/core';

const CollectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams<{ collectionId: string }>();
  
  const { games, platforms, collections, updateGame, updateCollection, deleteCollection } = useLibraryStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Find the collection
  const collection = useMemo(() =>
    collections.find(c => c.id === collectionId),
    [collections, collectionId]
  );
  
  // Get games in this collection
  const collectionGames = useMemo(() => {
    if (!collection) return [];
    const gameIds = new Set(collection.gameIds);
    return games.filter(g => gameIds.has(g.id));
  }, [games, collection]);
  
  // Favorites set
  const favorites = new Set(
    collectionGames.filter(g => g.isFavorite).map(g => g.id)
  );
  
  // Handlers
  const handleGameClick = useCallback((game: Game) => {
    navigate(`/game/${game.id}`);
  }, [navigate]);
  
  const handleGameDoubleClick = useCallback((game: Game) => {
    console.log('Launch game:', game.title);
  }, []);
  
  const handleFavoriteToggle = useCallback((game: Game) => {
    updateGame(game.id, { isFavorite: !game.isFavorite });
  }, [updateGame]);
  
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  const handleStartEdit = useCallback(() => {
    if (collection) {
      setEditName(collection.name);
      setIsEditing(true);
    }
  }, [collection]);
  
  const handleSaveEdit = useCallback(() => {
    if (collection && editName.trim()) {
      updateCollection(collection.id, { name: editName.trim() });
      setIsEditing(false);
    }
  }, [collection, editName, updateCollection]);
  
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditName('');
  }, []);
  
  const handleDelete = useCallback(() => {
    if (collection) {
      deleteCollection(collection.id);
      navigate('/');
    }
  }, [collection, deleteCollection, navigate]);
  
  // Not found state
  if (!collection) {
    return (
      <div style={notFoundStyle}>
        <h2>Collection not found</h2>
        <button onClick={handleBack}>Go back</button>
      </div>
    );
  }
  
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button style={backButtonStyle} onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        
        <div style={collectionInfoStyle}>
          {/* Collection icon */}
          <div style={collectionIconStyle}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          
          {isEditing ? (
            <div style={editContainerStyle}>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Collection name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <div style={editButtonsStyle}>
                <Button variant="primary" size="small" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button variant="ghost" size="small" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h1 style={collectionTitleStyle}>{collection.name}</h1>
              <p style={collectionMetaStyle}>
                {collectionGames.length} games
                {collection.description && ` • ${collection.description}`}
              </p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        {!isEditing && (
          <div style={actionsStyle}>
            <button style={actionButtonStyle} onClick={handleStartEdit} title="Edit collection">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
            </button>
            <button 
              style={{ ...actionButtonStyle, ...deleteButtonStyle }} 
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete collection"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>Delete Collection</h3>
            <p style={modalTextStyle}>
              Are you sure you want to delete "{collection.name}"? 
              This will not delete the games, only the collection.
            </p>
            <div style={modalActionsStyle}>
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleDelete}
                style={{ backgroundColor: '#EF4444' }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Game grid */}
      <div style={gridContainerStyle}>
        <GameGrid
          games={collectionGames}
          platforms={platforms}
          cardSize="medium"
          showPlatforms={true}
          favorites={favorites}
          emptyMessage="This collection is empty. Add games by clicking the collection icon on any game."
          onGameClick={handleGameClick}
          onGameDoubleClick={handleGameDoubleClick}
          onFavoriteToggle={handleFavoriteToggle}
        />
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
};

const backButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 8,
  border: '1px solid var(--border-color, #334155)',
  backgroundColor: 'transparent',
  color: 'var(--text-secondary, #94A3B8)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const collectionInfoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  flex: 1,
};

const collectionIconStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 12,
  backgroundColor: 'var(--primary, #10B981)',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const collectionTitleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: '#FFFFFF',
  marginBottom: 4,
};

const collectionMetaStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary, #94A3B8)',
};

const editContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1,
  maxWidth: 400,
};

const editButtonsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
};

const actionButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: '1px solid var(--border-color, #334155)',
  backgroundColor: 'transparent',
  color: 'var(--text-secondary, #94A3B8)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const deleteButtonStyle: React.CSSProperties = {
  borderColor: '#EF444440',
  color: '#EF4444',
};

const gridContainerStyle: React.CSSProperties = {
  flex: 1,
};

const notFoundStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: 16,
  color: 'var(--text-secondary, #94A3B8)',
};

// Modal styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-secondary, #1E293B)',
  borderRadius: 12,
  padding: 24,
  maxWidth: 400,
  width: '90%',
  border: '1px solid var(--border-color, #334155)',
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: '#FFFFFF',
  marginBottom: 12,
};

const modalTextStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary, #94A3B8)',
  lineHeight: 1.6,
  marginBottom: 24,
};

const modalActionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 12,
};

export default CollectionScreen;
