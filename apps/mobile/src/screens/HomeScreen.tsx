import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import type { Game, Platform } from '@emuz/core';
import { useLibraryStore } from '@emuz/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Home Screen - Daijishou-style dashboard with widgets
 */
export default function HomeScreen() {
  const navigation = useNavigation();
  const { games, platforms } = useLibraryStore();

  // Get recent games (sorted by lastPlayed)
  const recentGames = useMemo(() => {
    return [...games]
      .filter((g: Game) => g.lastPlayed)
      .sort((a: Game, b: Game) => {
        const dateA = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
        const dateB = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [games]);

  // Get favorite games
  const favoriteGames = useMemo(() => {
    return games.filter((g: Game) => g.isFavorite).slice(0, 6);
  }, [games]);

  // Get total stats
  const stats = useMemo(() => {
    const totalPlayTime = games.reduce((acc: number, g: Game) => acc + (g.playTime || 0), 0);
    const totalPlayTimeHours = Math.floor(totalPlayTime / 3600);
    return {
      totalGames: games.length,
      totalPlatforms: platforms.length,
      totalPlayTimeHours,
      favoriteCount: games.filter((g: Game) => g.isFavorite).length,
    };
  }, [games, platforms]);

  const handleGamePress = (gameId: string) => {
    navigation.navigate('GameDetail', { gameId });
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>EmuZ</Text>
          <Text style={styles.headerSubtitle}>Your game library</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleSearchPress} style={styles.headerButton}>
            <Text style={styles.headerIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSettingsPress} style={styles.headerButton}>
            <Text style={styles.headerIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Stats Widget */}
        <View style={styles.statsWidget}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalGames}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalPlatforms}</Text>
            <Text style={styles.statLabel}>Platforms</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalPlayTimeHours}h</Text>
            <Text style={styles.statLabel}>Played</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.favoriteCount}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        {/* Recent Games Widget */}
        {recentGames.length > 0 && (
          <View style={styles.widget}>
            <Text style={styles.widgetTitle}>🕐 Recently Played</Text>
            <FlatList
              data={recentGames}
              renderItem={renderGameCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Favorites Widget */}
        {favoriteGames.length > 0 && (
          <View style={styles.widget}>
            <Text style={styles.widgetTitle}>⭐ Favorites</Text>
            <FlatList
              data={favoriteGames}
              renderItem={renderGameCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Quick Access Platforms */}
        <View style={styles.widget}>
          <Text style={styles.widgetTitle}>🎮 Quick Access</Text>
          <View style={styles.platformGrid}>
            {platforms.slice(0, 4).map((platform: Platform) => (
              <TouchableOpacity
                key={platform.id}
                style={styles.platformCard}
                onPress={() => navigation.navigate('PlatformDetail', { platformId: platform.id })}
                activeOpacity={0.8}
              >
                {platform.iconPath ? (
                  <Image source={{ uri: platform.iconPath }} style={styles.platformIcon} />
                ) : (
                  <Text style={styles.platformEmoji}>🎮</Text>
                )}
                <Text style={styles.platformName} numberOfLines={1}>
                  {platform.shortName || platform.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Empty State */}
        {games.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📂</Text>
            <Text style={styles.emptyTitle}>No games yet</Text>
            <Text style={styles.emptyText}>
              Add your ROM folders to start building your library
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleSettingsPress}
            >
              <Text style={styles.addButtonText}>Add Games</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10B981',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  statsWidget: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  widget: {
    marginBottom: 24,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  gameCard: {
    width: 120,
    marginRight: 12,
  },
  gameCover: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  gameCoverPlaceholder: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
    opacity: 0.5,
  },
  gameTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F1F5F9',
    marginTop: 8,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  platformCard: {
    width: (SCREEN_WIDTH - 48 - 24) / 4,
    aspectRatio: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  platformIcon: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  platformEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  platformName: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    margin: 16,
    backgroundColor: '#1E293B',
    borderRadius: 16,
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
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
