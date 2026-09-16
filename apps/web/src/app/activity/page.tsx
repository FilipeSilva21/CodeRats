"use client";

import { useScoringStore, useSettingsStore } from "@coderats/shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ActivityPage() {
  const router = useRouter();
  const { recentScores, fetchScoreSummary, isLoading } = useScoringStore();
  const { commitPrivacy } = useSettingsStore();

  useEffect(() => {
    fetchScoreSummary();
  }, []);

  return (
    <main className="flex flex-col flex-1 p-8 overflow-y-auto">
      <div className="max-w-3xl w-full mx-auto space-y-8">
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="w-10 h-10 flex items-center justify-center bg-cr-surface border border-cr-border rounded-full text-cr-text-bold hover:bg-cr-bg transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-black text-cr-text-bold tracking-tight">Activity History</h1>
            <p className="text-sm text-cr-text-muted mt-1 font-medium">All your recent XP gains</p>
          </div>
        </div>

        {isLoading && recentScores.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : recentScores.length === 0 ? (
          <div className="border-2 border-dashed border-cr-border rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4">
            <span className="text-5xl text-cr-text-subtle">⌨️</span>
            <div>
              <p className="text-cr-text-muted font-bold">No activity yet.</p>
              <p className="text-sm text-cr-text-subtle">Push some code to earn XP!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 relative">
            
            {/* Simple Timeline line */}
            <div className="absolute left-8 top-4 bottom-4 w-px bg-[#30363d] -z-10"></div>

            {recentScores.map((score, idx) => (
              <div key={idx} className="flex items-center gap-6">
                
                <div className="w-16 flex flex-col items-end text-xs text-cr-text-subtle font-bold">
                  <span>{new Date(score.scoredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  <span>{new Date(score.scoredAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="w-3 h-3 bg-[#58a6ff] rounded-full shadow-[0_0_10px_rgba(88,166,255,0.5)]"></div>

                <div className="flex-1 flex justify-between items-center bg-cr-surface border border-cr-border p-5 rounded-2xl shadow-lg hover:border-[#58a6ff] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cr-bg border border-cr-border rounded-xl flex items-center justify-center text-cr-text-muted">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><line x1="3" y1="12" x2="9" y2="12"></line><line x1="15" y1="12" x2="21" y2="12"></line></svg>
                    </div>
                    <div>
                      <h4 className="text-cr-text-bold font-bold text-lg">
                        Commit Pushed
                      </h4>
                      <p className="text-cr-text-muted text-sm font-medium mt-1">
                        {!commitPrivacy && score.repositoryName 
                          ? score.repositoryName.split('/').pop() 
                          : 'Private Repository'}
                        {!commitPrivacy && score.commitHash 
                          ? ` • ${score.commitHash.substring(0, 7)}` 
                          : ''}
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
                    <span className="text-green-500 font-black text-lg">+{score.points}</span>
                    <span className="text-green-500/60 text-xs ml-1 font-bold">XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
