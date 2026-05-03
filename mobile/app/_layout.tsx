import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, LogBox } from 'react-native';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { useTheme } from '../src/theme';
import { useThemeStore } from '../src/theme/themeStore';

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated. Use "boxShadow".',
  'props.pointerEvents is deprecated. Use style.pointerEvents',
]);

export default function RootLayout() {
  const { isAuthenticated, isLoading, loadSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const theme = useTheme();
  const { themeMode } = useThemeStore();

  useEffect(() => { loadSession(); }, []);

  useEffect(() => {

    if (!navigationState?.key || isLoading) return;

    // Use a small timeout to let the router finish its initial state updates
    const timer = setTimeout(() => {
      const inAuthGroup = segments[0] === '(auth)' || segments[0] === 'auth';
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)/home');
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, segments, navigationState?.key]);

  const isLight = themeMode === 'light' || theme.colors.background === '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isLight ? 'dark' : 'light'} />
      <View style={styles.appWrapper}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingTop: 40, // Padding superior maior para celulares (notch/status bar)
    paddingBottom: 20, // Padding inferior menor
  }
});
