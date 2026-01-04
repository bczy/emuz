import React, { useMemo } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';

import type { RootStackScreenProps } from '../navigation/types';
import type { Game, Platform } from '@emuz/core';
import { useLibraryStore } from '@emuz/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - (NUM_COLUMNS - 1) * 12) / NUM_COLUMNS;

/**
 * Platform Detail Screen - Games for a specific platform with wallpaper hero
 */
export default function PlatformDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RootStackScreenProps<'PlatformDetail'>['route']>();
  const { platformId } = route.params;

  const { games, platforms } = useLibraryStore();

  const platform = useMemo(() => 
    platforms.find((p: Platform) => p.id === platformId),
    [platforms, platformId]
  );

  const platformGames = useMemo(() => 
    games.filter((g: Game) => g.platformId === platformId),
    [games, platformId]
  );

  if (!platform) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>Platform not found</Text>
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
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      {/* Hero Section with Wallpaper */}
      <View style={styles.heroContainer}>
        {platform.wallpaperPath ? (
          <ImageBackground
            source={{ uri: platform.wallpaperPath }}
            style={styles.heroBackground}
            imageStyle={styles.heroImage}
          >
            <View style={styles.heroOverlay}>
              {platform.iconPath ? (
                <Image source={{ uri: platform.iconPath }} style={styles.platformIcon} />
              ) : (
                <Text style={styles.platformEmoji}>🎮</Text>
              )}
              <Text style={styles.platformName}>{platform.name}</Text>
              <Text style={styles.gameCount}>
                {platformGames.length} game{platformGames.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.heroBackground, styles.heroPlaceholder]}>
            <View style={styles.heroOverlay}>
              {platform.iconPath ? (
                <Image source={{ uri: platform.iconPath }} style={styles.platformIcon} />
              ) : (
                <Text style={styles.platformEmoji}>🎮</Text>
              )}
              <Text style={styles.platformName}>{platform.name}</Text>
              <Text style={styles.gameCount}>
                {platformGames.length} game{platformGames.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Games</Text>
      </View>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📂</Text>
      <Text style={styles.emptyTitle}>No games yet</Text>
      <Text style={styles.emptyText}>
        Add {platform.name} ROMs to see them here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButtonFloat}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Game Grid */}
      <FlatList
        data={platformGames}
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
  backButtonFloat: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#F1F5F9',
  },
  heroContainer: {
    height: 200,
    marginBottom: 16,
  },
  heroBackground: {
    flex: 1,
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    backgroundColor: '#1E293B',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  platformIcon: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  platformEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  platformName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 8,
  },
  gameCount: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
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
