import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useTheme, useStyles } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { useLeaderboardStore } from '../../src/features/leaderboard/store/leaderboardStore';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useWebSocket } from '../../src/lib/websocket';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LeaderboardScreen() {
  const { users, isLoading, fetchGlobalLeaderboard } = useLeaderboardStore();
  const { user: currentUser } = useAuthStore();
  const theme = useTheme();
  const s = useStyles(styles);

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, []);

  useWebSocket('/leaderboard/global', {
    onMessage: (data) => {
      if (data.type === 'SCORE_UPDATED') {
        fetchGlobalLeaderboard();
      }
    }
  });

  const currentLeague = currentUser?.league || 'BRONZE';
  const totalUsers = users.length;
  const promotionCount = 5;
  const demotionCount = 5;

  const renderTopThree = () => {
    if (users.length === 0) return null;
    const top3 = [users[1], users[0], users[2]]; // 2nd, 1st, 3rd

    return (
      <View style={s.topThreeContainer}>
        {top3.map((user, idx) => {
          if (!user) return <View key={`empty-${idx}`} style={s.podiumEmpty} />;
          const isFirst = idx === 1;
          const isSecond = idx === 0;
          const isThird = idx === 2;
          const isCurrentUser = user.userId === currentUser?.id;

          let podiumHeight = isFirst ? 140 : isSecond ? 110 : 90;

          return (
            <View key={user.userId || `podium-${idx}`} style={s.podiumCol}>
              <View style={[s.podiumAvatar, isCurrentUser && s.podiumCurrentUserAvatar]}>
                <Avatar uri={user.avatarUrl} name={user.displayName} size={isFirst ? 80 : 64} />
              </View>
              <Text style={[s.podiumName, isCurrentUser && { color: theme.colors.accent }]} numberOfLines={1}>
                {isCurrentUser ? 'You' : user.displayName}
              </Text>
              <Text style={s.podiumScore}>{user.totalScore.toLocaleString()}</Text>
              <View style={[s.podiumBase, { height: podiumHeight, backgroundColor: isFirst ? `${theme.colors.accent}15` : theme.colors.surface, borderColor: isFirst ? theme.colors.accent : theme.colors.border }]}>
                <Text style={[s.podiumRankText, { color: isFirst ? theme.colors.accent : theme.colors.textMuted }]}>{isFirst ? '1' : isSecond ? '2' : '3'}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const globalRank = index + 4;
    const isCurrentUser = item.userId === currentUser?.id;

    let zoneType = 'safe';
    if (globalRank <= promotionCount) zoneType = 'promotion';
    else if (globalRank > totalUsers - demotionCount) zoneType = 'demotion';

    const showZoneLabel = (zoneType === 'promotion' && globalRank === 4) ||
      (zoneType === 'safe' && globalRank === promotionCount + 1) ||
      (zoneType === 'demotion' && globalRank === totalUsers - demotionCount + 1);

    return (
      <View>
        {showZoneLabel && (
          <View style={[s.zoneHeader,
          zoneType === 'promotion' ? s.promotionZone :
            zoneType === 'demotion' ? s.demotionZone : s.safeZone
          ]}>
            <Text style={[s.zoneText,
            zoneType === 'promotion' ? { color: theme.colors.success } :
              zoneType === 'demotion' ? { color: theme.colors.danger } : { color: theme.colors.textMuted }
            ]}>
              {zoneType === 'promotion' ? 'PROMOTION ZONE' : zoneType === 'demotion' ? 'DEMOTION ZONE' : 'SAFE ZONE'}
            </Text>
          </View>
        )}
        <Card style={[s.rowCard, isCurrentUser && s.currentUserCard, { backgroundColor: isCurrentUser ? `${theme.colors.accent}10` : theme.colors.surface }]}>
          <View style={s.row}>
            <View style={s.left}>
              <Text style={s.rank}>{globalRank}</Text>
              <Avatar uri={item.avatarUrl} name={item.displayName} size={40} />
              <View>
                <Text style={[s.name, isCurrentUser && { color: theme.colors.accent }]}>{isCurrentUser ? 'You' : item.displayName}</Text>
                <Text style={s.username}>@{item.username}</Text>
              </View>
            </View>
            <View style={s.scoreContainer}>
              <Text style={s.score}>{item.totalScore.toLocaleString()}</Text>
              <Text style={s.xpLabel}>XP</Text>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  return (
    <View style={s.c}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.header}>
          <Text style={s.pageTitle}>Leaderboard</Text>
          <View style={s.leagueIndicator}>
            <Text style={s.leagueText}>{currentLeague} LEAGUE</Text>
            <View style={s.timerContainer}>
              <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
              <Text style={s.timerText}>ENDS IN 3D 14H</Text>
            </View>
          </View>
        </View>

        {isLoading && users.length === 0 ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={users.slice(3)}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: theme.spacing.xl }}
            ListHeaderComponent={renderTopThree}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchGlobalLeaderboard} tintColor={theme.colors.accent} />}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  c: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: theme.spacing.xl, paddingTop: 16, marginBottom: 0 },
  pageTitle: { color: theme.colors.text, fontSize: 32, fontWeight: '800' as const, letterSpacing: -1 },
  leagueIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  leagueText: { color: theme.colors.accent, fontSize: 13, fontWeight: '800' as const, letterSpacing: 1.5 },
  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerText: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
  topThreeContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 24, gap: 12, height: 320 },
  podiumCol: { alignItems: 'center', width: '30%' },
  podiumEmpty: { width: '30%' },
  podiumAvatar: { marginBottom: 12, alignItems: 'center', justifyContent: 'center' },
  podiumCurrentUserAvatar: { padding: 2, borderWidth: 2, borderColor: theme.colors.accent, borderRadius: 100 },
  podiumName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' as const, marginBottom: 2, textAlign: 'center' },
  podiumScore: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' as const, textAlign: 'center', marginBottom: 12 },
  podiumBase: { width: '100%', borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg, alignItems: 'center', paddingTop: 16, borderWidth: 1, borderBottomWidth: 0 },
  podiumRankText: { fontSize: 24, fontWeight: '900' as const },
  zoneHeader: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: theme.borderRadius.sm, marginBottom: 12, marginTop: 16, alignSelf: 'flex-start' as const },
  promotionZone: { backgroundColor: `${theme.colors.success}10` },
  demotionZone: { backgroundColor: `${theme.colors.danger}10` },
  safeZone: { backgroundColor: theme.colors.surface },
  zoneText: { fontSize: 11, fontWeight: '800' as const, letterSpacing: 1 },
  rowCard: { padding: 16, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  currentUserCard: { borderColor: theme.colors.accent, borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  rank: { fontSize: 15, fontWeight: '800' as const, color: theme.colors.textMuted, width: 24 },
  name: { color: theme.colors.text, fontSize: 16, fontWeight: '700' as const },
  username: { color: theme.colors.textMuted, fontSize: 12, marginTop: 1 },
  scoreContainer: { alignItems: 'flex-end' },
  score: { color: theme.colors.text, fontSize: 16, fontWeight: '800' as const },
  xpLabel: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '700' as const, marginTop: 1 }
} as any);