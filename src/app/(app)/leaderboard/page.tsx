'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  id: string;
  nickname: string;
  avatarId: number;
  xp: number;
  level: number;
  levelName: string;
  streakWeeks: number;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  type: string;
  weekStart?: string;
  leaderboard: LeaderboardEntry[];
  currentUserRank?: LeaderboardEntry;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [type, setType] = useState<'weekly' | 'all'>('weekly');
  const [groupOnly, setGroupOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [type, groupOnly]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?type=${type}&groupOnly=${groupOnly}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getAvatarEmoji = (avatarId: number) => {
    const avatars = ['👤', '🐍', '🦊', '🐱', '🐶', '🦁', '🐼', '🐨', '🐯', '🦄'];
    return avatars[avatarId % avatars.length];
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">🏆 Rangliste</h1>
        <p className="text-py-gray-400">
          Wer sammelt die meisten XP?
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => setType('weekly')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
            type === 'weekly'
              ? 'bg-py-green-500 text-white'
              : 'bg-py-gray-700 text-py-gray-300 hover:bg-py-gray-600'
          }`}
        >
          🔥 Diese Woche
        </button>
        <button
          onClick={() => setType('all')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
            type === 'all'
              ? 'bg-py-green-500 text-white'
              : 'bg-py-gray-700 text-py-gray-300 hover:bg-py-gray-600'
          }`}
        >
          ⭐ Gesamt
        </button>
        <button
          onClick={() => setGroupOnly(!groupOnly)}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
            groupOnly
              ? 'bg-py-blue-400 text-white'
              : 'bg-py-gray-700 text-py-gray-300 hover:bg-py-gray-600'
          }`}
        >
          👥 Nur Gruppe
        </button>
      </div>

      {/* Week Info */}
      {type === 'weekly' && data?.weekStart && (
        <div className="text-center text-py-gray-400 text-sm">
          Woche vom {new Date(data.weekStart).toLocaleDateString('de-DE')}
        </div>
      )}

      {/* Leaderboard */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">🏆</div>
            <p className="text-py-gray-400">Lade Rangliste...</p>
          </div>
        </div>
      ) : data?.leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-py-gray-400">Noch keine Einträge diese Woche.</p>
          <p className="text-py-gray-500 text-sm mt-2">Sei der Erste!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.leaderboard.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                leaderboard-row
                ${entry.isCurrentUser ? 'bg-py-green-500/20 ring-2 ring-py-green-500' : 'bg-py-gray-700'}
                ${entry.rank <= 3 ? '' : 'bg-py-gray-700'}
              `}
            >
              {/* Rank */}
              <div className="text-2xl font-bold w-12 text-center">
                {getRankEmoji(entry.rank)}
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-3 flex-1">
                <div className="text-3xl">
                  {getAvatarEmoji(entry.avatarId)}
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    {entry.nickname}
                    {entry.isCurrentUser && (
                      <span className="text-xs bg-py-green-500 px-2 py-0.5 rounded-full">
                        Du
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-py-gray-400">
                    {entry.levelName}
                  </div>
                </div>
              </div>

              {/* Streak */}
              {entry.streakWeeks > 0 && (
                <div className="streak-badge">
                  <span>🔥</span>
                  <span>{entry.streakWeeks}</span>
                </div>
              )}

              {/* XP */}
              <div className="xp-badge">
                <span>⭐</span>
                <span>{entry.xp}</span>
              </div>
            </motion.div>
          ))}

          {/* Current User if not in list */}
          {data?.currentUserRank && (
            <>
              <div className="text-center text-py-gray-500 py-2">• • •</div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="leaderboard-row bg-py-green-500/20 ring-2 ring-py-green-500"
              >
                <div className="text-xl font-bold w-12 text-center text-py-gray-300">
                  #{data.currentUserRank.rank}
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-3xl">👤</div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {data.currentUserRank.nickname}
                      <span className="text-xs bg-py-green-500 px-2 py-0.5 rounded-full">
                        Du
                      </span>
                    </div>
                    <div className="text-xs text-py-gray-400">
                      {data.currentUserRank.levelName}
                    </div>
                  </div>
                </div>
                <div className="xp-badge">
                  <span>⭐</span>
                  <span>{data.currentUserRank.xp}</span>
                </div>
              </motion.div>
            </>
          )}
        </div>
      )}

      {/* Motivation */}
      <div className="text-center py-4">
        <p className="text-py-gray-400 text-sm">
          💡 Tipp: Schließe Lektionen ab, um XP zu sammeln und aufzusteigen!
        </p>
      </div>
    </div>
  );
}
