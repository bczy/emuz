import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import type { RootStackScreenProps } from '../navigation/types';
import type { Game, Genre, Platform } from '@emuz/core';
import { useLibraryStore } from '@emuz/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - (NUM_COLUMNS - 1) * 12) / NUM_COLUMNS;

// Genre icons mapping
const genreIcons: Record<string, string> = {
  'action': '⚔️',
  'adventure': '🗺️',
  'rpg': '🧙',
  'puzzle': '🧩',
  'racing': '🏎️',
  'sports': '⚽',
  'fighting': '🥊',
  'shooter': '🔫',
  'platformer': '🍄',
  'simulation': '✈️',
  'strategy': '♟️',
  'horror': '👻',
  'music': '🎵',
  'party': '🎉',
  'educational': '📚',
  'arcade': '👾',
  'default': '🎮',
};

/**
 * Genre Detail Screen - Games for a specific genre
 */
export default function GenreDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RootStackScreenProps<'GenreDetail'>['route']>();
  const { genreId } = route.params;

  const { games, genres, platforms } = useLibraryStore();

  const genre = useMemo(() => 
    genres.find((g: Genre) => g.id === genreId),
    [genres, genreId]
  );

  const genreGames = useMemo(() => 
    games.filter((g: Game) => g.genreId === genreId),
    [games, genreId]
  );

  // Get icon for genre
  const getGenreIcon = (genreName: string): string => {
    const key = genreName.toLowerCase();
    return genreIcons[key] || genreIcons.default;
  };

  // Get platform name for a game
  const getPlatformName = (platformId: string): string => {
    const platform = platforms.find((p: Platform) => p.id === platformId);
    return platform?.shortName || platform?.name || '';
  };

  if (!genre) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>Genre not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleGamePress = (gameId: string) => {
    navigation.navigate('GameDetail', { gameId });
  };

  const renderGameCard = ({ item }: { item: Game }) => (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => handleGamePress(item.id)}
      activeOpacity={0.8}
    >
      {item.coverPath ? (
        <Image source={{ uri: item.coverPath }} style={styles.gameCover} />
      ) : (
        <View style={styles.gameCoverPlaceholder}>
          <Text style={styles.placeholderEmoji}>🎮</Text>
        </View>
      )}
      <Text style={styles.gameTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.platformBadge}>
        {getPlatformName(item.platformId)}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.genreHeader}>
        <Text style={styles.genreIcon}>{getGenreIcon(genre.name)}</Text>
        <Text style={styles.genreName}>{genre.name}</Text>
        <Text style={styles.gameCount}>
          {genreGames.length} game{genreGames.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📂</Text>
      <Text style={styles.emptyTitle}>No games</Text>
      <Text style={styles.emptyText}>
        No games found in this genre
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Genre</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Game Grid */}
      <FlatList
        data={genreGames}
        renderItem={renderGameCard}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#F1F5F9',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  placeholder: {
    width: 40,
  },
  headerSection: {
    padding: 24,
  },
  genreHeader: {
    alignItems: 'center',
  },
  genreIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  genreName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  gameCount: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  gridContent: {
    paddingBottom: 24,
  },
  gridRow: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  gameCard: {
    width: CARD_WIDTH,
  },
  gameCover: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  gameCoverPlaceholder: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
    opacity: 0.5,
  },
  gameTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F1F5F9',
    marginTop: 8,
  },
  platformBadge: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
