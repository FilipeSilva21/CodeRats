import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme, useStyles } from '../src/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Card } from '../src/components/ui/Card';

export default function PrivacyScreen() {
  const router = useRouter();
  const theme = useTheme();
  const s = useStyles(styles);

  const [privateProfile, setPrivateProfile] = useState(false);
  const [showCode, setShowCode] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure you want to permanently delete your account? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Error', 'Account deletion requires email verification first.') }
    ]);
  };

  return (
    <View style={s.c}>
      <LinearGradient colors={['rgba(99, 102, 241, 0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={s.title}>Privacy & Security</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.sectionTitle}>Profile Visibility</Text>
          <Card variant="glass" style={s.settingsCard}>
            <View style={s.settingRow}>
              <View style={s.settingLeft}>
                <View style={[s.settingIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Ionicons name="lock-closed" size={20} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={s.settingText}>Private Profile</Text>
                  <Text style={s.settingSub}>Only squad members can see you</Text>
                </View>
              </View>
              <Switch 
                value={privateProfile} 
                onValueChange={setPrivateProfile}
                trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
            
            <View style={s.settingDivider} />
            
            <View style={s.settingRow}>
              <View style={s.settingLeft}>
                <View style={[s.settingIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="code-working" size={20} color={theme.colors.success} />
                </View>
                <View>
                  <Text style={s.settingText}>Show Commits</Text>
                  <Text style={s.settingSub}>Show recent commit hashes</Text>
                </View>
              </View>
              <Switch 
                value={showCode} 
                onValueChange={setShowCode}
                trackColor={{ false: theme.colors.surface, true: theme.colors.success }}
                thumbColor="#fff"
              />
            </View>
          </Card>

          <Text style={[s.sectionTitle, { marginTop: 16 }]}>Security</Text>
          <Card variant="glass" style={s.settingsCard}>
            <TouchableOpacity style={s.settingRow} onPress={() => Alert.alert('Password', 'Password reset email sent.')}>
              <View style={s.settingLeft}>
                <View style={[s.settingIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="key" size={20} color={theme.colors.warning} />
                </View>
                <Text style={s.settingText}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
            <View style={s.settingDivider} />
            <TouchableOpacity style={s.settingRow} onPress={handleDeleteAccount}>
              <View style={s.settingLeft}>
                <View style={[s.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <Ionicons name="trash" size={20} color={theme.colors.danger} />
                </View>
                <Text style={[s.settingText, { color: theme.colors.danger }]}>Delete Account</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  c: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 16, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.glassBorder },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5 },
  scroll: { paddingHorizontal: 24, paddingVertical: 16, gap: 12 },
  sectionTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800' as const, marginBottom: 8 },
  settingsCard: { padding: 0, overflow: 'hidden' as const, borderWidth: 1, borderColor: theme.colors.glassBorder },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 16 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingText: { color: theme.colors.text, fontSize: 16, fontWeight: '600' as const, marginBottom: 2 },
  settingSub: { color: theme.colors.textSecondary, fontSize: 13 },
  settingDivider: { height: 1, backgroundColor: theme.colors.glassBorder, marginLeft: 64 },
});
