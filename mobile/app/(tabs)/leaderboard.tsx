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

  // Calculate Zones based on LeagueService (Top 20%, Bottom 20%)
  const totalUsers = users.length;
  const promotionCount = Math.max(1, Math.floor(totalUsers * 0.2));
  const demotionCount = Math.max(1, Math.floor(totalUsers * 0.2));
  const safeCount = totalUsers - promotionCount - demotionCount;

  // Find current user's league or default to Bronze
  const currentLeague = currentUser?.league || 'BRONZE';

  const getLeagueTheme = (league: string) => {
    switch (league) {
      case 'DIAMOND': return { color: '#60A5FA', name: 'Diamond League', icon: 'sparkles' };
      case 'PLATINUM': return { color: '#34D399', name: 'Platinum League', icon: 'star' };
      case 'GOLD': return { color: '#FBBF24', name: 'Gold League', icon: 'trophy' };
      case 'SILVER': return { color: '#9CA3AF', name: 'Silver League', icon: 'medal' };
      case 'BRONZE': default: return { color: '#B45309', name: 'Bronze League', icon: 'shield' };
    }
  };

  const leagueTheme = getLeagueTheme(currentLeague);

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

          let podiumHeight = 100;
          let colors = ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)'];
          let crownColor = theme.colors.textMuted;

          if (isFirst) {
            podiumHeight = 140;
            colors = [`${leagueTheme.color}33`, 'rgba(255,255,255,0)'];
            crownColor = leagueTheme.color;
          } else if (isSecond) {
            podiumHeight = 110;
            colors = ['rgba(156, 163, 175, 0.2)', 'rgba(156, 163, 175, 0)'];
            crownColor = '#9CA3AF';
          } else if (isThird) {
            podiumHeight = 90;
            colors = ['rgba(180, 83, 9, 0.2)', 'rgba(180, 83, 9, 0)'];
            crownColor = '#B45309';
          }

          return (
            <View key={user.userId || `podium-${idx}`} style={s.podiumCol}>
              <View style={[s.podiumAvatar, isCurrentUser && s.podiumCurrentUserAvatar]}>
                {isFirst && <MaterialCommunityIcons name="crown" size={24} color={crownColor} style={s.crown} />}
                <Avatar uri={user.avatarUrl} name={user.displayName} size={isFirst ? 72 : 56} />
              </View>
              <Text style={[s.podiumName, isCurrentUser && { color: theme.colors.primary, fontWeight: '900' as const }]} numberOfLines={1}>
                {isCurrentUser ? 'You' : user.displayName}
              </Text>
              <Text style={s.podiumScore}>{user.totalScore.toLocaleString()}</Text>
              <LinearGradient colors={colors as any} style={[s.podiumBase, { height: podiumHeight, borderColor: isFirst ? leagueTheme.color : theme.colors.glassBorder }]}>
                <Text style={[s.podiumRank, isCurrentUser && { color: theme.colors.primary, opacity: 1 }]}>{isFirst ? '1' : isSecond ? '2' : '3'}</Text>
              </LinearGradient>
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const globalRank = index + 4; // Since we slice first 3
    const isCurrentUser = item.userId === currentUser?.id;

    let zoneType = 'safe';
    let zoneColor = 'transparent';
    let label = '';

    if (globalRank <= promotionCount) {
      zoneType = 'promotion';
      zoneColor = 'rgba(16, 185, 129, 0.1)'; // Success Green
      label = currentLeague !== 'DIAMOND' ? 'Promotion Zone' : 'Top Tier';
    } else if (globalRank > totalUsers - demotionCount) {
      zoneType = 'demotion';
      zoneColor = 'rgba(239, 68, 68, 0.1)'; // Danger Red
      label = currentLeague !== 'BRONZE' ? 'Demotion Zone' : 'Bottom Tier';
    }

    // Show label only for the first person in that zone
    const showZoneLabel = (zoneType === 'promotion' && globalRank === 4) ||
      (zoneType === 'safe' && globalRank === promotionCount + 1) ||
      (zoneType === 'demotion' && globalRank === totalUsers - demotionCount + 1);

    return (
      <View>
        {showZoneLabel && (
          <View style={[s.zoneHeader,
          zoneType === 'promotion' ? { backgroundColor: 'rgba(16, 185, 129, 0.15)' } :
            zoneType === 'demotion' ? { backgroundColor: 'rgba(239, 68, 68, 0.15)' } :
              { backgroundColor: theme.colors.surface }
          ]}>
            <Text style={[s.zoneHeaderText,
            zoneType === 'promotion' ? { color: theme.colors.success } :
              zoneType === 'demotion' ? { color: theme.colors.danger } :
                { color: theme.colors.textSecondary }
            ]}>
              {zoneType === 'safe' ? 'Safe Zone' : label}
            </Text>
          </View>
        )}
        <Card variant="glass" style={[s.rowCard, isCurrentUser && s.currentUserCard, { backgroundColor: isCurrentUser ? `${theme.colors.primary}15` : zoneColor }]}>
          <View style={s.row}>
            <View style={s.left}>
              <Text style={[s.rank, isCurrentUser && s.currentUserText]}>{globalRank}</Text>
              <Avatar uri={item.avatarUrl} name={item.displayName} size={44} />
              <View>
                <Text style={[s.name, isCurrentUser && s.currentUserText]}>{isCurrentUser ? 'You' : item.displayName}</Text>
                <Text style={s.username}>@{item.username}</Text>
              </View>
            </View>
            <View style={[s.scorePill, isCurrentUser && { backgroundColor: theme.colors.primary }]}>
              <Text style={[s.score, isCurrentUser && { color: '#fff' }]}>{item.totalScore.toLocaleString()} XP</Text>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  return (
    <View style={s.c}>
      <LinearGradient colors={[`${leagueTheme.color}15`, 'transparent']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.header}>
          <View style={s.leagueBanner}>
            <Ionicons name={leagueTheme.icon as any} size={28} color={leagueTheme.color} />
            <View>
              <Text style={[s.leagueName, { color: leagueTheme.color }]}>{leagueTheme.name}</Text>
              <View style={s.timerContainer}>
                <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={s.timerText}>Ends in 3d 14h</Text>
              </View>
            </View>
          </View>
        </View>

        {isLoading && users.length === 0 ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={users.slice(3)}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={{ paddingBottom: 60, paddingHorizontal: 24 }}
            ListHeaderComponent={renderTopThree}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchGlobalLeaderboard} tintColor={theme.colors.primary} />}
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
  header: { marginBottom: 0, paddingHorizontal: 24, paddingTop: 0 },
  leagueBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, paddingHorizontal: 16, paddingVertical: 12, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.glassBorder, gap: 12, ...theme.shadows.md },
  leagueName: { fontSize: 24, fontWeight: '900' as const, letterSpacing: -0.5 },
  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  timerText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600' as const },
  topThreeContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 20, gap: 12, height: 260, marginTop: 16 },
  podiumCol: { alignItems: 'center', width: '30%' },
  podiumEmpty: { width: '30%' },
  podiumAvatar: { position: 'relative' as const, marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  podiumCurrentUserAvatar: { borderWidth: 3, borderColor: theme.colors.primary, borderRadius: 100, padding: 2 },
  crown: { position: 'absolute' as const, top: -20, left: '50%', transform: [{ translateX: -12 }], zIndex: 10 },
  podiumName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' as const, marginBottom: 2, textAlign: 'center' },
  podiumScore: { color: theme.colors.primary, fontSize: 13, fontWeight: '800' as const, marginBottom: 8 },
  podiumBase: { width: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16, alignItems: 'center', paddingTop: 16, borderWidth: 1, borderColor: theme.colors.glassBorder, borderBottomWidth: 0 },
  podiumRank: { color: theme.colors.text, fontSize: 24, fontWeight: '900' as const, opacity: 0.5 },
  zoneHeader: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' as const, marginBottom: 12, marginTop: 8 },
  zoneHeaderText: { fontSize: 12, fontWeight: '800' as const, textTransform: 'uppercase' as const, letterSpacing: 1 },
  rowCard: { padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.glassBorder },
  currentUserCard: { borderColor: theme.colors.primary, borderWidth: 2, transform: [{ scale: 1.02 }] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rank: { fontSize: 18, fontWeight: '900' as const, color: theme.colors.textMuted, width: 28, textAlign: 'center' },
  name: { color: theme.colors.text, fontSize: 16, fontWeight: '700' as const },
  currentUserText: { color: theme.colors.text, fontWeight: '900' as const },
  username: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 2 },
  scorePill: { backgroundColor: 'rgba(139, 92, 246, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  score: { color: theme.colors.accent, fontSize: 15, fontWeight: '800' as const }
} as any);