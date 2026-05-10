import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, RefreshControl, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme, useStyles } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Avatar } from '../../src/components/ui/Avatar';
import { useLeaderboardStore } from '../../src/features/leaderboard/store/leaderboardStore';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useWebSocket } from '../../src/lib/websocket';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LeaderboardScreen() {
  const { users, tiers, isLoading, fetchGlobalLeaderboard, fetchTiers } = useLeaderboardStore();
  const { user: currentUser } = useAuthStore();
  const theme = useTheme();
  const s = useStyles(styles);
  
  const [showLeagueModal, setShowLeagueModal] = useState(false);

  useEffect(() => {
    fetchGlobalLeaderboard();
    fetchTiers();
  }, []);

  useWebSocket('/leaderboard/global', {
    onMessage: (data) => {
      if (data.type === 'SCORE_UPDATED') {
        fetchGlobalLeaderboard();
      }
    }
  });

  const currentLeague = currentUser?.league || 'BRONZE';
  const currentTierObj = tiers.find(t => t.name === currentLeague) || { name: currentLeague, color: theme.colors.accent };
  
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
              <View style={[s.podiumBase, { height: podiumHeight, backgroundColor: isFirst ? `${currentTierObj.color}15` : theme.colors.surface, borderColor: isFirst ? currentTierObj.color : theme.colors.border }]}>
                <Text style={[s.podiumRankText, { color: isFirst ? currentTierObj.color : theme.colors.textMuted }]}>{isFirst ? '1' : isSecond ? '2' : '3'}</Text>
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
          
          <TouchableOpacity 
            style={s.leagueIndicator}
            onPress={() => setShowLeagueModal(true)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="shield-half" size={16} color={currentTierObj.color} />
              <Text style={[s.leagueText, { color: currentTierObj.color }]}>{currentLeague} LEAGUE</Text>
              <Ionicons name="chevron-forward" size={12} color={theme.colors.textMuted} />
            </View>
            <View style={s.timerContainer}>
              <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
              <Text style={s.timerText}>ENDS IN 3D 14H</Text>
            </View>
          </TouchableOpacity>
        </View>

        {isLoading && users.length === 0 ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={users.slice(3)}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
            ListHeaderComponent={renderTopThree}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchGlobalLeaderboard} tintColor={theme.colors.accent} />}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>

      <Modal visible={showLeagueModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={s.modalTitle}>Leagues</Text>
              <TouchableOpacity onPress={() => setShowLeagueModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 24 }}>
              {tiers.map((tier, idx) => {
                const isCurrent = tier.name === currentLeague;
                return (
                  <View key={tier.name} style={[s.tierRow, isCurrent && s.tierRowActive, { borderColor: isCurrent ? tier.color : theme.colors.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={s.tierRank}>{idx + 1}</Text>
                      <View style={[s.tierIconBg, { backgroundColor: `${tier.color}15`, borderColor: tier.color }]}>
                        <Ionicons name="shield-half" size={18} color={tier.color} />
                      </View>
                      <Text style={[s.tierName, { color: isCurrent ? tier.color : theme.colors.text }]}>{tier.name}</Text>
                    </View>
                    {isCurrent && (
                      <View style={{ backgroundColor: tier.color, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>YOU</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  c: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: 16, paddingTop: 12, marginBottom: 12 },
  pageTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5 },
  leagueIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  leagueText: { fontSize: 13, fontWeight: '800' as const, letterSpacing: 1.5 },
  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerText: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.5 },
  topThreeContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 16, gap: 8, height: 300, paddingTop: 40 },
  podiumCol: { alignItems: 'center', width: '30%' },
  podiumEmpty: { width: '30%' },
  podiumAvatar: { marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  podiumCurrentUserAvatar: { padding: 2, borderWidth: 2, borderColor: theme.colors.accent, borderRadius: 100 },
  podiumName: { color: theme.colors.text, fontSize: 12, fontWeight: '700' as const, marginBottom: 2, textAlign: 'center' },
  podiumScore: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '600' as const, textAlign: 'center', marginBottom: 8 },
  podiumBase: { width: '100%', borderTopLeftRadius: theme.borderRadius.md, borderTopRightRadius: theme.borderRadius.md, alignItems: 'center', paddingTop: 12, borderWidth: 1, borderBottomWidth: 0 },
  podiumRankText: { fontSize: 20, fontWeight: '900' as const },
  zoneHeader: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: theme.borderRadius.sm, marginBottom: 8, marginTop: 12, alignSelf: 'flex-start' as const },
  promotionZone: { backgroundColor: `${theme.colors.success}10` },
  demotionZone: { backgroundColor: `${theme.colors.danger}10` },
  safeZone: { backgroundColor: theme.colors.surface },
  zoneText: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 1 },
  rowCard: { padding: 12, marginBottom: 6, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md },
  currentUserCard: { borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rank: { fontSize: 13, fontWeight: '800' as const, color: theme.colors.textMuted, width: 20 },
  name: { color: theme.colors.text, fontSize: 14, fontWeight: '700' as const },
  username: { color: theme.colors.textMuted, fontSize: 11, marginTop: 1 },
  scoreContainer: { alignItems: 'flex-end' },
  score: { color: theme.colors.text, fontSize: 14, fontWeight: '800' as const },
  xpLabel: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '700' as const, marginTop: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '900' as const, letterSpacing: -0.5 },
  tierRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderWidth: 1 },
  tierRowActive: { backgroundColor: `${theme.colors.surface}` },
  tierRank: { color: theme.colors.textMuted, fontSize: 14, fontWeight: '800' as const, width: 20 },
  tierIconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  tierName: { fontSize: 16, fontWeight: '800' as const, letterSpacing: 0.5 }
} as any);