import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore, injectStorage, injectConfig, injectNotifications } from '@coderats/shared';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../src/theme';
import { useThemeStore } from '../src/theme/themeStore';
import { notificationsService } from '../src/lib/notifications';
import { BACKEND_URL, WS_URL } from '../src/config';

injectStorage({
  getItemAsync: SecureStore.getItemAsync,
  setItemAsync: SecureStore.setItemAsync,
  deleteItemAsync: SecureStore.deleteItemAsync,
});
injectConfig({
  backendUrl: BACKEND_URL,
  wsUrl: WS_URL,
});
injectNotifications({
  clearPushToken: notificationsService.clearPushToken,
  registerDevice: notificationsService.registerDeviceForPushNotifications,
});

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
    if (!isAuthenticated || isLoading) return;
    notificationsService.syncPushTokenIfEnabled().catch((error) => {
      console.warn('Push notification sync failed:', error);
    });
  }, [isAuthenticated, isLoading]);

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
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={isLight ? 'dark' : 'light'} />
        <View style={styles.appWrapper}>
          <Slot />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appWrapper: {
    flex: 1,
    maxWidth: 600,
    width: "100%",
    alignSelf: 'center',
    paddingBottom: 20
  }
});
