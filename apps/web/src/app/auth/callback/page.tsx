"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, sharedStorage } from '@coderats/shared';

function CallbackLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchProfile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const paramError = searchParams.get('error');

      if (paramError) {
        setError(paramError);
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (accessToken && refreshToken && sharedStorage) {
        await sharedStorage.setItemAsync('accessToken', accessToken);
        await sharedStorage.setItemAsync('refreshToken', refreshToken);
        
        await fetchProfile();
        const { isAuthenticated } = useAuthStore.getState();
        
        if (isAuthenticated) {
          router.push('/');
        } else {
          setError('Failed to fetch profile. Backend unreachable.');
          setTimeout(() => router.push('/login'), 3000);
        }
      } else {
        setError('No tokens received from provider.');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleAuth();
  }, [searchParams, router, fetchProfile]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cr-bg gap-4">
        <span className="text-4xl">❌</span>
        <h1 className="text-xl font-bold text-red-500">Authentication Failed</h1>
        <p className="text-cr-text-muted">{error}</p>
        <p className="text-sm text-cr-text-subtle">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cr-bg gap-6">
      <div className="w-12 h-12 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin"></div>
      <h1 className="text-xl font-bold text-cr-text">Completing login...</h1>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cr-bg flex items-center justify-center text-cr-text-bold">Loading...</div>}>
      <CallbackLogic />
    </Suspense>
  );
}
