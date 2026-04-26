import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { theme } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

const BACKEND_URL = 'http://localhost:8080';

export default function LoginScreen() {
  const { isLoading, error } = useAuthStore();
  const params = useLocalSearchParams<{ error?: string }>();
  const router = useRouter();

  const handleLogin = async () => {
    const redirectUrl = Linking.createURL('/auth/callback');
    const loginUrl = `${BACKEND_URL}/api/auth/github/login?redirectUrl=${encodeURIComponent(redirectUrl)}`;

    if (Platform.OS === 'web') {
      // On web, redirect the entire page
      window.location.href = loginUrl;
    } else {
      // On native, use auth session
      const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUrl);
      if (result.type === 'success' && result.url) {
        // Parse the URL manually in case Expo Router misses the deep link after browser closes
        const parsedUrl = Linking.parse(result.url);
        if (parsedUrl.path === 'auth/callback' || parsedUrl.path === '/auth/callback') {
          router.replace({ pathname: '/auth/callback', params: (parsedUrl.queryParams as Record<string, string>) || {} });
        }
      }
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.brand}>
          <View style={s.logo}><Text style={{ fontSize: 48 }}>🐀</Text></View>
          <Text style={s.title}>DevRats</Text>
          <Text style={s.subtitle}>COMMIT. COMPETE. CONQUER.</Text>
        </View>

        <View style={s.features}>
          {[
            ['flame', 'Track your coding streaks'],
            ['people', 'Compete in squads'],
            ['trophy', 'Climb the leaderboard'],
            ['shield-checkmark', 'Anti-cheat protected'],
          ].map(([icon, text]) => (
            <View key={text} style={s.feat}>
              <Ionicons name={icon as any} size={18} color={theme.colors.accent} />
              <Text style={s.featText}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={s.loginArea}>
          {(error || params.error) && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
              <Text style={s.errorText}>{error || `Login failed: ${params.error}`}</Text>
            </View>
          )}
          <Button
            title="Sign in with GitHub"
            onPress={handleLogin}
            variant="primary"
            size="lg"
            loading={isLoading}
            icon={<Ionicons name="logo-github" size={22} color="#fff" />}
            style={{ width: '100%' }}
          />
          <Text style={s.disc}>
            We only request read access.{'\n'}Your code stays private.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 32, paddingVertical: 48 },
  brand: { alignItems: 'center', marginTop: 60 },
  logo: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    ...theme.shadows.glow,
  },
  title: { fontSize: 42, fontWeight: '800', color: theme.colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 8, letterSpacing: 3 },
  features: { gap: 16 },
  feat: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12, paddingHorizontal: 20,
    backgroundColor: theme.colors.glass, borderRadius: 12,
    borderWidth: 1, borderColor: theme.colors.glassBorder,
  },
  featText: { color: theme.colors.text, fontSize: 15, fontWeight: '500' },
  loginArea: { alignItems: 'center', gap: 16 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', width: '100%',
  },
  errorText: { color: theme.colors.danger, fontSize: 13 },
  disc: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
