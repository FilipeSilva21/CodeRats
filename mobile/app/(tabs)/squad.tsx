import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, ActivityIndicator, Alert, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { useTheme, useStyles } from '../../src/theme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useSquadStore } from '../../src/features/squad/store/squadStore';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SquadScreen() {
  const { squads, currentSquad, members, isLoading, fetchMySquads, createSquad, joinSquad, fetchSquadDetails, clearCurrentSquad, updateSquad, leaveSquad, deleteSquad } = useSquadStore();
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2, // Low quality to keep base64 small
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setEditImg("data:image/jpeg;base64," + result.assets[0].base64);
    }
  };

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

  const handleLeave = async () => {
    if (!currentSquad) return;
    
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to leave this squad?')) {
        try {
          await leaveSquad(currentSquad.id);
        } catch(e:any) {
          Alert.alert('Error', e.response?.data?.error || e.message || 'Failed to leave squad');
        }
      }
      return;
    }

    Alert.alert('Confirm', 'Are you sure you want to leave this squad?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: async () => {
        try {
          await leaveSquad(currentSquad.id);
        } catch(e:any) {
          Alert.alert('Error', e.response?.data?.error || e.message || 'Failed to leave squad');
        }
      }}
    ])
  }

  const handleDelete = async () => {
    if (!currentSquad) return;

    if (Platform.OS === 'web') {
      if (window.confirm('Are you absolutely sure you want to permanently delete this squad? This action cannot be undone.')) {
        try {
          await deleteSquad(currentSquad.id);
          setEditMode(false);
          setActiveTab('my_squads');
          await fetchMySquads();
        } catch(e:any) {
          Alert.alert('Error', e.response?.data?.error || e.message || 'Failed to delete squad');
        }
      }
      return;
    }

    Alert.alert('Delete Squad', 'Are you absolutely sure you want to permanently delete this squad? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteSquad(currentSquad.id);
          setEditMode(false);
          setActiveTab('my_squads');
          await fetchMySquads();
        } catch(e:any) {
          Alert.alert('Error', e.response?.data?.error || e.message || 'Failed to delete squad');
        }
      }}
    ])
  }

  if (currentSquad) {
    const isOwner = currentSquad.ownerId === user?.id;

    return (
      <View style={s.c}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12, paddingHorizontal: 24, paddingTop: 16 }}>
            <TouchableOpacity onPress={() => { setEditMode(false); clearCurrentSquad(); }} style={s.backBtn}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={s.title} numberOfLines={1}>{editMode ? 'Edit Squad' : currentSquad.name}</Text>
          </View>

          {editMode ? (
            <ScrollView contentContainerStyle={{ gap: 16, paddingHorizontal: 24 }}>
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
              <Button title="Delete Squad" onPress={handleDelete} variant="secondary" style={{ marginTop: 12, borderColor: theme.colors.danger }} icon={<Ionicons name="trash-outline" size={16} color={theme.colors.danger} />} />
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
              <Card style={s.squadDetailCard}>
                <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                  {currentSquad.imageUrl ? (
                    <Image source={{ uri: currentSquad.imageUrl }} style={{ width: 80, height: 80, borderRadius: theme.borderRadius.md }} />
                  ) : (
                    <View style={{ width: 80, height: 80, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border }}>
                      <Ionicons name="people" size={32} color={theme.colors.textMuted} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Invite Code</Text>
                    <View style={s.codeContainer}>
                      <Text style={s.squadCode}>{currentSquad.inviteCode}</Text>
                      <Ionicons name="copy-outline" size={14} color={theme.colors.accent} />
                    </View>
                  </View>
                </View>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 15, lineHeight: 24 }}>
                  {currentSquad.description || 'No description provided for this squad.'}
                </Text>
              </Card>

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
                {isOwner ? (
                  <Button title="Edit Squad" onPress={() => {
                    setEditName(currentSquad.name);
                    setEditDesc(currentSquad.description || '');
                    setEditImg(currentSquad.imageUrl || '');
                    setEditMode(true);
                  }} variant="secondary" style={{ flex: 1 }} icon={<Ionicons name="pencil" size={16} color={theme.colors.text} />} />
                ) : (
                  <Button title="Leave Squad" onPress={handleLeave} variant="secondary" style={{ flex: 1 }} icon={<Ionicons name="exit" size={16} color={theme.colors.danger} />} />
                )}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 }}>
                  Members
                </Text>
                <Text style={{ color: theme.colors.accent, fontSize: 14, fontWeight: '700' }}>
                  {currentSquad.memberCount} / {currentSquad.maxMembers}
                </Text>
              </View>
              
              <View style={s.membersList}>
                {members.map((item, index) => (
                  <View key={item.userId} style={[s.memberRow, index === members.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      {item.avatarUrl ? <Image source={{ uri: item.avatarUrl }} style={{ width: 44, height: 44, borderRadius: 22 }} /> : <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border }} />}
                      <View>
                        <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 16 }}>{item.displayName}</Text>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 2 }}>
                          {item.role === 'owner' ? 'Owner' : 'Member'}
                        </Text>
                      </View>
                    </View>
                    <View style={s.scorePill}>
                      <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 15 }}>{item.totalScore.toLocaleString()}</Text>
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
          <ScrollView style={{ marginTop: 24 }} contentContainerStyle={{ gap: 24, paddingHorizontal: 24 }}>
            <Card style={{ padding: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <Ionicons name="add-circle-outline" size={24} color={theme.colors.accent} />
                <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>Create Squad</Text>
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

            <Card style={{ padding: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <Ionicons name="enter-outline" size={24} color={theme.colors.accent} />
                <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>Join Squad</Text>
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
              <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 40 }} />
            ) : squads.length === 0 ? (
              <View style={{ alignItems: 'center', gap: 16, paddingVertical: 80, paddingHorizontal: 40 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}>
                  <Ionicons name="people-outline" size={32} color={theme.colors.textMuted} />
                </View>
                <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' }}>No squads yet</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
                  You are not competing in any squads. Create a new one or join with a code!
                </Text>
                <Button title="Find a Squad" onPress={() => setActiveTab('add_squad')} variant="primary" style={{ marginTop: 8 }} />
              </View>
            ) : (
              <FlatList
                data={squads}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 12, paddingBottom: 40, paddingTop: 24, paddingHorizontal: 24 }}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectSquad(item.id)} activeOpacity={0.7}>
                    <Card style={s.squadCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={{ width: 48, height: 48, borderRadius: theme.borderRadius.md }} />
                        ) : (
                          <View style={{ width: 48, height: 48, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border }}>
                            <Ionicons name="people" size={20} color={theme.colors.textMuted} />
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={s.squadName}>{item.name}</Text>
                          <Text style={s.squadCodeSmall}>{item.inviteCode}</Text>
                        </View>
                      </View>
                      <View style={s.memberBadge}>
                        <Ionicons name="person" size={12} color={theme.colors.textMuted} />
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
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  pageHeader: { color: theme.colors.text, fontSize: 24, fontWeight: '800' as const, marginBottom: 8, letterSpacing: -0.5, paddingHorizontal: 16, paddingTop: 12 },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800' as const, flex: 1, letterSpacing: -0.5 },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingHorizontal: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: theme.colors.accent },
  tabText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' as const },
  activeTabText: { color: theme.colors.accent, fontWeight: '700' as const },
  inputLabel: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '700' as const, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  input: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, fontSize: 14 },
  squadDetailCard: { padding: 16, marginBottom: 16 },
  codeContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, backgroundColor: theme.colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.borderRadius.sm, alignSelf: 'flex-start' as const, borderWidth: 1, borderColor: theme.colors.border },
  squadCode: { color: theme.colors.accent, fontSize: 14, fontWeight: '800' as const, fontFamily: 'monospace', letterSpacing: 1.5 },
  squadCard: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  squadName: { color: theme.colors.text, fontSize: 15, fontWeight: '700' as const, marginBottom: 2 },
  squadCodeSmall: { color: theme.colors.textMuted, fontSize: 11, fontFamily: 'monospace', fontWeight: '600' as const },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: theme.colors.border },
  memberCount: { color: theme.colors.text, fontWeight: '700' as const, fontSize: 12 },
  membersList: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' as const },
  memberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  scorePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  dividerText: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '800' as const }
});