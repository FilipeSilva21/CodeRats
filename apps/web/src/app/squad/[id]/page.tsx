"use client";

import { useEffect, useState, useRef } from 'react';
import { useSquadStore, useAuthStore, sharedConfig } from '@coderats/shared';
import { useParams, useRouter } from 'next/navigation';

const getImageUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('/')) {
    const base = sharedConfig?.backendUrl || 'http://localhost:8080';
    return `${base}${url}`;
  }
  return url;
};

export default function SquadDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { fetchSquadDetails, currentSquad, members, isLoading, error, leaveSquad, updateSquad, deleteSquad } = useSquadStore();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImgBlob, setEditImgBlob] = useState<File | null>(null);
  const [editImgPreview, setEditImgPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) fetchSquadDetails(id);
  }, [id, fetchSquadDetails]);

  const handleCopyInvite = () => {
    if (currentSquad?.inviteCode) {
      navigator.clipboard.writeText(currentSquad.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveSquad = async () => {
    if (window.confirm(`Are you sure you want to leave ${currentSquad?.name}?`)) {
      setIsLeaving(true);
      try {
        await leaveSquad(id);
        router.push('/squad');
      } catch (e: any) {
        alert(e.message || "Failed to leave squad");
        setIsLeaving(false);
      }
    }
  };

  const handleDeleteSquad = async () => {
    if (window.confirm(`Are you sure you want to DELETE ${currentSquad?.name}? This cannot be undone.`)) {
      setIsLeaving(true);
      try {
        await deleteSquad(id);
        router.push('/squad');
      } catch (e: any) {
        alert(e.message || "Failed to delete squad");
        setIsLeaving(false);
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateSquad(id, editName, editDesc, editImgBlob || editImgPreview);
      setEditMode(false);
    } catch (e: any) {
      alert("Failed to update squad: " + e.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImgBlob(file);
      setEditImgPreview(URL.createObjectURL(file));
    }
  };

  if (isLoading && !currentSquad) {
    return (
      <main className="flex flex-col flex-1 p-8 items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-cr-text-muted font-bold">Loading squad details...</p>
      </main>
    );
  }

  if (error || !currentSquad) {
    return (
      <main className="flex flex-col flex-1 p-8 items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl max-w-lg w-full text-center">
          <span className="text-4xl">🐁</span>
          <h2 className="text-xl font-bold text-red-500 mt-4">Failed to load squad</h2>
          <p className="text-red-400/80 mt-2">{error || "Squad not found."}</p>
          <button onClick={() => router.push('/squad')} className="mt-6 bg-cr-bg border border-cr-border px-6 py-2 rounded-xl text-cr-text-bold hover:bg-cr-surface transition-colors">Go Back</button>
        </div>
      </main>
    );
  }

  const isOwner = user?.id === currentSquad.ownerId;
  const totalScore = members.reduce((acc, m) => acc + m.totalScore, 0);

  if (editMode) {
    return (
      <main className="flex flex-col flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setEditMode(false)} className="w-10 h-10 flex items-center justify-center bg-cr-surface border border-cr-border rounded-full text-cr-text hover:bg-cr-bg transition-colors">←</button>
            <h1 className="text-2xl font-black text-cr-text-bold">Edit Squad</h1>
          </div>
          
          <div className="bg-cr-surface border border-cr-border rounded-2xl p-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-2xl border-4 border-cr-border bg-cr-bg flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {editImgPreview ? (
                  <img src={editImgPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-cr-text-subtle">📷</span>
                )}
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-[#58a6ff]">Change Squad Image</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-cr-text-muted mb-2">Squad Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-cr-bg border border-cr-border rounded-xl px-4 py-3 text-cr-text font-bold focus:outline-none focus:border-[#58a6ff]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-cr-text-muted mb-2">Description</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={4} className="w-full bg-cr-bg border border-cr-border rounded-xl px-4 py-3 text-cr-text font-medium focus:outline-none focus:border-[#58a6ff] resize-none" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setEditMode(false)} className="flex-1 py-3 px-4 bg-cr-bg border border-cr-border rounded-xl font-bold hover:bg-cr-surface transition-colors">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 py-3 px-4 bg-[#58a6ff] text-cr-text-inverse rounded-xl font-bold hover:bg-[#3182ce] transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/squad')} className="w-10 h-10 flex items-center justify-center bg-cr-surface border border-cr-border rounded-full text-cr-text hover:bg-cr-bg transition-colors">←</button>
            <h1 className="text-cr-text-muted font-bold uppercase tracking-widest text-sm">Squad Details</h1>
          </div>
          {isOwner && (
            <div className="flex items-center gap-3">
              <button onClick={() => {
                setEditName(currentSquad.name);
                setEditDesc(currentSquad.description || '');
                setEditImgPreview(currentSquad.imageUrl || '');
                setEditImgBlob(null);
                setEditMode(true);
              }} className="px-4 py-2 bg-cr-surface border border-cr-border rounded-xl font-bold hover:bg-cr-bg transition-colors text-sm">Edit Squad</button>
            </div>
          )}
        </div>

        {/* Squad Header Card */}
        <div className="bg-cr-surface border border-cr-border rounded-2xl overflow-hidden shadow-xl">
          <div className="h-32 bg-gradient-to-r from-indigo-900/50 to-cr-surface relative">
            <div className="absolute -bottom-10 left-8">
              {currentSquad.imageUrl ? (
                <img src={getImageUrl(currentSquad.imageUrl)} alt={currentSquad.name} className="w-24 h-24 rounded-2xl border-4 border-cr-surface bg-cr-bg object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-cr-surface bg-cr-bg flex items-center justify-center text-4xl font-black text-cr-text-subtle shadow-lg">{currentSquad.name.charAt(0)}</div>
              )}
            </div>

            <div className="absolute top-6 right-6">
              <button onClick={handleCopyInvite} className="flex items-center gap-2 bg-cr-bg/80 backdrop-blur-sm border border-cr-border px-4 py-2 rounded-xl hover:bg-cr-bg transition-colors group">
                <span className="text-xs font-bold text-cr-text-muted uppercase tracking-wider">Invite Code</span>
                <span className="font-mono font-bold text-[#58a6ff]">{currentSquad.inviteCode}</span>
                <span className="flex items-center justify-center w-5 h-5 ml-2 text-cr-text-bold">
                  {copied ? <span className="text-[#58a6ff]">✓</span> : <img src="/copy-svgrepo-com.svg" alt="Copy" className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity dark:invert" />}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black text-cr-text-bold tracking-tight mb-2">{currentSquad.name}</h2>
              <p className="text-cr-text-muted text-lg">{currentSquad.description || "No description provided for this squad."}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-cr-text-muted font-bold text-sm uppercase tracking-wider mb-1">Squad XP</span>
              <span className="text-4xl font-black text-[#58a6ff]">{totalScore.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 mb-4">
          <h3 className="text-2xl font-black text-cr-text-bold">Members ({currentSquad.memberCount}/{currentSquad.maxMembers})</h3>
          <div className="flex gap-3">
            {isOwner ? (
              <button onClick={handleDeleteSquad} disabled={isLeaving} className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                {isLeaving ? 'Deleting...' : 'Delete Squad'}
              </button>
            ) : (
              <button onClick={handleLeaveSquad} disabled={isLeaving} className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                {isLeaving ? 'Leaving...' : 'Leave Squad'}
              </button>
            )}
          </div>
        </div>

        {/* Member List */}
        <div className="bg-cr-surface border border-cr-border rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col divide-y divide-cr-border">
            {members.map((member, index) => (
              <div key={member.userId} className="flex items-center justify-between p-5 hover:bg-cr-bg transition-colors">
                <div className="flex items-center gap-5">
                  <div className={`w-8 font-black text-center ${index === 0 ? 'text-yellow-500 text-xl' : index === 1 ? 'text-gray-400 text-lg' : index === 2 ? 'text-amber-600 text-lg' : 'text-cr-text-subtle'}`}>#{index + 1}</div>
                  {member.avatarUrl ? (
                    <img src={getImageUrl(member.avatarUrl)} alt={member.username} className="w-12 h-12 rounded-full border border-cr-border" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-cr-bg border border-cr-border flex items-center justify-center font-bold text-cr-text-muted text-lg">{member.displayName.charAt(0)}</div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-cr-text-bold text-lg">{member.displayName}</p>
                      {member.userId === currentSquad.ownerId && <span className="text-[10px] font-black bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded uppercase tracking-wider">Owner</span>}
                      {member.userId === user?.id && <span className="text-[10px] font-black bg-[#58a6ff]/20 text-[#58a6ff] px-2 py-0.5 rounded uppercase tracking-wider">You</span>}
                    </div>
                    <p className="text-sm text-cr-text-muted font-medium">@{member.username}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2 bg-cr-bg px-4 py-2 rounded-xl border border-cr-border">
                  <p className="font-black text-cr-text-bold text-xl">{member.totalScore.toLocaleString()}</p>
                  <p className="text-xs font-bold text-cr-text-muted mt-1">XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
