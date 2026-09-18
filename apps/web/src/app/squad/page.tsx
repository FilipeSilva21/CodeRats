"use client";

import { useEffect, useState } from "react";
import { useSquadStore, useAuthStore, sharedConfig } from "@coderats/shared";
import Link from "next/link";

const getImageUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('/')) {
    const base = sharedConfig?.backendUrl || 'http://localhost:8080';
    return `${base}${url}`;
  }
  return url;
};

export default function SquadPage() {
  const { squads, isLoading, error, fetchMySquads, joinSquad, createSquad } = useSquadStore();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'my_squads' | 'explore'>('my_squads');
  
  // Create Squad State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Join Squad State
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    fetchMySquads();
  }, []);

  const handleCreateSquad = async () => {
    if (!newSquadName.trim()) return;
    setIsCreating(true);
    try {
      await createSquad(newSquadName);
      setShowCreateModal(false);
      setNewSquadName("");
    } catch (e: any) {
      alert(e.message || "Failed to create squad");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSquad = async () => {
    if (!inviteCode.trim()) return;
    setIsJoining(true);
    setJoinError("");
    try {
      await joinSquad(inviteCode);
      setInviteCode("");
      setActiveTab("my_squads");
    } catch (e: any) {
      setJoinError(e.message || "Failed to join squad. Invalid code?");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <main className="flex flex-col flex-1 p-8 overflow-y-auto relative">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-cr-text-bold tracking-tighter">Squads</h1>
            <p className="mt-2 text-cr-text-muted font-medium">Team up. Code together. Win together.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#58a6ff] hover:bg-[#3182ce] text-cr-text-inverse font-bold py-3 px-6 rounded-xl transition-colors"
          >
            + Create Squad
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cr-border">
          <button 
            onClick={() => setActiveTab('my_squads')}
            className={`pb-4 px-6 font-bold transition-colors ${activeTab === 'my_squads' ? 'text-[#58a6ff] border-b-2 border-[#58a6ff]' : 'text-cr-text-muted hover:text-cr-text'}`}
          >
            My Squads
          </button>
          <button 
            onClick={() => setActiveTab('explore')}
            className={`pb-4 px-6 font-bold transition-colors ${activeTab === 'explore' ? 'text-[#58a6ff] border-b-2 border-[#58a6ff]' : 'text-cr-text-muted hover:text-cr-text'}`}
          >
            Join via Code
          </button>
        </div>

        {/* Content */}
        {activeTab === 'my_squads' && (
          <div className="space-y-6">
            {isLoading && <p className="text-cr-text-muted animate-pulse">Loading your squads...</p>}
            {error && <p className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>}
            
            {!isLoading && squads.length === 0 && !error && (
              <div className="border-2 border-dashed border-cr-border rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-6xl">👥</span>
                <div>
                  <h3 className="text-xl font-bold text-cr-text-bold">You aren't in any squads yet</h3>
                  <p className="text-cr-text-muted mt-2">Create a new squad or join one using an invite code.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {squads.map(squad => (
                <Link href={`/squad/${squad.id}`} key={squad.id} className="bg-cr-surface border border-cr-border rounded-2xl overflow-hidden shadow-lg hover:border-[#58a6ff] transition-colors cursor-pointer group block">
                  <div className="h-24 bg-gradient-to-r from-indigo-900/50 to-cr-surface relative">
                    <div className="absolute -bottom-8 left-6">
                      {squad.imageUrl ? (
                        <img src={getImageUrl(squad.imageUrl)} alt={squad.name} className="w-16 h-16 rounded-xl border-4 border-cr-surface bg-cr-bg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl border-4 border-cr-surface bg-cr-bg flex items-center justify-center text-2xl font-black text-cr-text-subtle">
                          {squad.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-12 pb-6 px-6">
                    <h3 className="text-xl font-bold text-cr-text-bold mb-1 group-hover:text-[#58a6ff] transition-colors">{squad.name}</h3>
                    <p className="text-sm text-cr-text-muted line-clamp-2 h-10">{squad.description || "No description provided."}</p>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-cr-bg px-3 py-1.5 rounded-lg border border-cr-border">
                        <span className="text-sm">🧑‍💻</span>
                        <span className="text-sm font-bold text-cr-text-muted">{squad.memberCount}/{squad.maxMembers}</span>
                      </div>
                      
                      {squad.ownerId === user?.id && (
                        <span className="text-xs font-bold bg-amber-500/20 text-amber-500 px-2 py-1 rounded">OWNER</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="bg-cr-surface border border-cr-border rounded-2xl p-8 max-w-xl shadow-lg">
            <h2 className="text-2xl font-bold text-cr-text-bold mb-2">Have an Invite Code?</h2>
            <p className="text-cr-text-muted mb-6">Enter the code below to join your friends' squad.</p>
            
            {joinError && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg mb-4 text-sm font-bold">{joinError}</p>}

            <div className="flex gap-4">
              <input 
                type="text" 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="e.g. A1B2C3D4" 
                className="flex-1 bg-cr-bg border border-cr-border rounded-xl px-4 py-3 text-cr-text-bold font-mono uppercase focus:outline-none focus:border-[#58a6ff]"
              />
              <button 
                onClick={handleJoinSquad}
                disabled={isJoining || !inviteCode.trim()}
                className="bg-[#58a6ff] hover:bg-[#3182ce] text-cr-text-inverse disabled:opacity-50 font-bold py-3 px-8 rounded-xl transition-colors"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Create Squad Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cr-surface border border-cr-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-cr-text-bold mb-2">Create a Squad</h2>
            <p className="text-cr-text-muted mb-6 text-sm">Form a new squad to compete on the leaderboards.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-cr-text-bold mb-1">Squad Name</label>
                <input 
                  type="text"
                  value={newSquadName}
                  onChange={(e) => setNewSquadName(e.target.value)}
                  placeholder="e.g. Rustacean Rats"
                  className="w-full bg-cr-bg border border-cr-border rounded-xl px-4 py-3 text-cr-text-bold focus:outline-none focus:border-[#58a6ff]"
                  maxLength={30}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-cr-bg border border-cr-border text-cr-text-bold font-bold rounded-xl hover:bg-cr-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateSquad}
                disabled={isCreating || !newSquadName.trim()}
                className="flex-1 py-3 bg-[#58a6ff] hover:bg-[#3182ce] disabled:opacity-50 text-cr-text-inverse font-bold rounded-xl transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
