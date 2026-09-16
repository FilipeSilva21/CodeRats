"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { injectStorage, injectConfig, injectNotifications, useAuthStore } from '@coderats/shared';

// Implementação do Storage para navegadores Web (usando localStorage)
const webStorage = {
  getItemAsync: async (key: string) => {
    if (typeof window !== 'undefined') return localStorage.getItem(key);
    return null;
  },
  setItemAsync: async (key: string, value: string) => {
    if (typeof window !== 'undefined') localStorage.setItem(key, value);
  },
  deleteItemAsync: async (key: string) => {
    if (typeof window !== 'undefined') localStorage.removeItem(key);
  }
};

// Como Web Push Notifications são diferentes do Expo, mockamos por enquanto
const webNotifications = {
  clearPushToken: async () => {},
  registerDevice: async () => null,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Injeta as dependências genéricas no pacote compartilhado
    injectStorage(webStorage);
    injectConfig({
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
      wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
    });
    injectNotifications(webNotifications);
    
    setInitialized(true);
  }, []);

  const { isAuthenticated, loadSession, isLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // On mount, load session
  useEffect(() => {
    if (initialized) {
      loadSession();
    }
  }, [initialized, loadSession]);

  // Handle protected routes
  useEffect(() => {
    if (!initialized || isLoading) return;
    
    const isAuthRoute = pathname === '/login' || pathname.startsWith('/auth/callback');

    if (!isAuthenticated && !isAuthRoute) {
      router.push('/login');
    } else if (isAuthenticated && isAuthRoute) {
      router.push('/');
    }
  }, [initialized, isLoading, isAuthenticated, pathname, router]);

  // Aguarda a inicialização para não dar erro de "Hydration" do Next.js
  if (!initialized) return null;

  return <>{children}</>;
}
