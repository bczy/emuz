import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import type { RootStackScreenProps } from '../navigation/types';
import type { Game, Collection, Platform } from '@emuz/core';
import { useLibraryStore } from '@emuz/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - (NUM_COLUMNS - 1) * 12) / NUM_COLUMNS;

/**
 * Collection Detail Screen - Games in a specific collection
 */
export default function CollectionDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RootStackScreenProps<'CollectionDetail'>['route']>();
  const { collectionId } = route.params;

  const { games, collections, platforms, removeFromCollection, deleteCollection } = useLibraryStore();

  const collection = useMemo(() => 
    collections.find((c: Collection) => c.id === collectionId),
    [collections, collectionId]
  );

  const collectionGames = useMemo(() => {
    if (!collection?.gameIds) return [];
    return games.filter((g: Game) => collection.gameIds?.includes(g.id));
  }, [games, collection]);

  // Get platform name for a game
  const getPlatformName = (platformId: string): string => {
    const platform = platforms.find((p: Platform) => p.id === platformId);
    return platform?.shortName || platform?.name || '';
  };

  if (!collection) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>Collection not found</Text>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleGamePress = (gameId: string) => {
    navigation.navigate('GameDetail', { gameId });
  };

  const handleRemoveGame = (gameId: string, gameTitle: string) => {
    Alert.alert(
      'Remove from Collection',
      `Remove "${gameTitle}" from this collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromCollection(collectionId, gameId),
        },
      ]
    );
  };

  const handleDeleteCollection = () => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${collection.name}"? This won't delete your games.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteCollection(collectionId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderGameCard = ({ item }: { item: Game }) => (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => handleGamePress(item.id)}
      onLongPress={() => handleRemoveGame(item.id, item.title)}
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
      <View style={styles.collectionHeader}>
        <Text style={styles.collectionIcon}>{collection.icon || '📁'}</Text>
        <Text style={styles.collectionName}>{collection.name}</Text>
        {collection.description && (
          <Text style={styles.collectionDescription}>{collection.description}</Text>
        )}
        <Text style={styles.gameCount}>
          {collectionGames.length} game{collectionGames.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📂</Text>
      <Text style={styles.emptyTitle}>Empty collection</Text>
      <Text style={styles.emptyText}>
        Add games to this collection from the game detail screen
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Collection</Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeleteCollection}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Game Grid */}
      <FlatList
        data={collectionGames}
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
  backButton: {
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
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 18,
  },
  headerSection: {
    padding: 24,
  },
  collectionHeader: {
    alignItems: 'center',
  },
  collectionIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  collectionName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F1F5F9',
    marginBottom: 8,
    textAlign: 'center',
  },
  collectionDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
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
  backBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
