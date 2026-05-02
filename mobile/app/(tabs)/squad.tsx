import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, ActivityIndicator, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import { theme } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useSquadStore, Squad } from '../../src/features/squad/store/squadStore';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function SquadScreen() {
  const { squads, currentSquad, members, isLoading, fetchMySquads, createSquad, joinSquad, fetchSquadDetails, clearCurrentSquad, updateSquad, leaveSquad } = useSquadStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'my_squads' | 'add_squad'>('my_squads');
  
  const [newSquadName, setNewSquadName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImg, setEditImg] = useState('');

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
      setActiveTab('my_squads');
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
      setActiveTab('my_squads');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to join squad');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSelectSquad = (id: string) => {
    fetchSquadDetails(id);
  };

  const handleSaveEdit = async () => {
    if (!currentSquad) return;
    try {
      await updateSquad(currentSquad.id, editName, editDesc, editImg);
      setEditMode(false);
    } catch(e:any) {
      Alert.alert('Error', e.message || 'Failed to update squad');
    }
  }

  const handleLeave = () => {
    if (!currentSquad) return;
    Alert.alert('Confirm', 'Are you sure you want to leave this squad?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: async () => {
        try {
          await leaveSquad(currentSquad.id);
        } catch(e:any) {
          Alert.alert('Error', e.message || 'Failed to leave squad');
        }
      }}
    ])
  }

  if (currentSquad) {
    const isOwner = currentSquad.ownerId === user?.id;

    return (
      <SafeAreaView style={s.c}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }}>
          <TouchableOpacity onPress={clearCurrentSquad}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={s.title} numberOfLines={1}>{editMode ? 'Edit Squad' : currentSquad.name}</Text>
        </View>

        {editMode ? (
          <ScrollView contentContainerStyle={{ gap: 12 }}>
            <Text style={{ color: theme.colors.textSecondary, marginBottom: -4 }}>Squad Name</Text>
            <TextInput style={s.input} value={editName} onChangeText={setEditName} placeholder="Name" placeholderTextColor={theme.colors.textMuted} />
            <Text style={{ color: theme.colors.textSecondary, marginTop: 4, marginBottom: -4 }}>Description</Text>
            <TextInput style={[s.input, { height: 80 }]} value={editDesc} onChangeText={setEditDesc} placeholder="Description" placeholderTextColor={theme.colors.textMuted} multiline />
            <Text style={{ color: theme.colors.textSecondary, marginTop: 4, marginBottom: -4 }}>Image URL</Text>
            <TextInput style={s.input} value={editImg} onChangeText={setEditImg} placeholder="https://..." placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Button title="Cancel" onPress={() => setEditMode(false)} variant="ghost" style={{ flex: 1 }} />
              <Button title="Save Changes" onPress={handleSaveEdit} variant="primary" style={{ flex: 1 }} />
            </View>
          </ScrollView>
        ) : (
          <>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              {currentSquad.imageUrl ? (
                <Image source={{ uri: currentSquad.imageUrl }} style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 12, borderWidth: 2, borderColor: theme.colors.primary }} />
              ) : (
                <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: theme.colors.glassBorder }}>
                  <Text style={{ fontSize: 36 }}>👥</Text>
                </View>
              )}
              <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 12, paddingHorizontal: 16, lineHeight: 20 }}>
                {currentSquad.description || 'No description provided.'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.glass, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                <Ionicons name="key" size={14} color={theme.colors.accent} />
                <Text style={s.squadCode}>{currentSquad.inviteCode}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              {isOwner ? (
                <Button title="Edit Details" onPress={() => {
                  setEditName(currentSquad.name);
                  setEditDesc(currentSquad.description || '');
                  setEditImg(currentSquad.imageUrl || '');
                  setEditMode(true);
                }} variant="secondary" style={{ flex: 1 }} icon={<Ionicons name="pencil" size={16} color="white" />} />
              ) : (
                <Button title="Leave Squad" onPress={handleLeave} variant="danger" style={{ flex: 1 }} icon={<Ionicons name="exit" size={16} color="white" />} />
              )}
            </View>

            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
              Members ({currentSquad.memberCount}/{currentSquad.maxMembers})
            </Text>
            <FlatList
              data={members}
              keyExtractor={m => m.userId}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => (
                <Card variant="glass" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {item.avatarUrl ? <Image source={{ uri: item.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} /> : <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.border }} />}
                    <View>
                      <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>{item.displayName}</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 2, textTransform: 'capitalize' }}>
                        {item.role} {item.userId === currentSquad.ownerId && '👑'}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: theme.colors.accent, fontWeight: '800', fontSize: 16 }}>{item.totalScore} pts</Text>
                </Card>
              )}
            />
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.c}>
      <Text style={s.pageHeader}>Squads</Text>
      
      <View style={s.tabContainer}>
        <TouchableOpacity style={[s.tab, activeTab === 'my_squads' && s.activeTab]} onPress={() => setActiveTab('my_squads')}>
          <Text style={[s.tabText, activeTab === 'my_squads' && s.activeTabText]}>My Squads</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, activeTab === 'add_squad' && s.activeTab]} onPress={() => setActiveTab('add_squad')}>
          <Text style={[s.tabText, activeTab === 'add_squad' && s.activeTabText]}>Create or Join</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'add_squad' ? (
        <ScrollView style={{ marginTop: 24 }} contentContainerStyle={{ gap: 24 }}>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Create a New Squad</Text>
            </View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>Start your own leaderboard and invite friends.</Text>
            <TextInput 
              style={s.inputLarge} 
              placeholder="Squad Name" 
              placeholderTextColor={theme.colors.textMuted}
              value={newSquadName}
              onChangeText={setNewSquadName}
            />
            <Button title="Create Squad" onPress={handleCreate} loading={isCreating} variant="primary" size="lg" />
          </View>

          <View style={s.divider} />

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="enter" size={20} color={theme.colors.accent} />
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Join an Existing Squad</Text>
            </View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>Got an invite code? Enter it below to join the competition.</Text>
            <TextInput 
              style={s.inputLarge} 
              placeholder="6-Character Invite Code" 
              placeholderTextColor={theme.colors.textMuted}
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              maxLength={6}
            />
            <Button title="Join Squad" onPress={handleJoin} loading={isJoining} variant="secondary" size="lg" />
          </View>
        </ScrollView>
      ) : (
        <>
          {isLoading && squads.length === 0 ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
          ) : squads.length === 0 ? (
            <Card variant="glass" style={{ alignItems: 'center', gap: 12, paddingVertical: 48, marginTop: 24 }}>
              <Text style={{ fontSize: 56 }}>👥</Text>
              <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700' }}>No squads yet</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 15, textAlign: 'center', paddingHorizontal: 16 }}>
                You are not competing in any squads. Create a new one or join with a code!
              </Text>
              <Button title="Find a Squad" onPress={() => setActiveTab('add_squad')} variant="ghost" size="md" style={{ marginTop: 12 }} />
            </Card>
          ) : (
            <FlatList
              data={squads}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 16, paddingBottom: 24, marginTop: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectSquad(item.id)}>
                  <Card variant="glass" style={s.squadCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                      ) : (
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 20 }}>👥</Text>
                        </View>
                      )}
                      <View>
                        <Text style={s.squadName}>{item.name}</Text>
                        <Text style={s.squadCodeSmall}>Code: {item.inviteCode}</Text>
                      </View>
                    </View>
                    <View style={s.memberBadge}>
                      <Ionicons name="people" size={16} color={theme.colors.accent} />
                      <Text style={s.memberCount}>{item.memberCount}/{item.maxMembers}</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: theme.colors.background, padding: 24 },
  pageHeader: { color: theme.colors.text, fontSize: 32, fontWeight: '800', marginBottom: 20, letterSpacing: -0.5 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800', flex: 1 },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: theme.colors.surface, ...theme.shadows.glow },
  tabText: { color: theme.colors.textMuted, fontSize: 14, fontWeight: '600' },
  activeTabText: { color: theme.colors.primary },
  input: { backgroundColor: theme.colors.surface, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, fontSize: 16 },
  inputLarge: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 16, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, fontSize: 16 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },
  squadCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  squadName: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  squadCode: { color: theme.colors.accent, fontSize: 16, fontWeight: '700', fontFamily: 'monospace', letterSpacing: 2 },
  squadCodeSmall: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 4, fontFamily: 'monospace' },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  memberCount: { color: theme.colors.accent, fontWeight: '700', fontSize: 14 }
});