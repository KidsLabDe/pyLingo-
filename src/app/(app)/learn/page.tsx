'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  xpReward: number;
  exerciseCount: number;
  totalXp: number;
  status: 'locked' | 'available' | 'completed';
  score: number;
}

interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  requiredXp: number;
  isUnlocked: boolean;
  lessons: Lesson[];
  completedCount: number;
  totalCount: number;
}

export default function LearnPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [userXp, setUserXp] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/lessons');
      const data = await res.json();
      setModules(data.modules);
      setUserXp(data.userXp);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <p className="text-py-gray-400">Lade Lektionen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Dein Lernpfad</h1>
        <p className="text-py-gray-400">
          Du hast <span className="text-py-yellow-400 font-bold">{userXp} XP</span> - weiter so! 🚀
        </p>
      </div>

      {/* Module */}
      <div className="space-y-8">
        {modules.map((module, moduleIndex) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: moduleIndex * 0.1 }}
            className={`relative ${!module.isUnlocked ? 'opacity-60' : ''}`}
          >
            {/* Module Header */}
            <div
              className="rounded-2xl p-6 mb-4"
              style={{
                background: `linear-gradient(135deg, ${module.color}20, ${module.color}10)`,
                borderLeft: `4px solid ${module.color}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{module.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{module.title}</h2>
                    <p className="text-py-gray-400 text-sm">{module.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-py-gray-400">
                    {module.completedCount}/{module.totalCount} Lektionen
                  </div>
                  {!module.isUnlocked && (
                    <div className="text-xs text-py-orange-400 mt-1">
                      🔒 {module.requiredXp} XP benötigt
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${(module.completedCount / module.totalCount) * 100}%`,
                    background: `linear-gradient(90deg, ${module.color}, ${module.color}dd)`,
                  }}
                />
              </div>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pl-4">
              {module.lessons.map((lesson, lessonIndex) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  moduleColor={module.color}
                  index={lessonIndex}
                  isModuleUnlocked={module.isUnlocked}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Motivation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8"
      >
        <p className="text-py-gray-400">
          Schon {modules.reduce((sum, m) => sum + m.completedCount, 0)} Lektionen abgeschlossen!
        </p>
        <p className="text-2xl mt-2">
          {modules.reduce((sum, m) => sum + m.completedCount, 0) === 0
            ? '🚀 Starte jetzt mit deiner ersten Lektion!'
            : '💪 Weiter so!'}
        </p>
      </motion.div>
    </div>
  );
}

function LessonCard({
  lesson,
  moduleColor,
  index,
  isModuleUnlocked,
}: {
  lesson: Lesson;
  moduleColor: string;
  index: number;
  isModuleUnlocked: boolean;
}) {
  const isLocked = !isModuleUnlocked || lesson.status === 'locked';
  const isCompleted = lesson.status === 'completed';
  const isGame = lesson.type === 'game';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={isLocked ? '#' : `/lesson/${lesson.slug}`}
        className={`
          block relative rounded-2xl p-4 text-center transition-all duration-200
          ${isLocked ? 'cursor-not-allowed opacity-50 grayscale' : 'hover:scale-105'}
          ${isCompleted ? 'ring-2 ring-py-green-500' : ''}
        `}
        style={{
          background: isCompleted
            ? `linear-gradient(135deg, ${moduleColor}30, ${moduleColor}20)`
            : 'rgb(43, 43, 43)',
        }}
        onClick={(e) => isLocked && e.preventDefault()}
      >
        {/* Status Icon */}
        <div className="absolute -top-2 -right-2">
          {isCompleted && (
            <span className="text-2xl">✅</span>
          )}
          {isLocked && (
            <span className="text-xl">🔒</span>
          )}
        </div>

        {/* Lesson Icon */}
        <div className="text-4xl mb-2">
          {isGame ? '🎮' : isCompleted ? '⭐' : '📖'}
        </div>

        {/* Title */}
        <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">
          {lesson.title}
        </h3>

        {/* XP Reward */}
        <div className="text-xs text-py-yellow-400 font-semibold">
          +{lesson.totalXp} XP
        </div>

        {/* Score if completed */}
        {isCompleted && lesson.score > 0 && (
          <div className="mt-1 text-xs text-py-green-400">
            {lesson.score}%
          </div>
        )}
      </Link>
    </motion.div>
  );
}
