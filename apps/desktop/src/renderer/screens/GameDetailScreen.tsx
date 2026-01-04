/**
 * Game Detail Screen - Full game view with play button
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLibraryStore } from '@emuz/core';
import { Button } from '@emuz/ui';
import type { Collection } from '@emuz/core';

const GameDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  
  const { games, platforms, collections, updateGame, addGameToCollection, removeGameFromCollection } = useLibraryStore();
  
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  
  // Find the game
  const game = useMemo(() =>
    games.find(g => g.id === gameId),
    [games, gameId]
  );
  
  // Find the platform
  const platform = useMemo(() =>
    game ? platforms.find(p => p.id === game.platformId) : null,
    [platforms, game]
  );
  
  // Collections containing this game
  const gameCollections = useMemo(() =>
    collections.filter(c => c.gameIds.includes(gameId ?? '')),
    [collections, gameId]
  );
  
  // Format play time
  const formatPlayTime = (seconds?: number) => {
    if (!seconds) return 'Never played';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m played`;
    }
    return `${minutes}m played`;
  };
  
  // Format last played
  const formatLastPlayed = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };
  
  // Handlers
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  const handlePlay = useCallback(() => {
    if (game) {
      console.log('Launching game:', game.title, game.romPath);
      // TODO: Call launch service via IPC
    }
  }, [game]);
  
  const handleFavoriteToggle = useCallback(() => {
    if (game) {
      updateGame(game.id, { isFavorite: !game.isFavorite });
    }
  }, [game, updateGame]);
  
  const handleCollectionToggle = useCallback((collection: Collection) => {
    if (!game) return;
    
    if (collection.gameIds.includes(game.id)) {
      removeGameFromCollection(collection.id, game.id);
    } else {
      addGameToCollection(collection.id, game.id);
    }
  }, [game, addGameToCollection, removeGameFromCollection]);
  
  // Not found state
  if (!game) {
    return (
      <div style={notFoundStyle}>
        <h2>Game not found</h2>
        <button onClick={handleBack}>Go back</button>
      </div>
    );
  }
  
  return (
    <div style={containerStyle}>
      {/* Hero section with cover */}
      <div style={heroStyle(game.coverPath)}>
        <div style={heroOverlayStyle} />
        <div style={heroContentStyle}>
          <button style={backButtonStyle} onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          
          <div style={heroActionsStyle}>
            <button
              style={{
                ...actionButtonStyle,
                ...(game.isFavorite ? favoriteActiveStyle : {}),
              }}
              onClick={handleFavoriteToggle}
              title={game.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={game.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
            
            <div style={collectionMenuContainerStyle}>
              <button
                style={actionButtonStyle}
                onClick={() => setShowCollectionMenu(!showCollectionMenu)}
                title="Add to collection"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </button>
              
              {showCollectionMenu && (
                <div style={collectionMenuStyle}>
                  <div style={collectionMenuHeaderStyle}>Add to Collection</div>
                  {collections.length === 0 ? (
                    <div style={collectionMenuEmptyStyle}>No collections yet</div>
                  ) : (
                    collections.map(collection => (
                      <button
                        key={collection.id}
                        style={collectionMenuItemStyle}
                        onClick={() => handleCollectionToggle(collection)}
                      >
                        <span>{collection.name}</span>
                        {collection.gameIds.includes(game.id) && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Game info */}
      <div style={infoContainerStyle}>
        <div style={mainInfoStyle}>
          {/* Cover image */}
          <div style={coverContainerStyle}>
            {game.coverPath ? (
              <img src={game.coverPath} alt={game.title} style={coverImageStyle} />
            ) : (
              <div style={coverPlaceholderStyle}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Title and metadata */}
          <div style={detailsStyle}>
            <h1 style={titleStyle}>{game.title}</h1>
            
            {platform && (
              <button style={platformBadgeStyle} onClick={() => navigate(`/platform/${platform.id}`)}>
                {platform.iconPath && (
                  <img src={platform.iconPath} alt={platform.name} style={platformIconStyle} />
                )}
                {platform.name}
              </button>
            )}
            
            <div style={metadataGridStyle}>
              <div style={metadataItemStyle}>
                <span style={metadataLabelStyle}>Release</span>
                <span style={metadataValueStyle}>
                  {game.releaseDate ? new Date(game.releaseDate).getFullYear() : 'Unknown'}
                </span>
              </div>
              <div style={metadataItemStyle}>
                <span style={metadataLabelStyle}>Developer</span>
                <span style={metadataValueStyle}>{game.developer || 'Unknown'}</span>
              </div>
              <div style={metadataItemStyle}>
                <span style={metadataLabelStyle}>Publisher</span>
                <span style={metadataValueStyle}>{game.publisher || 'Unknown'}</span>
              </div>
              <div style={metadataItemStyle}>
                <span style={metadataLabelStyle}>Genre</span>
                <span style={metadataValueStyle}>{game.genreId || 'Unknown'}</span>
              </div>
            </div>
            
            {game.description && (
              <p style={descriptionStyle}>{game.description}</p>
            )}
          </div>
        </div>
        
        {/* Play section */}
        <div style={playSectionStyle}>
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={handlePlay}
            leftIcon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            }
          >
            Play Now
          </Button>
          
          <div style={playStatsStyle}>
            <div style={playStatItemStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatPlayTime(game.playTime)}</span>
            </div>
            <div style={playStatItemStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span>Last played: {formatLastPlayed(game.lastPlayed)}</span>
            </div>
            <div style={playStatItemStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              <span>{game.playCount || 0} launches</span>
            </div>
          </div>
          
          {/* Collections */}
          {gameCollections.length > 0 && (
            <div style={collectionsListStyle}>
              <span style={collectionsLabelStyle}>In collections:</span>
              <div style={collectionTagsStyle}>
                {gameCollections.map(c => (
                  <button 
                    key={c.id} 
                    style={collectionTagStyle}
                    onClick={() => navigate(`/collection/${c.id}`)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  margin: -24,
};

const heroStyle = (coverPath?: string): React.CSSProperties => ({
  position: 'relative',
  height: 200,
  backgroundImage: coverPath 
    ? `url(${coverPath})`
    : 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
  filter: 'blur(0)',
});

const heroOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(transparent 0%, rgba(15, 23, 42, 0.9) 70%, rgba(15, 23, 42, 1) 100%)',
};

const heroContentStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  padding: 24,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

const backButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  color: '#FFFFFF',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(8px)',
};

const heroActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
};

const actionButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  color: '#FFFFFF',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(8px)',
};

const favoriteActiveStyle: React.CSSProperties = {
  color: '#EF4444',
};

const collectionMenuContainerStyle: React.CSSProperties = {
  position: 'relative',
};

const collectionMenuStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: 8,
  backgroundColor: 'var(--bg-secondary, #1E293B)',
  border: '1px solid var(--border-color, #334155)',
  borderRadius: 8,
  minWidth: 200,
  overflow: 'hidden',
  zIndex: 100,
};

const collectionMenuHeaderStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-secondary, #94A3B8)',
  borderBottom: '1px solid var(--border-color, #334155)',
};

const collectionMenuEmptyStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: 13,
  color: 'var(--text-secondary, #94A3B8)',
  textAlign: 'center',
};

const collectionMenuItemStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  fontSize: 14,
  color: '#FFFFFF',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
};

const infoContainerStyle: React.CSSProperties = {
  padding: 24,
  marginTop: -80,
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
};

const mainInfoStyle: React.CSSProperties = {
  display: 'flex',
  gap: 24,
};

const coverContainerStyle: React.CSSProperties = {
  flexShrink: 0,
};

const coverImageStyle: React.CSSProperties = {
  width: 180,
  height: 240,
  objectFit: 'cover',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
};

const coverPlaceholderStyle: React.CSSProperties = {
  width: 180,
  height: 240,
  borderRadius: 12,
  backgroundColor: 'var(--bg-secondary, #1E293B)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-secondary, #94A3B8)',
};

const detailsStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const titleStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  color: '#FFFFFF',
  lineHeight: 1.2,
};

const platformBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 12px',
  borderRadius: 6,
  backgroundColor: 'var(--bg-secondary, #1E293B)',
  border: '1px solid var(--border-color, #334155)',
  color: 'var(--text-secondary, #94A3B8)',
  fontSize: 13,
  cursor: 'pointer',
  width: 'fit-content',
};

const platformIconStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: 4,
};

const metadataGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 12,
};

const metadataItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const metadataLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--text-secondary, #94A3B8)',
};

const metadataValueStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#FFFFFF',
};

const descriptionStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: 'var(--text-secondary, #94A3B8)',
};

const playSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: 20,
  backgroundColor: 'var(--bg-secondary, #1E293B)',
  borderRadius: 12,
  border: '1px solid var(--border-color, #334155)',
};

const playStatsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
};

const playStatItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  color: 'var(--text-secondary, #94A3B8)',
};

const collectionsListStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  paddingTop: 12,
  borderTop: '1px solid var(--border-color, #334155)',
};

const collectionsLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary, #94A3B8)',
};

const collectionTagsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

const collectionTagStyle: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: 4,
  backgroundColor: 'var(--primary, #10B981)',
  color: '#FFFFFF',
  fontSize: 12,
  fontWeight: 500,
  border: 'none',
  cursor: 'pointer',
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

export default GameDetailScreen;
