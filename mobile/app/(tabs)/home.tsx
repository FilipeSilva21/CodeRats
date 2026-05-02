import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useScoringStore } from '../../src/features/scoring/store/scoringStore';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Avatar } from '../../src/components/ui/Avatar';
import { theme } from '../../src/theme';
import { useWebSocket } from '../../src/lib/websocket';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { totalScore, todayScore, dailyCap, recentScores, fetchScoreSummary, fetchDailyProgress, isLoading } = useScoringStore();

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
    <SafeAreaView style={s.c}>
      <ScrollView 
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={theme.colors.primary} />}
      >
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Welcome back,</Text>
            <Text style={s.name}>{user?.displayName || 'Developer'}</Text>
          </View>
          <Avatar uri={user?.avatarUrl || null} name={user?.displayName || 'U'} size={50} />
        </View>

        <Card variant="highlight" style={{ alignItems: 'center', gap: 12 }}>
          <Text style={s.scoreLabel}>Total Score</Text>
          <Text style={s.scoreVal}>{totalScore.toLocaleString()}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Badge label={`🔥 ${user?.currentStreak || 0} day streak`} variant="warning" />
          </View>
        </Card>

        <Card variant="glass">
          <View style={s.progressHeader}>
            <Text style={s.section}>Today's Progress</Text>
            <Text style={s.progressText}>{todayScore} / {dailyCap} pts</Text>
          </View>
          <View style={s.bar}>
            <View style={[s.fill, { width: `${progressPercent}%` }]} />
          </View>
        </Card>

        <View style={s.grid}>
          <Card variant="default" style={s.stat}>
            <Text style={{ fontSize: 28 }}>🔥</Text>
            <Text style={s.statVal}>{user?.currentStreak || 0}</Text>
            <Text style={s.statLabel}>Current Streak</Text>
          </Card>
          <Card variant="default" style={s.stat}>
            <Text style={{ fontSize: 28 }}>🏆</Text>
            <Text style={s.statVal}>{user?.bestStreak || 0}</Text>
            <Text style={s.statLabel}>Best Streak</Text>
          </Card>
        </View>

        <Text style={s.section}>Recent Activity</Text>
        {recentScores.length === 0 ? (
          <Card variant="glass">
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center' }}>No activity yet. Push some code! 🚀</Text>
          </Card>
        ) : (
          <View style={{ gap: 8 }}>
            {recentScores.map((score, idx) => (
              <Card key={idx} variant="glass" style={s.activityCard}>
                <View style={s.activityLeft}>
                  <Text style={{ fontSize: 20 }}>💻</Text>
                  <View>
                    <Text style={s.activityTitle}>Commit pushed</Text>
                    <Text style={s.activitySub}>{new Date(score.scoredAt).toLocaleDateString()} • {score.commitHash?.substring(0,7)}</Text>
                  </View>
                </View>
                <Text style={s.activityPoints}>+{score.points}</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: theme.colors.background }, 
  scroll: { padding: 24, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  greeting: { color: theme.colors.textSecondary, fontSize: 14 }, 
  name: { color: theme.colors.text, fontSize: 24, fontWeight: '800' },
  scoreLabel: { color: theme.colors.textSecondary, fontSize: 14, textTransform: 'uppercase', letterSpacing: 2 }, 
  scoreVal: { color: theme.colors.text, fontSize: 48, fontWeight: '800' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { color: theme.colors.accent, fontSize: 14, fontWeight: '600' },
  section: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  bar: { height: 8, backgroundColor: theme.colors.backgroundTertiary, borderRadius: 4, overflow: 'hidden', marginTop: 12 },
  fill: { height: '100%', borderRadius: 4, backgroundColor: theme.colors.accent },
  grid: { flexDirection: 'row', gap: 16 }, 
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { color: theme.colors.text, fontSize: 28, fontWeight: '800' }, 
  statLabel: { color: theme.colors.textSecondary, fontSize: 12 },
  activityCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  activitySub: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  activityPoints: { color: theme.colors.success, fontSize: 16, fontWeight: '800' }
});
