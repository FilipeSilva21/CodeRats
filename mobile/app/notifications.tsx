import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useTheme, useStyles } from '../src/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Card } from '../src/components/ui/Card';

export default function NotificationsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const s = useStyles(styles);
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [squadAlerts, setSquadAlerts] = useState(true);

  return (
    <View style={s.c}>
      <LinearGradient colors={['rgba(99, 102, 241, 0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={s.title}>Notifications</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.sectionTitle}>Preferences</Text>
          <Card variant="glass" style={s.settingsCard}>
            <View style={s.settingRow}>
              <View style={s.settingLeft}>
                <View style={[s.settingIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Ionicons name="notifications" size={20} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={s.settingText}>Push Notifications</Text>
                  <Text style={s.settingSub}>Receive alerts on your device</Text>
                </View>
              </View>
              <Switch 
                value={pushEnabled} 
                onValueChange={setPushEnabled}
                trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
            
            <View style={s.settingDivider} />
            
            <View style={s.settingRow}>
              <View style={s.settingLeft}>
                <View style={[s.settingIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="mail" size={20} color={theme.colors.warning} />
                </View>
                <View>
                  <Text style={s.settingText}>Email Digests</Text>
                  <Text style={s.settingSub}>Weekly summary of your stats</Text>
                </View>
              </View>
              <Switch 
                value={emailEnabled} 
                onValueChange={setEmailEnabled}
                trackColor={{ false: theme.colors.surface, true: theme.colors.warning }}
                thumbColor="#fff"
              />
            </View>
          </Card>

          <Text style={[s.sectionTitle, { marginTop: 16 }]}>Squad</Text>
          <Card variant="glass" style={s.settingsCard}>
            <View style={s.settingRow}>
              <View style={s.settingLeft}>
                <View style={[s.settingIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="people" size={20} color={theme.colors.success} />
                </View>
                <View>
                  <Text style={s.settingText}>Squad Alerts</Text>
                  <Text style={s.settingSub}>When squad members pass you</Text>
                </View>
              </View>
              <Switch 
                value={squadAlerts} 
                onValueChange={setSquadAlerts}
                trackColor={{ false: theme.colors.surface, true: theme.colors.success }}
                thumbColor="#fff"
              />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  c: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16, gap: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.glassBorder },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5 },
  scroll: { padding: 24, gap: 16 },
  sectionTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '800' as const, marginBottom: 8 },
  settingsCard: { padding: 0, overflow: 'hidden' as const, borderWidth: 1, borderColor: theme.colors.glassBorder },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 16 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingText: { color: theme.colors.text, fontSize: 16, fontWeight: '600' as const, marginBottom: 2 },
  settingSub: { color: theme.colors.textSecondary, fontSize: 13 },
  settingDivider: { height: 1, backgroundColor: theme.colors.glassBorder, marginLeft: 64 },
});
