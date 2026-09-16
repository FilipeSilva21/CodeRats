import { create } from 'zustand';
import api from '../../../lib/api';
import { storage } from '../../../lib/storage';
import { BACKEND_URL } from '../../../config';

export interface Squad { id: string; name: string; description: string | null; imageUrl: string | null; inviteCode: string; ownerId: string; memberCount: number; maxMembers: number; }
export interface SquadMember { userId: string; username: string; displayName: string; avatarUrl: string | null; totalScore: number; role: string; }
interface SquadState { squads: Squad[]; currentSquad: Squad | null; members: SquadMember[]; isLoading: boolean; error: string | null; fetchMySquads: () => Promise<void>; fetchSquadDetails: (id: string) => Promise<void>; createSquad: (name: string) => Promise<Squad>; joinSquad: (code: string) => Promise<void>; updateSquad: (id: string, name: string, desc: string, img: string) => Promise<void>; leaveSquad: (id: string) => Promise<void>; deleteSquad: (id: string) => Promise<void>; clearCurrentSquad: () => void; updateMembers: (m: SquadMember[]) => void; }

const sortMembersByScore = (members: SquadMember[]) =>
  [...members].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return a.displayName.localeCompare(b.displayName);
  });

export const useSquadStore = create<SquadState>((set, get) => ({
  squads: [], currentSquad: null, members: [], isLoading: false, error: null,
  fetchMySquads: async () => { set({ isLoading: true }); try { const { data } = await api.get('/squads/me'); set({ squads: data, isLoading: false }); } catch (e: any) { set({ error: e.message, isLoading: false }); } },
  fetchSquadDetails: async (id) => { set({ isLoading: true }); try { const { data } = await api.get(`/squads/${id}`); set({ currentSquad: data.squad, members: sortMembersByScore(data.members), isLoading: false }); } catch (e: any) { set({ error: e.message, isLoading: false }); } },
  createSquad: async (name) => { const { data } = await api.post('/squads', { name }); set((s) => ({ squads: [...s.squads, data] })); return data; },
  joinSquad: async (code) => { const { data } = await api.post('/squads/join', { inviteCode: code }); set((s) => ({ squads: [...s.squads, data.squad], currentSquad: data.squad, members: sortMembersByScore(data.members) })); },
  updateSquad: async (id, name, desc, imgUri) => {
    const formData = new FormData();
    formData.append('name', name);
    if (desc) formData.append('description', desc);
    
    if (imgUri && (imgUri.startsWith('file://') || imgUri.startsWith('data:') || imgUri.startsWith('blob:'))) {
      const filename = imgUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      formData.append('image', { uri: imgUri, name: filename, type } as any);
    }

    const token = await storage.getItemAsync('accessToken');
    const response = await fetch(`${BACKEND_URL}/api/squads/${id}/update`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to update squad');
    }

    const data = await response.json();
    set((s) => ({ currentSquad: data, squads: s.squads.map(sq => sq.id === id ? data : sq) })); 
  },
  leaveSquad: async (id) => { await api.post(`/squads/${id}/leave`); set((s) => ({ squads: s.squads.filter(sq => sq.id !== id), currentSquad: null, members: [] })); },
  deleteSquad: async (id) => { await api.delete(`/squads/${id}`); set((s) => ({ squads: s.squads.filter(sq => sq.id !== id), currentSquad: null, members: [] })); },
  clearCurrentSquad: () => set({ currentSquad: null, members: [] }),
  updateMembers: (members) => set({ members: sortMembersByScore(members) }),
}));
