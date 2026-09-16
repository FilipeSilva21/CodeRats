"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@coderats/shared";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  // Theme state
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [themeMode, setThemeMode] = useState("dark"); // Default to dark for CodeRats

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("coderats_theme") || "dark";
    setThemeMode(savedTheme);
  }, []);

  const changeTheme = (mode: string) => {
    setThemeMode(mode);
    localStorage.setItem("coderats_theme", mode);
    setShowThemeModal(false);

    if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <main className="flex flex-col flex-1 p-8 overflow-y-auto">
      <div className="max-w-3xl w-full mx-auto space-y-8">
        <h1 className="text-3xl font-black text-cr-text-bold tracking-tight">Profile</h1>

        {/* Profile Card */}
        <div className="bg-cr-surface border border-cr-border rounded-2xl p-8 flex flex-col items-center text-center shadow-lg">
          <div className="relative mb-6">
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user?.displayName} 
                className="w-32 h-32 rounded-full border-4 border-cr-bg bg-gray-800"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-cr-bg bg-gray-800 flex items-center justify-center font-bold text-gray-400 text-5xl">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-[#24292e] text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-cr-surface">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-cr-text-bold mb-1">{user?.displayName}</h2>
          <p className="text-cr-text-muted font-medium mb-6">@{user?.username}</p>

          <div className="flex w-full max-w-sm bg-cr-bg border border-cr-border rounded-xl p-4 divide-x divide-cr-border">
            <div className="flex-1 flex flex-col items-center">
              <p className="text-2xl font-black text-cr-text-bold">{user?.bestStreak || 0}</p>
              <p className="text-xs text-cr-text-subtle uppercase font-bold mt-1">Best Streak</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <p className="text-2xl font-black text-cr-text-bold">{user?.currentStreak || 0}</p>
              <p className="text-xs text-cr-text-subtle uppercase font-bold mt-1">Current</p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div>
          <h3 className="text-lg font-bold text-cr-text-bold mb-4">Account Settings</h3>
          <div className="bg-cr-surface border border-cr-border rounded-2xl overflow-hidden shadow-md">

            <Link href="/notifications" className="w-full flex items-center justify-between p-5 hover:bg-cr-bg transition-colors border-b border-cr-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                  🔔
                </div>
                <span className="font-semibold text-cr-text">Notifications</span>
              </div>
              <span className="text-cr-text-subtle">→</span>
            </Link>

            <button onClick={() => setShowThemeModal(true)} className="w-full flex items-center justify-between p-5 hover:bg-cr-bg transition-colors border-b border-cr-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                  🎨
                </div>
                <span className="font-semibold text-cr-text">Appearance</span>
              </div>
              <span className="text-cr-text-subtle capitalize text-sm font-medium">{themeMode} Mode</span>
            </button>

            <Link href="/privacy" className="w-full flex items-center justify-between p-5 hover:bg-cr-bg transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                  🛡️
                </div>
                <span className="font-semibold text-cr-text">Privacy & Security</span>
              </div>
              <span className="text-cr-text-subtle">→</span>
            </Link>
          </div>
        </div>

        <div className="pt-8">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-4 rounded-xl font-bold transition-colors"
          >Sign Out
          </button>
        </div>
      </div>

      {/* Theme Modal Overlay */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cr-surface border border-cr-border rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-cr-text-bold mb-6 text-center">Choose Theme</h2>

            <div className="space-y-2 mb-6">
              <ThemeOption
                icon="☀️" title="Light Mode" active={themeMode === 'light'}
                onClick={() => changeTheme('light')}
              />
              <ThemeOption
                icon="🌙" title="Dark Mode" active={themeMode === 'dark'}
                onClick={() => changeTheme('dark')}
              />
              <ThemeOption
                icon="📱" title="System Default" active={themeMode === 'system'}
                onClick={() => changeTheme('system')}
              />
            </div>

            <button
              onClick={() => setShowThemeModal(false)}
              className="w-full py-3 bg-cr-bg border border-cr-border text-cr-text-muted font-bold rounded-xl hover:bg-white/5 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function ThemeOption({ icon, title, active, onClick }: { icon: string, title: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors ${active
        ? 'border-[#58a6ff] bg-[#58a6ff]/10 text-[#58a6ff]'
        : 'border-transparent hover:bg-cr-bg text-cr-text-muted'
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-semibold">{title}</span>
    </button>
  );
}
