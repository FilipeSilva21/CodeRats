import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Switch, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useStyles } from '../src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '../src/components/ui/Card';
import { notificationsService, Notification as AppNotification, NotificationPreferences } from '../src/lib/notifications';

const DEFAULT_PREFS: NotificationPreferences = {
  pushEnabled: true,
  emailWeekly: false,
  squadAlerts: true,
};

const getNotificationIcon = (type: string) => {
  if (type === 'COMMIT_REMINDER') return 'notifications-outline';
  if (type === 'SQUAD_RANKING') return 'people-outline';
  if (type === 'LEAGUE_RANKING') return 'shield-half-outline';
  return 'stats-chart-outline';
};

const formatNotificationDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString();
};

export default function NotificationsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const s = useStyles(styles);

  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPrefs = useRef<NotificationPreferences>(DEFAULT_PREFS);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [serverPrefs, serverNotifications] = await Promise.all([
        notificationsService.getPreferences(),
        notificationsService.getNotifications(),
      ]);

      setPrefs(serverPrefs);
      pendingPrefs.current = serverPrefs;
      setNotifications(serverNotifications);

      if (serverPrefs.pushEnabled) {
        notificationsService.registerDeviceForPushNotifications().catch((pushError) => {
          console.warn('Push notification registration failed:', pushError);
        });
      }
    } catch (loadError) {
      console.error('Failed to load notification settings:', loadError);
      setError('Could not load notifications right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [loadData]);

  const handleNotificationPress = useCallback(async (notification: AppNotification) => {
    if (notification.isRead) return;

    setNotifications((current) =>
      current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item)
    );

    try {
      await notificationsService.markAsRead(notification.id);
    } catch (readError) {
      console.error('Failed to mark notification as read:', readError);
      setError('Could not mark the notification as read.');
      setNotifications((current) =>
        current.map((item) => item.id === notification.id ? { ...item, isRead: false } : item)
      );
    }
  }, []);

  const handleClearAll = useCallback(async () => {
    if (notifications.length === 0) return;
    try {
      await notificationsService.clearAll();
      setNotifications([]);
    } catch (clearError) {
      console.error('Failed to clear notifications:', clearError);
      setError('Could not clear notifications.');
    }
  }, [notifications.length]);

  const handleToggle = useCallback((key: keyof NotificationPreferences, value: boolean) => {
    setError(null);
    setPrefs((currentPrefs) => {
      const updatedPrefs = { ...currentPrefs, [key]: value };
      pendingPrefs.current = updatedPrefs;
      return updatedPrefs;
    });

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      try {
        const nextPrefs = pendingPrefs.current;
        await notificationsService.updatePreferences(nextPrefs);

        if (nextPrefs.pushEnabled) {
          await notificationsService.registerDeviceForPushNotifications();
        } else {
          await notificationsService.clearPushToken();
        }
      } catch (saveError) {
        console.error('Failed to save notification preferences:', saveError);
        setError('Could not save notification preferences.');
      } finally {
        setSaving(false);
      }
    }, 600);
  }, []);

  return (
    <View style={s.c}>
      <SafeAreaView style={{ flex: 1 }}>
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
            <Text style={s.loadingText}>Loading notifications...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.scroll}>
            {error && (
              <View style={s.errorBox}>
                <Ionicons name="warning-outline" size={16} color={theme.colors.danger} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Recent Notifications</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {notifications.length > 0 && (
                  <TouchableOpacity onPress={handleClearAll} style={s.clearBtn}>
                    <Text style={s.clearBtnText}>Clear</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={loadData} style={s.refreshBtn}>
                  <Ionicons name="refresh" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            <Card style={s.notificationsCard}>
              {notifications.length === 0 ? (
                <View style={s.emptyNotifications}>
                  <Ionicons name="notifications-off-outline" size={20} color={theme.colors.textMuted} />
                  <Text style={s.emptyText}>No notifications yet.</Text>
                </View>
              ) : notifications.slice(0, 10).map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.7}
                  style={[s.notificationRow, index === Math.min(notifications.length, 10) - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={[s.notificationIcon, !item.isRead && { backgroundColor: 'rgba(99, 102, 241, 0.16)' }]}>
                    <Ionicons name={getNotificationIcon(item.type) as any} size={18} color={theme.colors.primary} />
                  </View>
                  <View style={s.notificationContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={s.notificationTitle} numberOfLines={1}>{item.title}</Text>
                      {!item.isRead && <View style={s.unreadDot} />}
                    </View>
                    <Text style={s.notificationMessage} numberOfLines={2}>{item.message}</Text>
                    <Text style={s.notificationDate}>{formatNotificationDate(item.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Card>

            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Push Notifications</Text>
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
                  trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                  thumbColor="#fff"
                />
              </View>
            </Card>

            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Email</Text>
            <Card style={s.settingsCard}>
              <View style={s.settingRow}>
                <View style={s.settingLeft}>
                  <View style={[s.settingIcon, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                    <Ionicons name="mail" size={20} color={theme.colors.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.settingText}>Weekly Report</Text>
                    <Text style={s.settingSub}>Commits, top repo, league rank - every Sunday</Text>
                  </View>
                </View>
                <Switch
                  value={prefs.emailWeekly}
                  onValueChange={(v) => handleToggle('emailWeekly', v)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                  thumbColor="#fff"
                />
              </View>
            </Card>

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
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800' as const },
  loadingContainer: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 12 },
  loadingText: { color: theme.colors.textMuted, fontSize: 14 },
  scroll: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40 },
  sectionHeaderRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 8 },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: `${theme.colors.danger}15`,
  },
  clearBtnText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  notificationsCard: { padding: 0, overflow: 'hidden' as const },
  notificationRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.colors.background,
  },
  notificationContent: { flex: 1 },
  notificationTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '700' as const, flex: 1 },
  notificationMessage: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 2 },
  notificationDate: { color: theme.colors.textMuted, fontSize: 10, marginTop: 6, fontWeight: '700' as const },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  emptyNotifications: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, padding: 16 },
  emptyText: { color: theme.colors.textMuted, fontSize: 13 },
  errorBox: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    backgroundColor: `${theme.colors.danger}10`,
  },
  errorText: { color: theme.colors.danger, fontSize: 12, flex: 1 },
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
