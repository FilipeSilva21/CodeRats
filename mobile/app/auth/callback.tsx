import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, useRootNavigationState } from 'expo-router';
import { storage } from '../../src/lib/storage';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { theme } from '../../src/theme';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ accessToken?: string; refreshToken?: string; error?: string }>();
  const { fetchProfile } = useAuthStore();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !navigationState?.key) return;

    const handleCallback = async () => {
      if (params.error) {
        console.error('Auth error:', params.error);
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 100);
        return;
      }

      if (params.accessToken && params.refreshToken) {
        // Save tokens
        await storage.setItemAsync('accessToken', params.accessToken);
        await storage.setItemAsync('refreshToken', params.refreshToken);

        // Fetch user profile and update auth state
        await fetchProfile();
        // We do not need to call router.replace('/(tabs)/home') here
        // because _layout.tsx will automatically redirect when isAuthenticated becomes true.
      } else {
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 100);
      }
    };

    handleCallback();
  }, [params, navigationState?.key, isMounted]);

  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={s.text}>Signing you in...</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  text: { color: theme.colors.textSecondary, fontSize: 16 },
});
