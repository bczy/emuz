import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import type { Platform } from '@emuz/core';
import { useLibraryStore } from '@emuz/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

/**
 * Platforms Screen - Grid of platforms with wallpaper backgrounds
 */
export default function PlatformsScreen() {
  const navigation = useNavigation();
  const { platforms, games } = useLibraryStore();

  // Get game count per platform
  const getGameCount = (platformId: string): number => {
    return games.filter((g) => g.platformId === platformId).length;
  };

  const handlePlatformPress = (platformId: string) => {
    navigation.navigate('PlatformDetail', { platformId });
  };

  const renderPlatformCard = ({ item }: { item: Platform }) => {
    const gameCount = getGameCount(item.id);
    
    return (
      <TouchableOpacity
        style={styles.platformCard}
        onPress={() => handlePlatformPress(item.id)}
        activeOpacity={0.8}
      >
        {item.wallpaperPath ? (
          <ImageBackground
            source={{ uri: item.wallpaperPath }}
            style={styles.cardBackground}
            imageStyle={styles.cardBackgroundImage}
          >
            <View style={styles.cardOverlay}>
              {item.iconPath ? (
                <Image source={{ uri: item.iconPath }} style={styles.platformIcon} />
              ) : (
                <Text style={styles.platformEmoji}>🎮</Text>
              )}
              <Text style={styles.platformName}>{item.shortName || item.name}</Text>
              <Text style={styles.gameCount}>
                {gameCount} game{gameCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.cardBackground, styles.cardPlaceholder]}>
            <View style={styles.cardOverlay}>
              {item.iconPath ? (
                <Image source={{ uri: item.iconPath }} style={styles.platformIcon} />
              ) : (
                <Text style={styles.platformEmoji}>🎮</Text>
              )}
              <Text style={styles.platformName}>{item.shortName || item.name}</Text>
              <Text style={styles.gameCount}>
                {gameCount} game{gameCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🎮</Text>
      <Text style={styles.emptyTitle}>No platforms</Text>
      <Text style={styles.emptyText}>
        Platforms will appear here once you add games
      </Text>
    </View>
  );

  // Only show platforms with games
  const activePlatforms = platforms.filter((p: Platform) => getGameCount(p.id) > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Platforms</Text>
        <Text style={styles.headerSubtitle}>
          {activePlatforms.length} active platform{activePlatforms.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Platform Grid */}
      <FlatList
        data={activePlatforms}
        renderItem={renderPlatformCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
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
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  gridRow: {
    gap: 16,
    marginBottom: 16,
  },
  platformCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 0.8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardBackground: {
    flex: 1,
  },
  cardBackgroundImage: {
    borderRadius: 16,
  },
  cardPlaceholder: {
    backgroundColor: '#1E293B',
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  platformIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  platformEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 4,
  },
  gameCount: {
    fontSize: 13,
    color: '#10B981',
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
