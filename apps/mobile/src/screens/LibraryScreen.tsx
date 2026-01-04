import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import type { Game, Platform } from '@emuz/core';
import { useLibraryStore } from '@emuz/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - (NUM_COLUMNS - 1) * 12) / NUM_COLUMNS;

type SortOption = 'title' | 'lastPlayed' | 'playTime' | 'dateAdded';
type FilterOption = 'all' | 'favorites' | string; // string for platform ID

/**
 * Library Screen - Main game grid view
 */
export default function LibraryScreen() {
  const navigation = useNavigation();
  const { games, platforms } = useLibraryStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort games
  const filteredGames = useMemo(() => {
    let result = [...games];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((g: Game) => 
        g.title.toLowerCase().includes(query)
      );
    }

    // Apply filter
    if (filterBy === 'favorites') {
      result = result.filter((g: Game) => g.isFavorite);
    } else if (filterBy !== 'all') {
      result = result.filter((g: Game) => g.platformId === filterBy);
    }

    // Apply sort
    result.sort((a: Game, b: Game) => {
      switch (sortBy) {
        case 'lastPlayed':
          const dateA = a.lastPlayedAt ? new Date(a.lastPlayedAt).getTime() : 0;
          const dateB = b.lastPlayedAt ? new Date(b.lastPlayedAt).getTime() : 0;
          return dateB - dateA;
        case 'playTime':
          return (b.playTime || 0) - (a.playTime || 0);
        case 'dateAdded':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [games, searchQuery, sortBy, filterBy]);

  const handleGamePress = (gameId: string) => {
    navigation.navigate('GameDetail', { gameId });
  };

  const getPlatformName = (platformId: string) => {
    const platform = platforms.find((p: Platform) => p.id === platformId);
    return platform?.shortName || platform?.name || 'Unknown';
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
      {item.isFavorite && (
        <View style={styles.favoritesBadge}>
          <Text style={styles.favoriteIcon}>⭐</Text>
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
    <View style={styles.headerInfo}>
      <Text style={styles.resultCount}>
        {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={styles.emptyTitle}>No games found</Text>
      <Text style={styles.emptyText}>
        {searchQuery 
          ? 'Try a different search term'
          : 'Add some games to get started'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterIcon}>⚡</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search games..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sort by</Text>
            <View style={styles.filterOptions}>
              {[
                { value: 'title', label: 'Name' },
                { value: 'lastPlayed', label: 'Recent' },
                { value: 'playTime', label: 'Time' },
                { value: 'dateAdded', label: 'Added' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterChip,
                    sortBy === option.value && styles.filterChipActive,
                  ]}
                  onPress={() => setSortBy(option.value as SortOption)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      sortBy === option.value && styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filter Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filter by</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterBy === 'all' && styles.filterChipActive,
                ]}
                onPress={() => setFilterBy('all')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterBy === 'all' && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterBy === 'favorites' && styles.filterChipActive,
                ]}
                onPress={() => setFilterBy('favorites')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterBy === 'favorites' && styles.filterChipTextActive,
                  ]}
                >
                  ⭐ Favorites
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Game Grid */}
      <FlatList
        data={filteredGames}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#F1F5F9',
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  clearIcon: {
    fontSize: 16,
    color: '#64748B',
  },
  filtersContainer: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#10B981',
  },
  filterChipText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerInfo: {
    paddingBottom: 8,
  },
  resultCount: {
    fontSize: 14,
    color: '#64748B',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  gridRow: {
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
  favoritesBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 12,
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
    paddingVertical: 64,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
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
});
