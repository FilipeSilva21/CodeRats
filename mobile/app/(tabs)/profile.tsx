import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Avatar } from '../../src/components/ui/Avatar';
import { theme } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  return (
    <SafeAreaView style={s.c}>
      <Text style={s.title}>Profile</Text>
      <Card variant="glass" style={{ alignItems: 'center', gap: 12 }}>
        <Avatar uri={user?.avatarUrl || null} name={user?.displayName || 'U'} size={80} />
        <Text style={s.name}>{user?.displayName || 'Developer'}</Text>
        <Text style={s.user}>@{user?.username || 'user'}</Text>
      </Card>
      <Button title="Sign Out" onPress={logout} variant="danger" size="md" icon={<Ionicons name="log-out" size={20} color="#fff" />} style={{ marginTop: 16 }} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: theme.colors.background, padding: 24, gap: 16 },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '800' },
  name: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
  user: { color: theme.colors.textSecondary, fontSize: 14 },
});
