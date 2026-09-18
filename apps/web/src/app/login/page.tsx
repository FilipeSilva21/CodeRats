"use client";

import { useAuthStore, sharedConfig } from '@coderats/shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Flame, Users, Trophy, ShieldCheck, Code } from 'lucide-react';

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
    <main className="flex flex-col items-center justify-center min-h-screen bg-cr-bg p-8 font-sans">
      <div className="flex flex-col items-start w-full max-w-md gap-8">
        <div className="flex flex-col items-start">
          {/* Logo Duolingo Style */}
          <div className="w-20 h-20 bg-[#58a6ff] rounded-2xl flex items-center justify-center border-4 border-[#3182ce] shadow-[0_6px_0_0_#3182ce] mb-6 transform -rotate-3">
            <span className="text-4xl text-white font-black">{'<>'}</span>
          </div>
          
          <h1 className="text-5xl font-black text-cr-text-bold tracking-tighter">DevRats.</h1>
          <p className="text-xl text-cr-text-muted mt-2 font-bold">Commit. Compete. Conquer.</p>
        </div>

        <div className="flex flex-col gap-6 w-full mt-4">
          <FeatureItem 
            icon={<Flame size={24} strokeWidth={3} />} 
            color="bg-orange-400" 
            borderColor="border-orange-600"
            shadowColor="shadow-[0_4px_0_0_#ea580c]"
            text="Track your coding streaks" 
          />
          <FeatureItem 
            icon={<Users size={24} strokeWidth={3} />} 
            color="bg-green-400" 
            borderColor="border-green-600"
            shadowColor="shadow-[0_4px_0_0_#16a34a]"
            text="Compete in squads" 
          />
          <FeatureItem 
            icon={<Trophy size={24} strokeWidth={3} />} 
            color="bg-yellow-400" 
            borderColor="border-yellow-600"
            shadowColor="shadow-[0_4px_0_0_#ca8a04]"
            text="Climb the leaderboard" 
          />
          <FeatureItem 
            icon={<ShieldCheck size={24} strokeWidth={3} />} 
            color="bg-purple-400" 
            borderColor="border-purple-600"
            shadowColor="shadow-[0_4px_0_0_#9333ea]"
            text="Anti-cheat protected" 
          />
        </div>

        <div className="flex flex-col items-center w-full mt-8 gap-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border-2 border-red-500/30 text-red-500 w-full p-4 rounded-2xl">
              <span className="font-bold text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex items-center justify-center w-full gap-3 bg-[#58a6ff] hover:bg-[#4a93e6] active:translate-y-1 active:shadow-none text-white font-black text-lg py-4 px-8 rounded-2xl transition-all disabled:opacity-50 border-b-4 border-[#3182ce] shadow-[0_4px_0_0_#3182ce]"
          >
            <Code size={24} strokeWidth={3} />
            {isLoading ? 'Loading...' : 'Sign in with GitHub'}
          </button>
          <p className="text-sm text-cr-text-muted text-center mt-2 font-bold">
            We only request read access.<br/>Your code stays private.
          </p>
        </div>
      </div>
    </main>
  );
}

function FeatureItem({ icon, color, borderColor, shadowColor, text }: { icon: React.ReactNode; color: string; borderColor: string; shadowColor: string; text: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-14 h-14 ${color} ${borderColor} ${shadowColor} border-2 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:-translate-y-1`}>
        {icon}
      </div>
      <span className="text-cr-text font-black text-lg">{text}</span>
    </div>
  );
}
