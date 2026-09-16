"use client";

import { useSettingsStore, useAuthStore } from "@coderats/shared";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  const { commitPrivacy, setCommitPrivacy } = useSettingsStore();
  const { deleteAccount } = useAuthStore();
  
  const [privateProfile, setPrivateProfile] = useState(false);

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? All your scores and squads will be removed. This action cannot be undone.")) {
      try {
        await deleteAccount();
        router.push("/login");
      } catch (e: any) {
        alert(e.message || "Failed to delete account");
      }
    }
  };

  return (
    <main className="flex flex-col flex-1 p-8 overflow-y-auto">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/profile')}
            className="w-10 h-10 flex items-center justify-center bg-cr-surface border border-cr-border rounded-full text-cr-text-bold hover:bg-cr-bg transition-colors"
          >
            ←
          </button>
          <h1 className="text-3xl font-black text-cr-text-bold tracking-tight">Privacy & Security</h1>
        </div>

        <div className="space-y-6">
          
          <section>
            <h2 className="text-sm font-bold text-cr-text-muted uppercase tracking-wider mb-4">Profile Visibility</h2>
            <div className="bg-cr-surface border border-cr-border rounded-2xl overflow-hidden shadow-lg">
              
              <div className="flex items-center justify-between p-5 border-b border-cr-border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                    🔒
                  </div>
                  <div>
                    <p className="font-semibold text-cr-text-bold">Private Profile</p>
                    <p className="text-xs text-cr-text-subtle">Only squad members can see you</p>
                  </div>
                </div>
                <Toggle checked={privateProfile} onChange={setPrivateProfile} />
              </div>

              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                    💻
                  </div>
                  <div>
                    <p className="font-semibold text-cr-text-bold">Commit Privacy</p>
                    <p className="text-xs text-cr-text-subtle">Hide repository name and commit hash</p>
                  </div>
                </div>
                <Toggle checked={commitPrivacy} onChange={setCommitPrivacy} />
              </div>

            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-cr-text-muted uppercase tracking-wider mb-4">Security</h2>
            <div className="bg-cr-surface border border-cr-border rounded-2xl overflow-hidden shadow-lg">
              
              <button 
                onClick={handleDeleteAccount}
                className="w-full flex items-center p-5 hover:bg-red-500/10 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
                    🗑️
                  </div>
                  <p className="font-semibold text-red-500">Delete Account</p>
                </div>
              </button>

            </div>
          </section>

        </div>

      </div>
    </main>
  );
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-700'}`}
    >
      <div 
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} 
      />
    </button>
  );
}
