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
    console.log('RootLayout state:', JSON.stringify({ isAuthenticated, isLoading, segments }));
    if (!navigationState?.key || isLoading) return;
    
    // Use a small timeout to let the router finish its initial state updates
    const timer = setTimeout(() => {
      const inAuthGroup = segments[0] === '(auth)' || segments[0] === 'auth';
      console.log('Checking redirect:', JSON.stringify({ inAuthGroup, isAuthenticated, segment0: segments[0] }));
      if (!isAuthenticated && !inAuthGroup) {
        console.log('Redirecting to login');
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
        console.log('Redirecting to home');
        router.replace('/(tabs)/home');
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, segments, navigationState?.key]);

  const isLight = themeMode === 'light' || theme.colors.background === '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isLight ? 'dark' : 'light'} />
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });

