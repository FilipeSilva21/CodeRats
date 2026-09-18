"use client";

import { useAuthStore, sharedConfig } from '@coderats/shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { isLoading, error, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLogin = () => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const backendUrl = sharedConfig?.backendUrl || 'http://localhost:8080';
    const loginUrl = `${backendUrl}/api/auth/github/login?redirectUrl=${encodeURIComponent(redirectUrl)}`;
    
    window.location.href = loginUrl;
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-cr-bg p-8">
      <div className="flex flex-col items-start w-full max-w-md gap-8">
        <div className="flex flex-col items-start">
          <span className="text-6xl mb-4">🐭</span>
          <h1 className="text-5xl font-black text-cr-text-bold tracking-tighter">DevRats.</h1>
          <p className="text-lg text-cr-text-muted mt-2 font-medium">Commit. Compete. Conquer.</p>
        </div>

        <div className="flex flex-col gap-5 w-full mt-6">
          <FeatureItem icon="🔥" text="Track your coding streaks" />
          <FeatureItem icon="👥" text="Compete in squads" />
          <FeatureItem icon="🏆" text="Climb the leaderboard" />
          <FeatureItem icon="🛡️" text="Anti-cheat protected" />
        </div>

        <div className="flex flex-col items-center w-full mt-10 gap-3">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 w-full p-3 rounded-lg">
              <span className="font-bold text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex items-center justify-center w-full gap-2 bg-[#58a6ff] hover:bg-[#3182ce] text-cr-text-inverse font-bold py-4 px-8 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Sign in with GitHub'}
          </button>
          <p className="text-xs text-cr-text-subtle text-center mt-2">
            We only request read access.<br/>Your code stays private.
          </p>
        </div>
      </div>
    </main>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-cr-text font-semibold">{text}</span>
    </div>
  );
}
