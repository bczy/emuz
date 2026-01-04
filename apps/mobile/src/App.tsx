import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import './global.css'; // NativeWind global styles

import AppProviders from './providers/AppProviders';
import { RootNavigator } from './navigation';
import { initializeApp, isFirstRun } from './services/init';

type AppState = 'loading' | 'setup' | 'ready' | 'error';

interface SplashScreenProps {
  message?: string;
}

/**
 * Splash screen shown during app initialization
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ message = 'Loading...' }) => (
  <View style={styles.splash}>
    <Text style={styles.splashLogo}>🎮</Text>
    <Text style={styles.splashTitle}>EmuZ</Text>
    <Text style={styles.splashSlogan}>
      Yet another emulators and ROMs management front-end
    </Text>
    <ActivityIndicator size="large" color="#10B981" style={styles.spinner} />
    <Text style={styles.splashMessage}>{message}</Text>
  </View>
);

interface ErrorScreenProps {
  error: Error;
  onRetry: () => void;
}

/**
 * Error screen shown when initialization fails
 */
const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRetry }) => (
  <View style={styles.error}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.errorTitle}>Initialization Failed</Text>
    <Text style={styles.errorMessage}>{error.message}</Text>
    <Text style={styles.retryButton} onPress={onRetry}>
      Tap to Retry
    </Text>
  </View>
);

/**
 * Main App Component
 */
export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [initError, setInitError] = useState<Error | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  const initialize = useCallback(async () => {
    try {
      setAppState('loading');
      setInitError(null);
      
      setLoadingMessage('Initializing database...');
      await initializeApp();
      
      setLoadingMessage('Checking setup status...');
      const firstRun = await isFirstRun();
      
      if (firstRun) {
        setAppState('setup');
      } else {
        setAppState('ready');
      }
    } catch (error) {
      console.error('[EmuZ] Initialization error:', error);
      setInitError(error instanceof Error ? error : new Error(String(error)));
      setAppState('error');
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Render based on app state
  let content: React.ReactNode;

  switch (appState) {
    case 'loading':
      content = <SplashScreen message={loadingMessage} />;
      break;
    case 'error':
      content = initError ? (
        <ErrorScreen error={initError} onRetry={initialize} />
      ) : null;
      break;
    case 'setup':
    case 'ready':
    default:
      content = <RootNavigator />;
      break;
  }

  return (
    <AppProviders>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0F172A" 
        translucent={false}
      />
      {content}
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  splashLogo: {
    fontSize: 80,
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 8,
  },
  splashSlogan: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 48,
  },
  spinner: {
    marginBottom: 16,
  },
  splashMessage: {
    fontSize: 14,
    color: '#64748B',
  },
  error: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
