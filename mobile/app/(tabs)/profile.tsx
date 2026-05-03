import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Avatar } from '../../src/components/ui/Avatar';
import { useTheme, useStyles } from '../../src/theme';
import { useThemeStore } from '../../src/theme/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const theme = useTheme();
  const s = useStyles(styles);
  const { themeMode, setThemeMode } = useThemeStore();
  const [showThemeModal, setShowThemeModal] = useState(false);

  return (
    <View style={s.c}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.title}>Profile</Text>
          
          <Card style={s.profileCard}>
            <View style={s.profileHeader}>
              <View style={s.avatarWrapper}>
                <Avatar uri={user?.avatarUrl || null} name={user?.displayName || 'U'} size={96} />
                <View style={s.githubBadge}>
                  <Ionicons name="logo-github" size={18} color="#fff" />
                </View>
              </View>
              <View style={s.info}>
                <Text style={s.name}>{user?.displayName || 'Developer'}</Text>
                <Text style={s.user}>@{user?.username || 'user'}</Text>
              </View>
            </View>
            
            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Text style={s.statValue}>{user?.bestStreak || 0}</Text>
                <Text style={s.statLabel}>Best Streak</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statValue}>{user?.currentStreak || 0}</Text>
                <Text style={s.statLabel}>Current</Text>
              </View>
            </View>
          </Card>
          
          <Text style={s.sectionTitle}>Account</Text>
          <Card style={s.settingsCard}>
            <Link href="/notifications" asChild>
              <TouchableOpacity style={s.settingRow}>
                <View style={s.settingLeft}>
                  <View style={[s.settingIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                    <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={s.settingText}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </Link>
            <View style={s.settingDivider} />
            <TouchableOpacity style={s.settingRow} onPress={() => setShowThemeModal(true)}>
              <View style={s.settingLeft}>
                <View style={[s.settingIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="color-palette-outline" size={20} color={theme.colors.warning} />
                </View>
                <Text style={s.settingText}>Appearance</Text>
              </View>
              <Text style={[s.settingVal, {textTransform: 'capitalize', color: theme.colors.textSecondary}]}>{themeMode} Mode</Text>
            </TouchableOpacity>
            <View style={s.settingDivider} />
            <Link href="/privacy" asChild>
              <TouchableOpacity style={s.settingRow}>
                <View style={s.settingLeft}>
                  <View style={[s.settingIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.success} />
                  </View>
                  <Text style={s.settingText}>Privacy & Security</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </Link>
          </Card>

          <View style={s.actions}>
            <Button 
              title="Sign Out" 
              onPress={logout} 
              variant="secondary" 
              size="lg" 
              icon={<Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />} 
              style={s.signOutBtn}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={showThemeModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Choose Theme</Text>
            
            <TouchableOpacity style={[s.themeOption, themeMode === 'light' && s.themeOptionActive]} onPress={() => { setThemeMode('light'); setShowThemeModal(false); }}>
              <Ionicons name="sunny" size={24} color={themeMode === 'light' ? theme.colors.primary : theme.colors.textMuted} />
              <Text style={[s.themeOptionText, themeMode === 'light' && { color: theme.colors.primary }]}>Light Mode</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[s.themeOption, themeMode === 'dark' && s.themeOptionActive]} onPress={() => { setThemeMode('dark'); setShowThemeModal(false); }}>
              <Ionicons name="moon" size={24} color={themeMode === 'dark' ? theme.colors.primary : theme.colors.textMuted} />
              <Text style={[s.themeOptionText, themeMode === 'dark' && { color: theme.colors.primary }]}>Dark Mode</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[s.themeOption, themeMode === 'system' && s.themeOptionActive]} onPress={() => { setThemeMode('system'); setShowThemeModal(false); }}>
              <Ionicons name="phone-portrait-outline" size={24} color={themeMode === 'system' ? theme.colors.primary : theme.colors.textMuted} />
              <Text style={[s.themeOptionText, themeMode === 'system' && { color: theme.colors.primary }]}>System Default</Text>
            </TouchableOpacity>

            <Button title="Close" variant="secondary" onPress={() => setShowThemeModal(false)} style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  c: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 60 },
  title: { color: theme.colors.text, fontSize: 36, fontWeight: '900' as const, letterSpacing: -1, marginBottom: 16 },
  profileCard: { paddingHorizontal: 24, paddingVertical: 16, marginBottom: 20, alignItems: 'center' },
  profileHeader: { alignItems: 'center', marginBottom: 16 },
  avatarWrapper: { position: 'relative' as const, marginBottom: 16 },
  githubBadge: { position: 'absolute' as const, bottom: 0, right: 0, backgroundColor: '#24292e', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.surface },
  info: { alignItems: 'center' },
  name: { color: theme.colors.text, fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5, marginBottom: 4 },
  user: { color: theme.colors.textSecondary, fontSize: 15, fontWeight: '600' as const },
  statsRow: { flexDirection: 'row', backgroundColor: theme.colors.backgroundSecondary, borderRadius: theme.borderRadius.md, paddingHorizontal: 16, paddingVertical: 12, width: '100%', justifyContent: 'space-around', borderWidth: 1, borderColor: theme.colors.border },
  statItem: { alignItems: 'center' },
  statValue: { color: theme.colors.text, fontSize: 20, fontWeight: '800' as const },
  statLabel: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' as const, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: theme.colors.border },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800' as const, marginBottom: 16 },
  settingsCard: { padding: 0, overflow: 'hidden' as const, marginBottom: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingText: { color: theme.colors.text, fontSize: 15, fontWeight: '600' as const },
  settingVal: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '500' as const },
  settingDivider: { height: 1, backgroundColor: theme.colors.border, marginLeft: 64 },
  actions: { marginTop: 'auto' },
  signOutBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  modalContent: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, paddingHorizontal: 24, paddingVertical: 16, borderWidth: 1, borderColor: theme.colors.border },
  modalTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '800' as const, marginBottom: 16, textAlign: 'center' },
  themeOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: 'transparent', marginBottom: 8 },
  themeOptionActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.backgroundSecondary },
  themeOptionText: { color: theme.colors.text, fontSize: 16, fontWeight: '600' as const }
} as any);
