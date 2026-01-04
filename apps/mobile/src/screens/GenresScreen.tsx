import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import type { Genre, Game } from '@emuz/core';
import { useLibraryStore } from '@emuz/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
 * Genres Screen - Browse games by genre
 */
export default function GenresScreen() {
  const navigation = useNavigation();
  const { genres, games } = useLibraryStore();

  // Get game count per genre
  const getGameCount = (genreId: string): number => {
    const genre = genres.find((g: Genre) => g.id === genreId);
    if (!genre || !('slug' in genre)) {
      return 0;
    }
    const genreSlug = (genre as Genre & { slug: string }).slug;
    return games.filter((g: Game) => g.genre === genreSlug).length;
  };

  // Get icon for genre
  const getGenreIcon = (genreName: string): string => {
    const key = genreName.toLowerCase();
    return genreIcons[key] || genreIcons.default;
  };

  const handleGenrePress = (genreId: string) => {
    navigation.navigate('GenreDetail', { genreId });
  };

  const renderGenreItem = ({ item }: { item: Genre }) => {
    const gameCount = getGameCount(item.id);
    const icon = getGenreIcon(item.name);
    
    return (
      <TouchableOpacity
        style={styles.genreItem}
        onPress={() => handleGenrePress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.genreIcon}>
          <Text style={styles.genreEmoji}>{icon}</Text>
        </View>
        <View style={styles.genreInfo}>
          <Text style={styles.genreName}>{item.name}</Text>
          <Text style={styles.gameCount}>
            {gameCount} game{gameCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🏷️</Text>
      <Text style={styles.emptyTitle}>No genres</Text>
      <Text style={styles.emptyText}>
        Genres will be detected from your game metadata
      </Text>
    </View>
  );

  // Only show genres with games
  const activeGenres = genres.filter((g: Genre) => getGameCount(g.id) > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Genres</Text>
        <Text style={styles.headerSubtitle}>
          {activeGenres.length} genre{activeGenres.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Genre List */}
      <FlatList
        data={activeGenres}
        renderItem={renderGenreItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  genreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
  },
  genreIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  genreEmoji: {
    fontSize: 24,
  },
  genreInfo: {
    flex: 1,
  },
  genreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  gameCount: {
    fontSize: 13,
    color: '#10B981',
  },
  chevron: {
    fontSize: 24,
    color: '#64748B',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
