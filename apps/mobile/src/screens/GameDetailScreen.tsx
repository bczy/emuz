import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import type { RootStackScreenProps } from '../navigation/types';
import type { Game, Platform } from '@emuz/core';
import { useLibraryStore } from '@emuz/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Game Detail Screen - Full game view with metadata and actions
 */
export default function GameDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RootStackScreenProps<'GameDetail'>['route']>();
  const { gameId } = route.params;

  const { games, platforms, toggleFavorite, launchGame } = useLibraryStore();

  const game = useMemo(() => 
    games.find((g: Game) => g.id === gameId),
    [games, gameId]
  );

  const platform = useMemo(() => {
    if (!game) return null;
    return platforms.find((p: Platform) => p.id === game.platformId);
  }, [platforms, game]);

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>Game not found</Text>
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

  // Format play time
  const formatPlayTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format date
  const formatDate = (date: string | Date | null): string => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handlePlay = () => {
    if (launchGame) {
      launchGame(game.id);
    } else {
      Alert.alert('Coming Soon', 'Game launching will be available soon!');
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite(game.id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleToggleFavorite}
          >
            <Text style={styles.headerIcon}>
              {game.isFavorite ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          {game.coverPath ? (
            <Image source={{ uri: game.coverPath }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.placeholderEmoji}>🎮</Text>
            </View>
          )}
        </View>

        {/* Game Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.gameTitle}>{game.title}</Text>
          
          {platform && (
            <View style={styles.platformBadge}>
              <Text style={styles.platformText}>
                {platform.shortName || platform.name}
              </Text>
            </View>
          )}

          {/* Play Button */}
          <TouchableOpacity 
            style={styles.playButton}
            onPress={handlePlay}
            activeOpacity={0.8}
          >
            <Text style={styles.playIcon}>▶</Text>
            <Text style={styles.playText}>Play Game</Text>
          </TouchableOpacity>

          {/* Metadata */}
          <View style={styles.metadataSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            
            <View style={styles.metadataGrid}>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Play Time</Text>
                <Text style={styles.metadataValue}>
                  {formatPlayTime(game.playTime || 0)}
                </Text>
              </View>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Last Played</Text>
                <Text style={styles.metadataValue}>
                  {formatDate(game.lastPlayed)}
                </Text>
              </View>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Times Played</Text>
                <Text style={styles.metadataValue}>{game.playCount || 0}</Text>
              </View>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Added</Text>
                <Text style={styles.metadataValue}>
                  {formatDate(game.createdAt)}
                </Text>
              </View>
            </View>

            {game.developer && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Developer</Text>
                <Text style={styles.metadataValue}>{game.developer}</Text>
              </View>
            )}

            {game.publisher && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Publisher</Text>
                <Text style={styles.metadataValue}>{game.publisher}</Text>
              </View>
            )}

            {game.releaseYear && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Year</Text>
                <Text style={styles.metadataValue}>{game.releaseYear}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {game.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>{game.description}</Text>
            </View>
          )}

          {/* File Info */}
          <View style={styles.fileSection}>
            <Text style={styles.sectionTitle}>File Info</Text>
            <Text style={styles.filePath} numberOfLines={2}>
              {game.filePath}
            </Text>
          </View>
        </View>
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
    paddingVertical: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  coverContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  coverImage: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6 * 1.4,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  coverPlaceholder: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6 * 1.4,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 64,
    opacity: 0.5,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 8,
  },
  platformBadge: {
    alignSelf: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  playIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  playText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metadataSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 12,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metadataItem: {
    width: '48%',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
  },
  fileSection: {
    marginBottom: 24,
  },
  filePath: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'monospace',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
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
