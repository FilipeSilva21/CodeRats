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

  //teste
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
              {recentScores.slice(0, 10).map((score, idx) => (
                <View key={idx} style={s.activityRow}>
                  <View style={s.activityLeft}>
                    <View style={[s.activityIconBox, { backgroundColor: theme.colors.backgroundSecondary }]}>
                      <Ionicons name="git-commit-outline" size={20} color={theme.colors.text} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.activityTitle} numberOfLines={1}>
                        Commit Pushed {score.repositoryName ? `- ${score.repositoryName.split('/').pop()}` : ''}
                      </Text>
                      <Text style={s.activitySub} numberOfLines={1}>
                        {new Date(score.scoredAt).toLocaleDateString()} {score.commitHash ? `• ${score.commitHash.substring(0, 7)}` : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={s.pointsPill}>
                    <Text style={s.activityPoints}>+{score.points}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  c: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 12, paddingTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  greeting: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' as const, marginBottom: 2 },
  name: { color: theme.colors.text, fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5 },
  avatarContainer: { position: 'relative' as const },
  onlineIndicator: { position: 'absolute' as const, bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.success, borderWidth: 2, borderColor: theme.colors.background },
  mainCard: { padding: 0, overflow: 'hidden' as const, marginBottom: 8 },
  mainCardInner: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' as const },
  scoreLabel: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.5, marginBottom: 6 },
  scoreVal: { color: theme.colors.text, fontSize: 36, fontWeight: '900' as const, letterSpacing: -1, lineHeight: 40 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.borderRadius.full, gap: 4, borderWidth: 1, borderColor: theme.colors.border },
  streakText: { color: theme.colors.warning, fontWeight: '700' as const, fontSize: 11 },
  progressContainer: { paddingHorizontal: 16, paddingBottom: 14, gap: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' as const },
  progressText: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600' as const },
  progressValue: { color: theme.colors.text, fontSize: 12, fontWeight: '700' as const },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  section: { color: theme.colors.text, fontSize: 16, fontWeight: '800' as const, letterSpacing: -0.5 },
  seeAll: { color: theme.colors.accent, fontSize: 11, fontWeight: '700' as const },
  bar: { height: 4, backgroundColor: theme.colors.border, borderRadius: 2, overflow: 'hidden' as const },
  fill: { height: '100%', borderRadius: 2 },
  grid: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'flex-start' as const, paddingHorizontal: 12, paddingVertical: 10 },
  iconBox: { width: 28, height: 28, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  statVal: { color: theme.colors.text, fontSize: 18, fontWeight: '800' as const, letterSpacing: -0.5, marginBottom: 2 },
  statLabel: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '600' as const },
  activityList: { gap: 8 },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingRight: 8 },
  activityIconBox: { width: 28, height: 28, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  activityTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '700' as const, marginBottom: 2 },
  activitySub: { color: theme.colors.textMuted, fontSize: 10 },
  pointsPill: { backgroundColor: theme.colors.background, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border, marginRight: -5 },
  activityPoints: { color: theme.colors.text, fontSize: 11, fontWeight: '800' as const },
  emptyCard: { alignItems: 'center', justifyContent: 'center', padding: 20, gap: 10, borderStyle: 'dashed' as const },
  emptySubText: { color: theme.colors.textMuted, fontSize: 12 }
} as any);
