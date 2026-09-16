"use client";

import { useEffect } from "react";
import { useLeaderboardStore } from "@coderats/shared";

export default function LeaderboardPage() {
  const { users, isLoading, error, fetchGlobalLeaderboard } = useLeaderboardStore();

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, []);

  return (
    <main className="flex flex-col flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-cr-text-bold tracking-tighter">Global Leaderboard</h1>
          <p className="mt-2 text-cr-text-muted font-medium">See how you stack up against the best developers.</p>
        </div>

        <div className="w-full bg-cr-surface border border-cr-border rounded-2xl p-6 shadow-xl">
          {isLoading && <p className="text-cr-text-muted text-center py-8 font-medium animate-pulse">Loading ranking...</p>}
          {error && <p className="text-red-400 text-center py-8">{error}</p>}
          
          {!isLoading && users.length === 0 && !error && (
            <p className="text-cr-text-muted text-center py-8">No users ranked yet.</p>
          )}

          <div className="flex flex-col gap-3">
            {users.map((user, index) => (
              <div key={user.userId} className="flex items-center justify-between p-4 rounded-xl bg-cr-bg border border-cr-border hover:border-[#58a6ff] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center font-black rounded-lg ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                    index === 1 ? 'bg-gray-400/20 text-cr-text-muted' :
                    index === 2 ? 'bg-amber-700/20 text-amber-600' :
                    'bg-cr-surface text-cr-text-subtle'
                  }`}>
                    #{index + 1}
                  </div>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full border border-cr-border" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-cr-surface border border-cr-border" />
                  )}
                  <div>
                    <p className="font-bold text-cr-text-bold text-lg leading-tight">{user.displayName}</p>
                    <p className="text-sm text-cr-text-muted font-medium">@{user.username}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2 bg-cr-surface px-4 py-2 rounded-lg border border-cr-border">
                  <p className="font-black text-[#58a6ff] text-xl">{user.totalScore.toLocaleString()}</p>
                  <p className="text-xs font-bold text-cr-text-subtle mt-1">XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
