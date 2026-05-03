import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { theme } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../../src/config';

export default function LoginScreen() {
  const { isLoading, error } = useAuthStore();
  const params = useLocalSearchParams<{ error?: string }>();
  const router = useRouter();

  const handleLogin = async () => {
    const redirectUrl = Linking.createURL('/callback');
    const loginUrl = `${BACKEND_URL}/api/auth/github/login?redirectUrl=${encodeURIComponent(redirectUrl)}`;

    if (Platform.OS === 'web') {
      window.location.href = loginUrl;
    } else {
      const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUrl);
      if (result.type === 'success' && result.url) {
        const parsedUrl = Linking.parse(result.url);
        if (parsedUrl.path === 'callback' || parsedUrl.path === '/callback' || parsedUrl.path === 'auth/callback' || parsedUrl.path === '/auth/callback') {
          router.replace({ pathname: '/(auth)/callback', params: (parsedUrl.queryParams as Record<string, string>) || {} });
        }
      }
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.brand}>
          <Text style={s.logoIcon}>🐀</Text>
          <Text style={s.title}>DevRats.</Text>
          <Text style={s.subtitle}>Commit. Compete. Conquer.</Text>
        </View>

        <View style={s.features}>
          {[
            ['flame', 'Track your coding streaks'],
            ['people', 'Compete in squads'],
            ['trophy', 'Climb the leaderboard'],
            ['shield-checkmark', 'Anti-cheat protected'],
          ].map(([icon, text]) => (
            <View key={text} style={s.feat}>
              <Ionicons name={icon as any} size={20} color={theme.colors.accent} />
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
            icon={<Ionicons name="logo-github" size={22} color={theme.colors.primaryText} />}
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
  brand: { alignItems: 'flex-start', marginTop: 40 },
  logoIcon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 48, fontWeight: '900', color: theme.colors.text, letterSpacing: -1.5 },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 8, fontWeight: '500' },
  features: { gap: 20, marginTop: 40, flex: 1 },
  feat: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  featText: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },
  loginArea: { alignItems: 'center', gap: 12, marginBottom: 20 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', width: '100%',
  },
  errorText: { color: theme.colors.danger, fontSize: 13, fontWeight: '600' },
  disc: { color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});