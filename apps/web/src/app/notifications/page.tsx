"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  
  // Simulated preferences state (in a real app, fetched from API)
  const [prefs, setPrefs] = useState({
    pushEnabled: true,
    emailWeekly: false,
    squadAlerts: true
  });

  const handleToggle = (key: keyof typeof prefs, value: boolean) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
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
          <h1 className="text-3xl font-black text-cr-text-bold tracking-tight">Notifications</h1>
        </div>

        <div className="space-y-6">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-cr-text-muted uppercase tracking-wider">Inbox</h2>
              <button className="text-xs font-bold text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full hover:bg-red-400/20 transition-colors">
                Clear All
              </button>
            </div>
            
            <div className="bg-cr-surface border border-cr-border rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg border-dashed">
              <span className="text-4xl mb-2">📭</span>
              <p className="text-cr-text-muted font-medium">No new notifications</p>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-cr-text-muted uppercase tracking-wider mb-4">Push Notifications</h2>
            <div className="bg-cr-surface border border-cr-border rounded-2xl overflow-hidden shadow-lg">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                    🔔
                  </div>
                  <div>
                    <p className="font-semibold text-cr-text-bold">Commit Reminders</p>
                    <p className="text-xs text-cr-text-subtle">Reminders at 14h, 17h, 20h and 23h to push code</p>
                  </div>
                </div>
                <Toggle checked={prefs.pushEnabled} onChange={(v) => handleToggle('pushEnabled', v)} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-cr-text-muted uppercase tracking-wider mb-4">Email</h2>
            <div className="bg-cr-surface border border-cr-border rounded-2xl overflow-hidden shadow-lg">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                    ✉️
                  </div>
                  <div>
                    <p className="font-semibold text-cr-text-bold">Weekly Report</p>
                    <p className="text-xs text-cr-text-subtle">Commits, top repo, league rank - every Sunday</p>
                  </div>
                </div>
                <Toggle checked={prefs.emailWeekly} onChange={(v) => handleToggle('emailWeekly', v)} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-cr-text-muted uppercase tracking-wider mb-4">Competition</h2>
            <div className="bg-cr-surface border border-cr-border rounded-2xl overflow-hidden shadow-lg">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                    👥
                  </div>
                  <div>
                    <p className="font-semibold text-cr-text-bold">Surpass Alerts</p>
                    <p className="text-xs text-cr-text-subtle">When a squad or league member passes you in score</p>
                  </div>
                </div>
                <Toggle checked={prefs.squadAlerts} onChange={(v) => handleToggle('squadAlerts', v)} />
              </div>
            </div>
          </section>

          <div className="flex items-start gap-2 pt-4 px-2">
            <span className="text-cr-text-subtle">ℹ️</span>
            <p className="text-xs text-cr-text-subtle leading-relaxed">
              Changes are saved automatically. Commit reminders are sent at most once per day per user.
            </p>
          </div>

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
