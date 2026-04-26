import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useSquadStore } from '../../src/features/squad/store/squadStore';
import { Ionicons } from '@expo/vector-icons';

export default function SquadScreen() {
  const { squads, isLoading, fetchMySquads, createSquad, joinSquad } = useSquadStore();
  const [newSquadName, setNewSquadName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchMySquads();
  }, []);

  const handleCreate = async () => {
    if (!newSquadName.trim()) return;
    setIsCreating(true);
    try {
      await createSquad(newSquadName);
      setNewSquadName('');
      Alert.alert('Success', 'Squad created successfully!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create squad');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setIsJoining(true);
    try {
      await joinSquad(inviteCode);
      setInviteCode('');
      Alert.alert('Success', 'Joined squad successfully!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to join squad');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <SafeAreaView style={s.c}>
      <Text style={s.title}>My Squads</Text>
      
      <View style={s.actions}>
        <View style={s.inputRow}>
          <TextInput 
            style={s.input} 
            placeholder="New Squad Name" 
            placeholderTextColor={theme.colors.textMuted}
            value={newSquadName}
            onChangeText={setNewSquadName}
          />
          <Button title="Create" onPress={handleCreate} loading={isCreating} variant="primary" size="md" />
        </View>
        <View style={s.inputRow}>
          <TextInput 
            style={s.input} 
            placeholder="Invite Code" 
            placeholderTextColor={theme.colors.textMuted}
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="none"
          />
          <Button title="Join" onPress={handleJoin} loading={isJoining} variant="secondary" size="md" />
        </View>
      </View>

      {isLoading && squads.length === 0 ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : squads.length === 0 ? (
        <Card variant="glass" style={{ alignItems: 'center', gap: 8, paddingVertical: 40, marginTop: 16 }}>
          <Text style={{ fontSize: 48 }}>👥</Text>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>No squads yet</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>Create or join a squad to start competing!</Text>
        </Card>
      ) : (
        <FlatList
          data={squads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 24, marginTop: 16 }}
          renderItem={({ item }) => (
            <Card variant="glass" style={s.squadCard}>
              <View>
                <Text style={s.squadName}>{item.name}</Text>
                <Text style={s.squadCode}>Code: {item.inviteCode}</Text>
              </View>
              <View style={s.memberBadge}>
                <Ionicons name="people" size={16} color={theme.colors.accent} />
                <Text style={s.memberCount}>{item.memberCount}/{item.maxMembers}</Text>
              </View>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: theme.colors.background, padding: 24 },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: '800', marginBottom: 16 },
  actions: { gap: 12 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 16, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border },
  squadCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  squadName: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  squadCode: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4, fontFamily: 'monospace' },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  memberCount: { color: theme.colors.accent, fontWeight: '700', fontSize: 14 }
});
