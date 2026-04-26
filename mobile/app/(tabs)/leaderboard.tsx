import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { theme } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import { Avatar } from '../../src/components/ui/Avatar';
import { useLeaderboardStore } from '../../src/features/leaderboard/store/leaderboardStore';
import { useWebSocket } from '../../src/lib/websocket';

export default function LeaderboardScreen() {
  const { users, isLoading, fetchGlobalLeaderboard } = useLeaderboardStore();

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, []);

  useWebSocket('/leaderboard/global', {
    onMessage: (data) => {
      if (data.type === 'SCORE_UPDATED') {
        // Silently refresh leaderboard in background
        fetchGlobalLeaderboard();
      }
    }
  });

  return (
    <SafeAreaView style={s.c}>
      <View style={s.header}>
        <Text style={s.title}>🏆 Global Ranking</Text>
        <Text style={s.sub}>Top developers worldwide</Text>
      </View>

      {isLoading && users.length === 0 ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchGlobalLeaderboard} tintColor={theme.colors.primary} />}
          renderItem={({ item, index }) => (
            <Card variant={index < 3 ? 'highlight' : 'glass'} style={s.row}>
              <View style={s.left}>
                <Text style={[s.rank, index === 0 ? s.gold : index === 1 ? s.silver : index === 2 ? s.bronze : {}]}>
                  #{index + 1}
                </Text>
                <Avatar uri={item.avatarUrl} name={item.displayName} size={40} />
                <View>
                  <Text style={s.name}>{item.displayName}</Text>
                  <Text style={s.username}>@{item.username}</Text>
                </View>
              </View>
              <Text style={s.score}>{item.totalScore.toLocaleString()} pts</Text>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: theme.colors.background, padding: 24 },
  header: { marginBottom: 24 },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '800' },
  sub: { color: theme.colors.textSecondary, fontSize: 14, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rank: { fontSize: 16, fontWeight: '800', color: theme.colors.textMuted, width: 30 },
  gold: { color: '#FBBF24', fontSize: 20 },
  silver: { color: '#9CA3AF', fontSize: 18 },
  bronze: { color: '#B45309', fontSize: 16 },
  name: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  username: { color: theme.colors.textSecondary, fontSize: 12 },
  score: { color: theme.colors.text, fontSize: 18, fontWeight: '800' }
});
