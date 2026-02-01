'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  unlockedAt?: string;
}

interface UserProfile {
  id: string;
  nickname: string;
  avatarId: number;
  totalXp: number;
  currentLevel: number;
  levelName: string;
  streakWeeks: number;
  streakFreezes: number;
  completedLessons: number;
  achievements: Achievement[];
  group: {
    id: string;
    name: string;
    totalXp: number;
    weeklyGoal: number;
  } | null;
  weeklyStats: Array<{
    weekStart: string;
    xpEarned: number;
    lessonsCompleted: number;
  }>;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarEmoji = (avatarId: number) => {
    const avatars = ['👤', '🐍', '🦊', '🐱', '🐶', '🦁', '🐼', '🐨', '🐯', '🦄'];
    return avatars[avatarId % avatars.length];
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  // XP für nächstes Level berechnen
  const getXpProgress = () => {
    if (!profile) return { current: 0, needed: 50, percentage: 0 };
    const levels = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250, 2750, 3300, 4000];
    const currentLevelXp = levels[profile.currentLevel - 1] || 0;
    const nextLevelXp = levels[profile.currentLevel] || currentLevelXp + 500;
    const current = profile.totalXp - currentLevelXp;
    const needed = nextLevelXp - currentLevelXp;
    const percentage = Math.min((current / needed) * 100, 100);
    return { current, needed, percentage };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">👤</div>
          <p className="text-py-gray-400">Lade Profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const xpProgress = getXpProgress();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center"
      >
        {/* Avatar */}
        <div className="text-7xl mb-4">
          {getAvatarEmoji(profile.avatarId)}
        </div>

        {/* Name & Level */}
        <h1 className="text-2xl font-bold text-white mb-1">
          {profile.nickname}
        </h1>
        <p className="text-py-purple-400 font-semibold mb-4">
          {profile.levelName}
        </p>

        {/* Stats Row */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-py-yellow-400">{profile.totalXp}</div>
            <div className="text-xs text-py-gray-400">XP Gesamt</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-py-orange-400">{profile.streakWeeks}</div>
            <div className="text-xs text-py-gray-400">Wochen Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-py-green-400">{profile.completedLessons}</div>
            <div className="text-xs text-py-gray-400">Lektionen</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-py-gray-800 rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-py-gray-400">Level {profile.currentLevel}</span>
            <span className="text-py-purple-400">Level {profile.currentLevel + 1}</span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="h-full bg-gradient-to-r from-py-purple-400 to-py-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress.percentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className="text-xs text-py-gray-400 mt-2">
            {xpProgress.current} / {xpProgress.needed} XP
          </p>
        </div>

        {/* Streak Freezes */}
        {profile.streakFreezes > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-py-blue-400/20 text-py-blue-400 px-4 py-2 rounded-full">
            <span>❄️</span>
            <span>{profile.streakFreezes} Streak-Freeze verfügbar</span>
          </div>
        )}
      </motion.div>

      {/* Group */}
      {profile.group && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>👥</span> Deine Gruppe
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">{profile.group.name}</p>
              <p className="text-sm text-py-gray-400">
                Gruppen-XP: {profile.group.totalXp}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-py-gray-400">Wochenziel</p>
              <p className="font-bold text-py-yellow-400">{profile.group.weeklyGoal} XP</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Weekly Stats */}
      {profile.weeklyStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Letzte Wochen
          </h2>
          <div className="space-y-3">
            {profile.weeklyStats.map((stat, index) => (
              <div
                key={stat.weekStart}
                className="flex items-center justify-between bg-py-gray-800 rounded-xl p-3"
              >
                <div className="text-sm text-py-gray-400">
                  {new Date(stat.weekStart).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                  {index === 0 && (
                    <span className="ml-2 text-py-green-400 text-xs">(aktuell)</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-py-yellow-400 font-semibold">
                    +{stat.xpEarned} XP
                  </span>
                  <span className="text-py-gray-400 text-sm">
                    {stat.lessonsCompleted} Lektionen
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>🏅</span> Achievements ({profile.achievements.length})
        </h2>

        {profile.achievements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-py-gray-400">
              Noch keine Achievements freigeschaltet.
            </p>
            <p className="text-py-gray-500 text-sm mt-1">
              Schließe Lektionen ab, um Badges zu verdienen!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {profile.achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.05 }}
                className={`
                  achievement-card unlocked flex-col items-center text-center p-4
                  bg-gradient-to-br ${getRarityColor(achievement.rarity)}
                  bg-opacity-20
                `}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="font-bold text-white text-sm">{achievement.name}</div>
                <div className="text-xs text-py-gray-300 mt-1">
                  {achievement.description}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
