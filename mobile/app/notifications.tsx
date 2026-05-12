import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Switch, ActivityIndicator,
} from 'react-native';
import { useTheme, useStyles } from '../src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '../src/components/ui/Card';
import { notificationsService, NotificationPreferences } from '../src/lib/notifications';

const DEFAULT_PREFS: NotificationPreferences = {
  pushEnabled: true,
  emailWeekly: false,
  squadAlerts: true,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const s = useStyles(styles);

  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Debounce ref para não enviar uma requisição a cada clique do toggle
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carregar preferências ao montar
  useEffect(() => {
    notificationsService.getPreferences().then((serverPrefs) => {
      setPrefs(serverPrefs);
      setLoading(false);
    });
  }, []);

  // Atualizar preferência com debounce de 600ms
  const handleToggle = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    const updatedPrefs = { ...prefs, [key]: value };
    setPrefs(updatedPrefs); // Atualização otimista (UI imediata)

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      await notificationsService.updatePreferences({ [key]: value });
      setSaving(false);
    }, 600);
  }, [prefs]);

  return (
    <View style={s.c}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Notifications</Text>
          </View>
          {saving && (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          )}
        </View>

        {loading ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={s.loadingText}>Loading preferences...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.scroll}>

            {/* Seção: Push Notifications */}
            <Text style={s.sectionTitle}>Push Notifications</Text>
            <Card style={s.settingsCard}>
              <View style={s.settingRow}>
                <View style={s.settingLeft}>
                  <View style={[s.settingIcon, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
                    <Ionicons name="notifications" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.settingText}>Commit Reminders</Text>
                    <Text style={s.settingSub}>Reminders at 14h, 17h, 20h and 23h to push code</Text>
                  </View>
                </View>
                <Switch
                  value={prefs.pushEnabled}
                  onValueChange={(v) => handleToggle('pushEnabled', v)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </Card>

            {/* Seção: Email */}
            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Email</Text>
            <Card style={s.settingsCard}>
              <View style={s.settingRow}>
                <View style={s.settingLeft}>
                  <View style={[s.settingIcon, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                    <Ionicons name="mail" size={20} color={theme.colors.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.settingText}>Weekly Report</Text>
                    <Text style={s.settingSub}>Commits, top repo, league rank — every Sunday</Text>
                  </View>
                </View>
                <Switch
                  value={prefs.emailWeekly}
                  onValueChange={(v) => handleToggle('emailWeekly', v)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.warning }}
                  thumbColor="#fff"
                />
              </View>
            </Card>

            {/* Seção: Squad & Liga */}
            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Competition</Text>
            <Card style={s.settingsCard}>
              <View style={s.settingRow}>
                <View style={s.settingLeft}>
                  <View style={[s.settingIcon, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                    <Ionicons name="people" size={20} color={theme.colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.settingText}>Surpass Alerts</Text>
                    <Text style={s.settingSub}>When a squad or league member passes you in score</Text>
                  </View>
                </View>
                <Switch
                  value={prefs.squadAlerts}
                  onValueChange={(v) => handleToggle('squadAlerts', v)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                  thumbColor="#fff"
                />
              </View>
            </Card>

            {/* Info box */}
            <View style={s.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.textMuted} />
              <Text style={s.infoText}>
                Changes are saved automatically. Commit reminders are sent at most once per day per user.
              </Text>
            </View>

          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  c: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.5 },
  loadingContainer: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 12 },
  loadingText: { color: theme.colors.textMuted, fontSize: 14 },
  scroll: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40 },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  settingsCard: { padding: 0, overflow: 'hidden' as const, marginBottom: 4 },
  settingRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, flex: 1, paddingRight: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center' as const, justifyContent: 'center' as const },
  settingText: { color: theme.colors.text, fontSize: 15, fontWeight: '600' as const, marginBottom: 2 },
  settingSub: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 16 },
  infoBox: {
    flexDirection: 'row' as const,
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 4,
    alignItems: 'flex-start' as const,
  },
  infoText: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 17, flex: 1 },
});
