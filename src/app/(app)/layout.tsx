'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  nickname: string;
  avatarId: number;
  totalXp: number;
  currentLevel: number;
  levelName: string;
  streakWeeks: number;
  completedLessons: number;
  group: {
    name: string;
  } | null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131f24] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐍</div>
          <p className="text-py-gray-400">Lädt...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: '/learn', icon: '📚', label: 'Lernen' },
    { href: '/leaderboard', icon: '🏆', label: 'Rangliste' },
    { href: '/profile', icon: '👤', label: 'Profil' },
  ];

  return (
    <div className="min-h-screen bg-[#131f24] flex flex-col">
      {/* Header */}
      <header className="bg-py-gray-800/50 border-b border-py-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/learn" className="flex items-center gap-2">
            <span className="text-2xl">🐍</span>
            <span className="text-xl font-bold text-white hidden sm:block">pyLingo</span>
          </Link>

          {/* Stats */}
          <div className="flex items-center gap-3">
            {/* Streak */}
            <motion.div
              className="streak-badge"
              whileHover={{ scale: 1.05 }}
              title={`${user.streakWeeks} Wochen Streak`}
            >
              <span>🔥</span>
              <span>{user.streakWeeks}</span>
            </motion.div>

            {/* XP */}
            <motion.div
              className="xp-badge"
              whileHover={{ scale: 1.05 }}
              title={`${user.totalXp} XP`}
            >
              <span>⭐</span>
              <span>{user.totalXp}</span>
            </motion.div>

            {/* Level */}
            <motion.div
              className="level-badge hidden sm:flex"
              whileHover={{ scale: 1.05 }}
              title={user.levelName}
            >
              <span>🎯</span>
              <span>Lvl {user.currentLevel}</span>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile-first) */}
      <nav className="bg-py-gray-800 border-t border-py-gray-700 sticky bottom-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'text-py-green-500'
                      : 'text-py-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-semibold">{item.label}</span>
                </Link>
              );
            })}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-py-gray-400 hover:text-py-red-400 transition-colors"
            >
              <span className="text-2xl">🚪</span>
              <span className="text-xs font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
