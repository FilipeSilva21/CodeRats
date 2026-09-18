"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@coderats/shared';
import { useState, useRef, useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname === '/login' || pathname.startsWith('/auth/callback')) {
    return null;
  }

  const navItems = [
    { name: 'Home', href: '/', icon: '🐭' },
    { name: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
    { name: 'Squads', href: '/squad', icon: '👥' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-cr-border bg-cr-bg flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-cr-border">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐭</span>
          <div>
            <h1 className="text-xl font-black text-cr-text-bold tracking-tighter">DevRats.</h1>
            <p className="text-[10px] text-cr-text-muted font-medium uppercase tracking-widest">Web Edition</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith('/squad') && item.href === '/squad');
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

      <div className="p-4 border-t border-cr-border relative" ref={menuRef}>
        {isUserMenuOpen && (
          <div className="absolute bottom-[80px] left-4 right-4 bg-cr-surface border border-cr-border rounded-lg shadow-lg overflow-hidden flex flex-col z-50">
            <Link 
              href="/profile" 
              onClick={() => setIsUserMenuOpen(false)}
              className="px-4 py-3 text-sm font-semibold text-cr-text hover:bg-cr-bg transition-colors flex items-center gap-2"
            >
              👤 Go to Profile
            </Link>
            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                logout();
              }}
              className="px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-400/10 text-left transition-colors flex items-center gap-2"
            >
              🚪 Sign Out
            </button>
          </div>
        )}

        {user ? (
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors text-left ${isUserMenuOpen ? 'bg-cr-surface' : 'hover:bg-cr-surface'}`}
          >
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
          </button>
        ) : null}
      </div>
    </aside>
  );
}
