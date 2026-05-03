import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, ActivityIndicator, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useTheme, useStyles } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useSquadStore } from '../../src/features/squad/store/squadStore';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SquadScreen() {
  const { squads, currentSquad, members, isLoading, fetchMySquads, createSquad, joinSquad, fetchSquadDetails, clearCurrentSquad, updateSquad, leaveSquad } = useSquadStore();
  const { user } = useAuthStore();
  const theme = useTheme();
  const s = useStyles(styles);
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
      <View style={s.c}>
        <LinearGradient colors={['rgba(99, 102, 241, 0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12, paddingHorizontal: 24, paddingTop: 16 }}>
            <TouchableOpacity onPress={clearCurrentSquad} style={s.backBtn}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={s.title} numberOfLines={1}>{editMode ? 'Edit Squad' : currentSquad.name}</Text>
          </View>

          {editMode ? (
            <ScrollView contentContainerStyle={{ gap: 12, paddingHorizontal: 24 }}>
              <View>
                <Text style={s.inputLabel}>Squad Name</Text>
                <TextInput style={s.input} value={editName} onChangeText={setEditName} placeholder="Name" placeholderTextColor={theme.colors.textMuted} />
              </View>
              <View>
                <Text style={s.inputLabel}>Description</Text>
                <TextInput style={[s.input, { height: 100, textAlignVertical: 'top' }]} value={editDesc} onChangeText={setEditDesc} placeholder="Description" placeholderTextColor={theme.colors.textMuted} multiline />
              </View>
              <View>
                <Text style={s.inputLabel}>Image URL</Text>
                <TextInput style={s.input} value={editImg} onChangeText={setEditImg} placeholder="https://..." placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" />
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <Button title="Cancel" onPress={() => setEditMode(false)} variant="secondary" style={{ flex: 1 }} />
                <Button title="Save Changes" onPress={handleSaveEdit} variant="primary" style={{ flex: 1 }} />
              </View>
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}>
              <Card variant="glass" style={s.squadDetailCard}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                  {currentSquad.imageUrl ? (
                    <Image source={{ uri: currentSquad.imageUrl }} style={{ width: 72, height: 72, borderRadius: 16 }} />
                  ) : (
                    <LinearGradient colors={['rgba(99,102,241,0.2)', 'rgba(139,92,246,0.2)']} style={{ width: 72, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.glassBorder }}>
                      <Ionicons name="people" size={32} color={theme.colors.primary} />
                    </LinearGradient>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Invite Code</Text>
                    <View style={s.codeContainer}>
                      <Text style={s.squadCode}>{currentSquad.inviteCode}</Text>
                      <Ionicons name="copy-outline" size={16} color={theme.colors.primary} />
                    </View>
                  </View>
                </View>
                <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 24 }}>
                  {currentSquad.description || 'No description provided for this squad.'}
                </Text>
              </Card>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                {isOwner ? (
                  <Button title="Edit Squad" onPress={() => {
                    setEditName(currentSquad.name);
                    setEditDesc(currentSquad.description || '');
                    setEditImg(currentSquad.imageUrl || '');
                    setEditMode(true);
                  }} variant="secondary" style={{ flex: 1 }} icon={<Ionicons name="pencil" size={16} color={theme.colors.text} />} />
                ) : (
                  <Button title="Leave Squad" onPress={handleLeave} variant="secondary" style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }} icon={<Ionicons name="exit" size={16} color={theme.colors.danger} />} />
                )}
              </View>

              <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800', marginBottom: 16, letterSpacing: -0.5 }}>
                Members ({currentSquad.memberCount}/{currentSquad.maxMembers})
              </Text>
              
              <View style={s.membersList}>
                {members.map((item, index) => (
                  <View key={item.userId} style={[s.memberRow, index === members.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      {item.avatarUrl ? <Image source={{ uri: item.avatarUrl }} style={{ width: 44, height: 44, borderRadius: 22 }} /> : <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface }} />}
                      <View>
                        <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 16 }}>{item.displayName}</Text>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 2, textTransform: 'capitalize' }}>
                          {item.role} {item.userId === currentSquad.ownerId && '• Owner'}
                        </Text>
                      </View>
                    </View>
                    <View style={s.scorePill}>
                      <Text style={{ color: theme.colors.accent, fontWeight: '800', fontSize: 15 }}>{item.totalScore.toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={s.c}>
      <LinearGradient colors={['rgba(99, 102, 241, 0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
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
          <ScrollView style={{ marginTop: 24 }} contentContainerStyle={{ gap: 32, paddingHorizontal: 24 }}>
            <Card variant="glass" style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <View style={[s.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Ionicons name="add" size={24} color={theme.colors.primary} />
                </View>
                <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 }}>Create Squad</Text>
              </View>
              <TextInput 
                style={s.input} 
                placeholder="Squad Name" 
                placeholderTextColor={theme.colors.textMuted}
                value={newSquadName}
                onChangeText={setNewSquadName}
              />
              <Button title="Create Squad" onPress={handleCreate} loading={isCreating} variant="primary" size="lg" style={{ marginTop: 16 }} />
            </Card>

            <View style={s.dividerContainer}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>OR</Text>
              <View style={s.dividerLine} />
            </View>

            <Card variant="glass" style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <View style={[s.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                  <Ionicons name="enter-outline" size={24} color={theme.colors.accent} />
                </View>
                <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 }}>Join Squad</Text>
              </View>
              <TextInput 
                style={s.input} 
                placeholder="6-Character Invite Code" 
                placeholderTextColor={theme.colors.textMuted}
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
                maxLength={6}
              />
              <Button title="Join Squad" onPress={handleJoin} loading={isJoining} variant="secondary" size="lg" style={{ marginTop: 16 }} />
            </Card>
          </ScrollView>
        ) : (
          <>
            {isLoading && squads.length === 0 ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
            ) : squads.length === 0 ? (
              <View style={{ alignItems: 'center', gap: 12, paddingVertical: 64, paddingHorizontal: 24 }}>
                <LinearGradient colors={['rgba(99,102,241,0.2)', 'rgba(139,92,246,0.2)']} style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="people-outline" size={40} color={theme.colors.primary} />
                </LinearGradient>
                <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '800' }}>No squads yet</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 24 }}>
                  You are not competing in any squads. Create a new one or join with a code!
                </Text>
                <Button title="Find a Squad" onPress={() => setActiveTab('add_squad')} variant="primary" size="md" style={{ marginTop: 16, paddingHorizontal: 32 }} />
              </View>
            ) : (
              <FlatList
                data={squads}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 12, paddingBottom: 60, paddingTop: 24, paddingHorizontal: 24 }}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectSquad(item.id)} activeOpacity={0.7}>
                    <Card variant="glass" style={s.squadCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={{ width: 56, height: 56, borderRadius: 12 }} />
                        ) : (
                          <LinearGradient colors={['rgba(99,102,241,0.15)', 'rgba(139,92,246,0.15)']} style={{ width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.glassBorder }}>
                            <Ionicons name="people" size={24} color={theme.colors.primary} />
                          </LinearGradient>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={s.squadName}>{item.name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                            <View style={s.codeTag}>
                              <Text style={s.squadCodeSmall}>{item.inviteCode}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      <View style={s.memberBadge}>
                        <Ionicons name="people" size={14} color={theme.colors.primary} />
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
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  c: { flex: 1, backgroundColor: theme.colors.background },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.glassBorder },
  pageHeader: { color: theme.colors.text, fontSize: 36, fontWeight: '900' as const, marginBottom: 16, letterSpacing: -1, paddingHorizontal: 24, paddingTop: 16 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '900' as const, flex: 1, letterSpacing: -0.5 },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.glassBorder, paddingHorizontal: 24 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
  tabText: { color: theme.colors.textMuted, fontSize: 16, fontWeight: '600' as const },
  activeTabText: { color: theme.colors.primary, fontWeight: '800' as const },
  inputLabel: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '700' as const, marginBottom: 8 },
  input: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.glassBorder, fontSize: 16 },
  squadDetailCard: { paddingHorizontal: 24, paddingVertical: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.glassBorder, borderRadius: theme.borderRadius.xl },
  codeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, backgroundColor: 'rgba(99,102,241,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' as const },
  squadCode: { color: theme.colors.primary, fontSize: 16, fontWeight: '800' as const, fontFamily: 'monospace', letterSpacing: 2 },
  squadCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: theme.colors.glassBorder },
  squadName: { color: theme.colors.text, fontSize: 18, fontWeight: '800' as const, letterSpacing: -0.5 },
  codeTag: { backgroundColor: theme.colors.surface, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.glassBorder },
  squadCodeSmall: { color: theme.colors.textMuted, fontSize: 12, fontFamily: 'monospace', fontWeight: '700' as const },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  memberCount: { color: theme.colors.primary, fontWeight: '800' as const, fontSize: 14 },
  membersList: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: theme.colors.glassBorder, overflow: 'hidden' as const },
  memberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.glassBorder },
  scorePill: { backgroundColor: 'rgba(139, 92, 246, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.glassBorder },
  dividerText: { color: theme.colors.textMuted, fontSize: 14, fontWeight: '700' as const }
});