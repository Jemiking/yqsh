import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { usePregnancyStore } from './src/state';

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const setProfile = usePregnancyStore((s) => s.setProfile);

  useEffect(() => {
    async function init() {
      if (Platform.OS === 'web') {
        setIsReady(true);
        return;
      }
      try {
        const { openUserDatabase, getProfile } = await import('./src/services');
        const { initializeKnowledgeBase } = await import('./src/services/kb');

        await openUserDatabase();
        const profile = await getProfile();
        if (profile) {
          setProfile(profile);
          setIsFirstLaunch(false);
        }

        const kbResult = await initializeKnowledgeBase();
        if (kbResult.success) {
          console.log('[App] KB initialized:', kbResult.stats);
        }
        setIsReady(true);
      } catch (e) {
        console.error('Database init failed:', e);
        setInitError(e instanceof Error ? e.message : '初始化失败');
        setIsReady(true);
      }
    }
    init();
  }, [setProfile]);

  if (!isReady) {
    return null;
  }

  if (initError) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>应用初始化失败</Text>
          <Text style={styles.errorMessage}>{initError}</Text>
          <Text style={styles.errorHint}>请尝试重启应用</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator isFirstLaunch={isFirstLaunch} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8F9FA',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorHint: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
