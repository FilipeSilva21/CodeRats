import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme, useStyles } from '../src/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useScoringStore } from '../src/features/scoring/store/scoringStore';

export default function ActivityScreen() {
  const router = useRouter();
  const { recentScores } = useScoringStore();
  const theme = useTheme();
  const s = useStyles(styles);

  return (
    <View style={s.c}>
      <LinearGradient colors={['rgba(99, 102, 241, 0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={s.title}>Commit History</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          {recentScores.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="git-branch-outline" size={48} color={theme.colors.textMuted} />
              <Text style={s.emptyText}>No commits yet</Text>
            </View>
          ) : (
            recentScores.map((score, idx) => (
              <View key={idx} style={s.activityRow}>
                <View style={s.activityLeft}>
                  <LinearGradient
                    colors={['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.15)']}
                    style={s.activityIconBox}
                  >
                    <Ionicons name="git-commit-outline" size={20} color={theme.colors.primary} />
                  </LinearGradient>
                  <View>
                    <Text style={s.activityTitle}>Commit Pushed</Text>
                    <Text style={s.activitySub}>{new Date(score.scoredAt).toLocaleDateString()} • {score.commitHash?.substring(0, 7)}</Text>
                  </View>
                </View>
                <View style={s.pointsPill}>
                  <Text style={s.activityPoints}>+{score.points}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  c: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 16, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.glassBorder },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5 },
  scroll: { paddingHorizontal: 24, paddingVertical: 16, gap: 12, paddingBottom: 64 },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.glassBorder },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activityTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' as const, marginBottom: 4 },
  activitySub: { color: theme.colors.textMuted, fontSize: 13 },
  pointsPill: { backgroundColor: 'rgba(99, 102, 241, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  activityPoints: { color: theme.colors.primary, fontSize: 15, fontWeight: '800' as const },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, gap: 12 },
  emptyText: { color: theme.colors.textSecondary, fontSize: 18, fontWeight: '600' as const }
});
