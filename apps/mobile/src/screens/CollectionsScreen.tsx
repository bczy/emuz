import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import type { Collection, Game } from '@emuz/core';
import { useLibraryStore } from '@emuz/core';

/**
 * Collections Screen - User-defined game collections
 */
export default function CollectionsScreen() {
  const navigation = useNavigation();
  const { collections, games, createCollection, deleteCollection } = useLibraryStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  // Get game count per collection
  const getGameCount = (collectionId: string): number => {
    const collection = collections.find((c: Collection) => c.id === collectionId);
    return collection?.gameIds?.length || 0;
  };

  const handleCollectionPress = (collectionId: string) => {
    navigation.navigate('CollectionDetail', { collectionId });
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    createCollection({
      name: newCollectionName.trim(),
      description: newCollectionDescription.trim(),
    });

    setNewCollectionName('');
    setNewCollectionDescription('');
    setShowCreateModal(false);
  };

  const handleDeleteCollection = (collectionId: string, collectionName: string) => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${collectionName}"? This won't delete your games.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteCollection(collectionId),
        },
      ]
    );
  };

  const renderCollectionItem = ({ item }: { item: Collection }) => {
    const gameCount = getGameCount(item.id);
    
    return (
      <TouchableOpacity
        style={styles.collectionItem}
        onPress={() => handleCollectionPress(item.id)}
        onLongPress={() => handleDeleteCollection(item.id, item.name)}
        activeOpacity={0.7}
      >
        <View style={styles.collectionIcon}>
          <Text style={styles.collectionEmoji}>
            {item.icon || '📁'}
          </Text>
        </View>
        <View style={styles.collectionInfo}>
          <Text style={styles.collectionName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.collectionDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
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
      <Text style={styles.emptyEmoji}>📁</Text>
      <Text style={styles.emptyTitle}>No collections</Text>
      <Text style={styles.emptyText}>
        Create collections to organize your favorite games
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Collections</Text>
          <Text style={styles.headerSubtitle}>
            {collections.length} collection{collections.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Collection List */}
      <FlatList
        data={collections}
        renderItem={renderCollectionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Create Collection Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Collection</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Collection name"
              placeholderTextColor="#64748B"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#64748B"
              value={newCollectionDescription}
              onChangeText={setNewCollectionDescription}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalCreateButton}
                onPress={handleCreateCollection}
              >
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
  },
  collectionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  collectionEmoji: {
    fontSize: 28,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 2,
  },
  collectionDescription: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
  },
  gameCount: {
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#F1F5F9',
    fontSize: 16,
    marginBottom: 12,
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  modalCreateButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
