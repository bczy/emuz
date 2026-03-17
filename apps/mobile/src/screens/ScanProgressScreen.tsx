import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

/**
 * Scan Progress Screen - Shows library scan progress
 */
export default function ScanProgressScreen() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('Initializing...');
  const [scannedCount, setScannedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Simulate scanning progress (replace with actual implementation)
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsComplete(true);
          return 100;
        }
        const increment = Math.random() * 10;
        const newProgress = Math.min(prev + increment, 100);
        
        // Simulate file processing
        setScannedCount(Math.floor(newProgress * 1.5));
        setTotalCount(150);
        setCurrentFile(`/Games/SNES/game_${Math.floor(newProgress)}.sfc`);
        
        return newProgress;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleDone = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.container}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>
              {isComplete ? '✅' : '🔍'}
            </Text>
            <Text style={styles.title}>
              {isComplete ? 'Scan Complete' : 'Scanning Library'}
            </Text>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progress}%` }]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress)}%
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{scannedCount}</Text>
              <Text style={styles.statLabel}>Files Scanned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalCount}</Text>
              <Text style={styles.statLabel}>Total Found</Text>
            </View>
          </View>

          {/* Current File */}
          {!isComplete && (
            <View style={styles.currentFileContainer}>
              <Text style={styles.currentFileLabel}>Currently scanning:</Text>
              <Text style={styles.currentFile} numberOfLines={1}>
                {currentFile}
              </Text>
            </View>
          )}

          {/* Summary (when complete) */}
          {isComplete && (
            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                Found {scannedCount} games across {Math.floor(scannedCount / 20)} platforms
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {isComplete ? (
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={handleDone}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F1F5F9',
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
  currentFileContainer: {
    marginBottom: 24,
  },
  currentFileLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  currentFile: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'monospace',
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 6,
  },
  summary: {
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  actions: {
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  doneButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
