import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { theme } from '../../src/theme';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ accessToken?: string; refreshToken?: string; error?: string }>();
  const { fetchProfile } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      if (params.error) {
        console.error('Auth error:', params.error);
        router.replace('/(auth)/login');
        return;
      }

      if (params.accessToken && params.refreshToken) {
        // Save tokens
        await SecureStore.setItemAsync('accessToken', params.accessToken);
        await SecureStore.setItemAsync('refreshToken', params.refreshToken);

        // Fetch user profile and update auth state
        await fetchProfile();

        // Navigate to home
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/login');
      }
    };

    handleCallback();
  }, [params]);

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
