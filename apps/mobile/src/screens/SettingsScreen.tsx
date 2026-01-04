import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useSettingsStore } from '@emuz/core';

/**
 * Settings Screen - App configuration
 */
export default function SettingsScreen() {
  const navigation = useNavigation();
  const settings = useSettingsStore();

  const handleScanLibrary = () => {
    navigation.navigate('ScanProgress');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached images and data. Your games and settings will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cache clearing
            Alert.alert('Done', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Database',
      'This will delete ALL your games, collections, and settings. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'Last chance! All data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Yes, Reset Everything', 
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement database reset
                    Alert.alert('Done', 'Database has been reset');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/emuz/emuz');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Library Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Library</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleScanLibrary}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Scan Library</Text>
              <Text style={styles.settingDescription}>
                Scan folders for new games
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>ROM Folders</Text>
              <Text style={styles.settingDescription}>
                Manage your game directories
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Grid Size</Text>
              <Text style={styles.settingDescription}>
                Games per row
              </Text>
            </View>
            <View style={styles.gridOptions}>
              {[2, 3, 4].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.gridOption,
                    settings.gridColumns === size && styles.gridOptionActive,
                  ]}
                  onPress={() => settings.setGridColumns(size)}
                >
                  <Text
                    style={[
                      styles.gridOptionText,
                      settings.gridColumns === size && styles.gridOptionTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Platform Badge</Text>
              <Text style={styles.settingDescription}>
                Display platform on game cards
              </Text>
            </View>
            <Switch
              value={settings.showPlatformBadge}
              onValueChange={settings.setShowPlatformBadge}
              trackColor={{ false: '#334155', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Emulators Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emulators</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Manage Emulators</Text>
              <Text style={styles.settingDescription}>
                Configure emulator settings
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Default Emulators</Text>
              <Text style={styles.settingDescription}>
                Set default emulator per platform
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleClearCache}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Clear Cache</Text>
              <Text style={styles.settingDescription}>
                Free up storage space
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleResetDatabase}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, styles.dangerText]}>Reset Database</Text>
              <Text style={styles.settingDescription}>
                Delete all data and start fresh
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutCard}>
            <Text style={styles.appName}>EmuZ</Text>
            <Text style={styles.appSlogan}>
              Yet another emulators and ROMs management front-end
            </Text>
            <Text style={styles.version}>Version 0.0.1</Text>
          </View>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleOpenGitHub}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>GitHub</Text>
              <Text style={styles.settingDescription}>
                View source code and contribute
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>License</Text>
              <Text style={styles.settingDescription}>GPL-3.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with 💚 for retro gaming</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#94A3B8',
  },
  chevron: {
    fontSize: 24,
    color: '#64748B',
    marginLeft: 12,
  },
  dangerText: {
    color: '#EF4444',
  },
  gridOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  gridOption: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOptionActive: {
    backgroundColor: '#10B981',
  },
  gridOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  gridOptionTextActive: {
    color: '#FFFFFF',
  },
  aboutCard: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 8,
  },
  appSlogan: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
  version: {
    fontSize: 12,
    color: '#64748B',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
});
