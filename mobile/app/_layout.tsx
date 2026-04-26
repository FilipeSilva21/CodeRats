import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, LogBox } from 'react-native';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { theme } from '../src/theme';

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated. Use "boxShadow".',
  'props.pointerEvents is deprecated. Use style.pointerEvents',
]);

export default function RootLayout() {
  const { isAuthenticated, isLoading, loadSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.background } });
