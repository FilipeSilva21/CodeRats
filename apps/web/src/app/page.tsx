"use client";

import { useEffect } from "react";
import { useAuthStore, useScoringStore, useSettingsStore } from "@coderats/shared";
import Link from "next/link";

export default function Home() {
  const { user } = useAuthStore();
  const { totalScore, todayScore, dailyCap, recentScores, fetchScoreSummary, fetchDailyProgress, isLoading } = useScoringStore();
  const { commitPrivacy } = useSettingsStore();

  const loadData = async () => {
    await Promise.all([fetchScoreSummary(), fetchDailyProgress()]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const progressPercent = Math.min((todayScore / dailyCap) * 100, 100) || 0;

  return (
    <main className="flex flex-col flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cr-text-muted font-bold text-lg">Welcome back,</p>
            <h1 className="text-4xl font-black text-cr-text-bold tracking-tighter">{user?.displayName || 'Developer'}</h1>
          </div>
          <Link href="/profile" className="relative group cursor-pointer block">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-16 h-16 rounded-full bg-gray-800 border-2 border-cr-border group-hover:border-[#58a6ff] transition-colors" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-cr-border group-hover:border-[#58a6ff] transition-colors flex items-center justify-center font-bold text-gray-400 text-xl">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-cr-bg rounded-full"></div>
          </Link>
        </div>

        {/* Main XP Card */}
        <div className="bg-gradient-to-br from-cr-surface to-cr-bg border border-cr-border rounded-2xl overflow-hidden shadow-xl">
          <div className="p-8 flex justify-between items-start">
            <div>
              <p className="text-cr-text-muted font-black tracking-widest text-sm mb-2">TOTAL XP</p>
              <h2 className="text-6xl font-black text-cr-text-bold tracking-tighter">{totalScore.toLocaleString()}</h2>
            </div>
            <div className="flex items-center gap-2 bg-cr-bg border-2 border-cr-border px-4 py-2 rounded-full">
              <span className="text-orange-500">🔥</span>
              <span className="text-orange-500 font-black">{user?.currentStreak || 0} Days</span>
            </div>
          </div>

          <div className="px-8 pb-8 space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-cr-text-muted font-bold text-sm">Daily Goal</span>
              <span className="text-cr-text-bold font-black">{todayScore} <span className="text-cr-text-subtle">/ {dailyCap}</span></span>
            </div>
            <div className="w-full h-3 bg-cr-bg rounded-full overflow-hidden border border-cr-border">
              <div className="h-full bg-[#58a6ff] rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-cr-surface border border-cr-border rounded-2xl p-6 flex flex-col items-start gap-4 shadow-lg">
            <div className="w-12 h-12 bg-cr-bg rounded-xl flex items-center justify-center text-2xl">🔥</div>
            <div>
              <h3 className="text-3xl font-black text-cr-text-bold">{user?.currentStreak || 0}</h3>
              <p className="text-cr-text-muted font-bold text-sm">Current Streak</p>
            </div>
          </div>
          <div className="bg-cr-surface border border-cr-border rounded-2xl p-6 flex flex-col items-start gap-4 shadow-lg">
            <div className="w-12 h-12 bg-cr-bg rounded-xl flex items-center justify-center text-2xl">🏆</div>
            <div>
              <h3 className="text-3xl font-black text-cr-text-bold">{user?.bestStreak || 0}</h3>
              <p className="text-cr-text-muted font-bold text-sm">Best Streak</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black tracking-tight text-cr-text-bold">Recent Activity</h3>
            <Link href="/activity" className="text-[#58a6ff] font-bold text-sm hover:underline">See All</Link>
          </div>

          {recentScores.length === 0 ? (
            <div className="border-2 border-dashed border-cr-border rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center">
              <span className="text-5xl text-cr-text-subtle">⌨️</span>
              <div>
                <p className="text-cr-text-muted font-bold">No activity yet.</p>
                <p className="text-sm text-cr-text-subtle">Push some code to earn XP!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScores.slice(0, 10).map((score, idx) => (
                <div key={idx} className="flex justify-between items-center bg-cr-surface border border-cr-border p-4 rounded-xl shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-cr-bg rounded-lg flex items-center justify-center text-cr-text-muted">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><line x1="3" y1="12" x2="9" y2="12"></line><line x1="15" y1="12" x2="21" y2="12"></line></svg>
                    </div>
                    <div>
                      <h4 className="text-cr-text-bold font-bold">
                        Commit Pushed {!commitPrivacy && score.repositoryName ? `- ${score.repositoryName.split('/').pop()}` : ''}
                      </h4>
                      <p className="text-cr-text-muted text-sm font-medium">
                        {new Date(score.scoredAt).toLocaleDateString()} {!commitPrivacy && score.commitHash ? `• ${score.commitHash.substring(0, 7)}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="bg-cr-bg border-2 border-cr-border px-3 py-1.5 rounded-lg">
                    <span className="text-cr-text-bold font-black">+{score.points}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
