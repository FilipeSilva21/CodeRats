"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@coderats/shared';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (pathname === '/login' || pathname.startsWith('/auth/callback')) {
    return null;
  }

  const navItems = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
    { name: 'Squads', href: '/squad', icon: '👥' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-cr-border bg-cr-bg flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-cr-border">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐀</span>
          <div>
            <h1 className="text-xl font-black text-cr-text-bold tracking-tighter">DevRats.</h1>
            <p className="text-[10px] text-cr-text-muted font-medium uppercase tracking-widest">Web Edition</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-[#58a6ff]/10 text-[#58a6ff]' : 'text-cr-text hover:bg-cr-surface'}`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-cr-border">
        {user ? (
          <Link href="/profile" className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-cr-surface transition-colors">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-gray-800" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-cr-text-bold truncate">{user.displayName}</p>
              <p className="text-xs text-cr-text-muted truncate">@{user.username}</p>
            </div>
          </Link>
        ) : null}

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors"
        > Sign Out
        </button>
      </div>
    </aside>
  );
}
