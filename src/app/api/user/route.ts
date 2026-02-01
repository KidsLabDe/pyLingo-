import { NextResponse } from 'next/server';
import { getSession, getLevelName } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  }

  // Vollständige User-Daten laden
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      achievements: {
        include: {
          achievement: true,
        },
      },
      progress: {
        include: {
          lesson: true,
        },
      },
      group: true,
      weeklyStats: {
        orderBy: { weekStart: 'desc' },
        take: 4,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
  }

  // Anzahl abgeschlossener Lektionen
  const completedLessons = user.progress.filter((p) => p.completed).length;

  return NextResponse.json({
    id: user.id,
    nickname: user.nickname,
    avatarId: user.avatarId,
    totalXp: user.totalXp,
    currentLevel: user.currentLevel,
    levelName: getLevelName(user.currentLevel),
    streakWeeks: user.streakWeeks,
    streakFreezes: user.streakFreezes,
    completedLessons,
    achievements: user.achievements.map((ua) => ({
      ...ua.achievement,
      unlockedAt: ua.unlockedAt,
    })),
    group: user.group
      ? {
          id: user.group.id,
          name: user.group.name,
          totalXp: user.group.totalXp,
          weeklyGoal: user.group.weeklyGoal,
        }
      : null,
    weeklyStats: user.weeklyStats,
  });
}
