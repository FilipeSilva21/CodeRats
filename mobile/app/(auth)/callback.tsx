import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useRootNavigationState } from 'expo-router';
import * as Linking from 'expo-linking';
import { storage } from '../../src/lib/storage';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { theme } from '../../src/theme';

export default function AuthCallbackScreen() {
  console.log('AuthCallbackScreen: MOUNTED');
  if (Platform.OS === 'web') {
    console.log('AuthCallbackScreen: Raw URL:', window.location.href);
  }
  
  const params = useLocalSearchParams<{ accessToken?: string; refreshToken?: string; error?: string }>();
  const { fetchProfile } = useAuthStore();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const isReady = Platform.OS === 'web' ? isMounted : (isMounted && navigationState?.key);
    if (!isReady) return;

    const handleCallback = async () => {
      console.log('AuthCallbackScreen: handleCallback triggered');
      let finalParams = { ...params };

      // On iOS/Android, params from deep linking might be nested or in the URL search string
      if (!finalParams.accessToken) {
        try {
          const url = await Linking.getInitialURL();
          console.log('AuthCallbackScreen: getInitialURL:', url);
          if (url) {
            const parsed = Linking.parse(url);
            if (parsed.queryParams?.accessToken) {
              finalParams.accessToken = parsed.queryParams.accessToken as string;
              finalParams.refreshToken = parsed.queryParams.refreshToken as string;
              console.log('AuthCallbackScreen: Found tokens in initial URL');
            }
          }
        } catch (e) {
          console.error('AuthCallbackScreen: Error checking initial URL:', e);
        }
      }

      if (Platform.OS === 'web' && !finalParams.accessToken) {
        const search = window.location.search;
        if (search) {
          const urlParams = new URLSearchParams(search);
          finalParams = {
            accessToken: urlParams.get('accessToken') || undefined,
            refreshToken: urlParams.get('refreshToken') || undefined,
            error: urlParams.get('error') || undefined,
          };
          console.log('AuthCallbackScreen: Manually parsed params:', JSON.stringify(finalParams));
        }
      }

      console.log('AuthCallbackScreen: Processing:', JSON.stringify({
        hasAccess: !!finalParams.accessToken,
        hasRefresh: !!finalParams.refreshToken,
        error: finalParams.error
      }));

      if (finalParams.error) {
        console.error('Auth error:', finalParams.error);
        router.replace('/(auth)/login');
        return;
      }

      if (finalParams.accessToken && finalParams.refreshToken) {
        await storage.setItemAsync('accessToken', finalParams.accessToken);
        await storage.setItemAsync('refreshToken', finalParams.refreshToken);
        await fetchProfile();
        // Since fetchProfile sets isAuthenticated, RootLayout handles success.
        // But if it failed, we should redirect to login.
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
            console.error('AuthCallbackScreen: fetchProfile failed, returning to login');
            router.replace('/(auth)/login?error=Network Error or backend unreachable');
        } else {
            console.log('AuthCallbackScreen: Profile fetched, redirecting should happen via RootLayout');
        }
      } else {
        console.warn('No tokens found, returning to login');
        router.replace('/(auth)/login');
      }
    };

    handleCallback();
  }, [params, navigationState?.key, isMounted]);

  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={s.text}>Completing login...</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', gap: 12 },
  text: { color: theme.colors.textSecondary, fontSize: 16 },
});
