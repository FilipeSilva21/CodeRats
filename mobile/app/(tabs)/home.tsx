import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useScoringStore } from '../../src/features/scoring/store/scoringStore';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { useTheme, useStyles } from '../../src/theme';
import { useWebSocket } from '../../src/lib/websocket';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { totalScore, todayScore, dailyCap, recentScores, fetchScoreSummary, fetchDailyProgress, isLoading } = useScoringStore();
  const theme = useTheme();
  const s = useStyles(styles);

  const loadData = async () => {
    await Promise.all([fetchScoreSummary(), fetchDailyProgress()]);
  };

  useEffect(() => {
    loadData();
  }, []);

  useWebSocket('/leaderboard/global', {
    onMessage: (data) => {
      if (data.type === 'SCORE_UPDATED') {
        loadData();
      }
    }
  });

  const progressPercent = Math.min((todayScore / dailyCap) * 100, 100) || 0;

  return (
    <View style={s.c}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={theme.colors.primary} />}
        >
          <View style={s.header}>
            <View>
              <Text style={s.greeting}>Welcome back,</Text>
              <Text style={s.name}>{user?.displayName || 'Developer'}</Text>
            </View>
            <View style={s.avatarContainer}>
              <Avatar uri={user?.avatarUrl || null} name={user?.displayName || 'U'} size={56} />
              <View style={s.onlineIndicator} />
            </View>
          </View>

          <Card style={s.mainCard}>
            <View style={s.mainCardInner}>
              <View>
                <Text style={s.scoreLabel}>TOTAL XP</Text>
                <Text style={s.scoreVal}>{totalScore.toLocaleString()}</Text>
              </View>
              <View style={s.streakBadge}>
                <Ionicons name="flame" size={16} color={theme.colors.warning} />
                <Text style={s.streakText}>{user?.currentStreak || 0} Days</Text>
              </View>
            </View>

            <View style={s.progressContainer}>
              <View style={s.progressHeader}>
                <Text style={s.progressText}>Daily Goal</Text>
                <Text style={s.progressValue}>{todayScore} <Text style={{ color: theme.colors.textMuted }}>/ {dailyCap}</Text></Text>
              </View>
              <View style={s.bar}>
                <View style={[s.fill, { width: `${progressPercent}%`, backgroundColor: theme.colors.accent }]} />
              </View>
            </View>
          </Card>

          <View style={s.grid}>
            <Card style={s.stat}>
              <View style={[s.iconBox, { backgroundColor: theme.colors.backgroundSecondary }]}>
                <Ionicons name="flame" size={24} color={theme.colors.warning} />
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={s.statVal}>{user?.currentStreak || 0}</Text>
                <Text style={s.statLabel}>Current Streak</Text>
              </View>
            </Card>
            <Card style={s.stat}>
              <View style={[s.iconBox, { backgroundColor: theme.colors.backgroundSecondary }]}>
                <Ionicons name="trophy" size={24} color={theme.colors.accent} />
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={s.statVal}>{user?.bestStreak || 0}</Text>
                <Text style={s.statLabel}>Best Streak</Text>
              </View>
            </Card>
          </View>

          <View style={s.sectionHeader}>
            <Text style={s.section}>Recent Activity</Text>
            <Link href="/activity" asChild>
              <TouchableOpacity>
                <Text style={s.seeAll}>See All</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {recentScores.length === 0 ? (
            <Card style={s.emptyCard}>
              <Ionicons name="code-slash-outline" size={32} color={theme.colors.textMuted} />
              <Text style={s.emptyText}>No activity yet.</Text>
              <Text style={s.emptySubText}>Push some code to earn XP!</Text>
            </Card>
          ) : (
            <View style={s.activityList}>
              {recentScores.map((score, idx) => (
                <View key={idx} style={s.activityRow}>
                  <View style={s.activityLeft}>
                    <View style={[s.activityIconBox, { backgroundColor: theme.colors.backgroundSecondary }]}>
                      <Ionicons name="git-commit-outline" size={20} color={theme.colors.text} />
                    </View>
                    <View>
                      <Text style={s.activityTitle}>Commit Pushed</Text>
                      <Text style={s.activitySub}>{new Date(score.scoredAt).toLocaleDateString()} • {score.commitHash?.substring(0, 7)}</Text>
                    </View>
                  </View>
                  <View style={s.pointsPill}>
                    <Text style={s.activityPoints}>+{score.points}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  c: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 24, paddingVertical: 16, gap: 16, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  greeting: { color: theme.colors.textSecondary, fontSize: 16, fontWeight: '500' as const, marginBottom: 4 },
  name: { color: theme.colors.text, fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  avatarContainer: { position: 'relative' as const },
  onlineIndicator: { position: 'absolute' as const, bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: theme.colors.success, borderWidth: 2, borderColor: theme.colors.background },
  mainCard: { padding: 0, overflow: 'hidden' as const },
  mainCardInner: { paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' as const },
  scoreLabel: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '700' as const, letterSpacing: 1.5, marginBottom: 8 },
  scoreVal: { color: theme.colors.text, fontSize: 48, fontWeight: '900' as const, letterSpacing: -2, lineHeight: 52 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.backgroundSecondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.full, gap: 6, borderWidth: 1, borderColor: theme.colors.border },
  streakText: { color: theme.colors.warning, fontWeight: '700' as const, fontSize: 13 },
  progressContainer: { paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' as const },
  progressText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '600' as const },
  progressValue: { color: theme.colors.text, fontSize: 15, fontWeight: '700' as const },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  section: { color: theme.colors.text, fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.5 },
  seeAll: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' as const },
  bar: { height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: 'hidden' as const },
  fill: { height: '100%', borderRadius: 3 },
  grid: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, alignItems: 'flex-start' as const, paddingHorizontal: 20, paddingVertical: 12 },
  iconBox: { width: 40, height: 40, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  statVal: { color: theme.colors.text, fontSize: 28, fontWeight: '800' as const, letterSpacing: -1, marginBottom: 2 },
  statLabel: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' as const },
  activityList: { gap: 12 },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.border },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIconBox: { width: 40, height: 40, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  activityTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' as const, marginBottom: 4 },
  activitySub: { color: theme.colors.textMuted, fontSize: 13 },
  pointsPill: { backgroundColor: theme.colors.backgroundSecondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.full },
  activityPoints: { color: theme.colors.accent, fontSize: 14, fontWeight: '800' as const },
  emptyCard: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12, borderStyle: 'dashed' as const },
  emptySubText: { color: theme.colors.textMuted, fontSize: 14 }
} as any);
