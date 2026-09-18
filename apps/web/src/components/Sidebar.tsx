"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@coderats/shared';
import { useState, useRef, useEffect } from 'react';
import { Home, Trophy, Users, User, LogOut, Code } from 'lucide-react';

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
    { name: 'Home', href: '/', icon: <Home size={20} strokeWidth={3} />, color: 'bg-blue-400', borderColor: 'border-blue-600', shadow: 'shadow-[0_3px_0_0_#2563eb]' },
    { name: 'Leaderboard', href: '/leaderboard', icon: <Trophy size={20} strokeWidth={3} />, color: 'bg-yellow-400', borderColor: 'border-yellow-600', shadow: 'shadow-[0_3px_0_0_#ca8a04]' },
    { name: 'Squads', href: '/squad', icon: <Users size={20} strokeWidth={3} />, color: 'bg-green-400', borderColor: 'border-green-600', shadow: 'shadow-[0_3px_0_0_#16a34a]' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r-2 border-cr-border bg-cr-bg flex flex-col h-screen sticky top-0 font-sans">
      <div className="p-6 border-b-2 border-cr-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#58a6ff] rounded-xl flex items-center justify-center border-2 border-[#3182ce] shadow-[0_4px_0_0_#3182ce] transform -rotate-3">
            <Code size={24} className="text-white" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-xl font-black text-cr-text-bold tracking-tighter">DevRats.</h1>
            <p className="text-[10px] text-cr-text-muted font-black uppercase tracking-widest">Web Edition</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith('/squad') && item.href === '/squad');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${isActive ? 'bg-cr-surface border-2 border-cr-border shadow-[0_4px_0_0_#30363d]' : 'hover:bg-cr-surface border-2 border-transparent'}`}
            >
              <div className={`w-10 h-10 ${item.color} ${item.borderColor} ${item.shadow} border-2 rounded-xl flex items-center justify-center text-white`}>
                {item.icon}
              </div>
              <span className="text-base">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t-2 border-cr-border relative" ref={menuRef}>
        {isUserMenuOpen && (
          <div className="absolute bottom-[80px] left-4 right-4 bg-cr-surface border-2 border-cr-border rounded-2xl shadow-[0_8px_0_0_#30363d] overflow-hidden flex flex-col z-50">
            <Link 
              href="/profile" 
              onClick={() => setIsUserMenuOpen(false)}
              className="px-4 py-4 text-sm font-black text-cr-text hover:bg-cr-bg transition-colors flex items-center gap-3 border-b-2 border-cr-border"
            >
              <User size={18} strokeWidth={3} /> Go to Profile
            </Link>
            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                logout();
              }}
              className="px-4 py-4 text-sm font-black text-red-400 hover:bg-red-400/10 text-left transition-colors flex items-center gap-3"
            >
              <LogOut size={18} strokeWidth={3} /> Sign Out
            </button>
          </div>
        )}

        {user ? (
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`flex items-center gap-3 w-full p-2 rounded-2xl transition-all text-left border-2 ${isUserMenuOpen ? 'bg-cr-surface border-cr-border shadow-[0_4px_0_0_#30363d]' : 'border-transparent hover:bg-cr-surface'}`}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-xl bg-gray-800 border-2 border-cr-border" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center font-black text-gray-400 border-2 border-cr-border">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-cr-text-bold truncate">{user.displayName}</p>
              <p className="text-xs text-cr-text-muted font-bold truncate">@{user.username}</p>
            </div>
          </button>
        ) : null}
      </div>
    </aside>
  );
}
