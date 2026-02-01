import { NextRequest, NextResponse } from 'next/server';
import { getSession, getLevelName } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'weekly'; // 'weekly' oder 'all'
  const groupOnly = searchParams.get('groupOnly') === 'true';

  // Basis-Query
  const where: Record<string, unknown> = {};

  // Nur Gruppenmitglieder wenn gewünscht
  if (groupOnly && session.groupId) {
    where.groupId = session.groupId;
  }

  if (type === 'weekly') {
    // Wöchentliches Leaderboard basierend auf WeeklyStats
    const weekStart = getWeekStart(new Date());

    const weeklyStats = await prisma.weeklyStats.findMany({
      where: {
        weekStart,
        user: groupOnly && session.groupId ? { groupId: session.groupId } : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarId: true,
            currentLevel: true,
            streakWeeks: true,
          },
        },
      },
      orderBy: {
        xpEarned: 'desc',
      },
      take: 50,
    });

    const leaderboard = weeklyStats.map((stat, index) => ({
      rank: index + 1,
      id: stat.user.id,
      nickname: stat.user.nickname,
      avatarId: stat.user.avatarId,
      xp: stat.xpEarned,
      level: stat.user.currentLevel,
      levelName: getLevelName(stat.user.currentLevel),
      streakWeeks: stat.user.streakWeeks,
      isCurrentUser: stat.user.id === session.id,
    }));

    // Falls aktueller User nicht in Top 50, eigene Position finden
    const currentUserInList = leaderboard.find((u) => u.isCurrentUser);
    let currentUserRank = null;

    if (!currentUserInList) {
      const userStats = await prisma.weeklyStats.findUnique({
        where: {
          userId_weekStart: {
            userId: session.id,
            weekStart,
          },
        },
      });

      if (userStats) {
        const higherCount = await prisma.weeklyStats.count({
          where: {
            weekStart,
            xpEarned: { gt: userStats.xpEarned },
            user: groupOnly && session.groupId ? { groupId: session.groupId } : undefined,
          },
        });

        currentUserRank = {
          rank: higherCount + 1,
          id: session.id,
          nickname: session.nickname,
          xp: userStats.xpEarned,
          level: session.currentLevel,
          levelName: getLevelName(session.currentLevel),
          streakWeeks: session.streakWeeks,
          isCurrentUser: true,
        };
      }
    }

    return NextResponse.json({
      type: 'weekly',
      weekStart: weekStart.toISOString(),
      leaderboard,
      currentUserRank,
    });
  } else {
    // Gesamt-Leaderboard
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nickname: true,
        avatarId: true,
        totalXp: true,
        currentLevel: true,
        streakWeeks: true,
      },
      orderBy: {
        totalXp: 'desc',
      },
      take: 50,
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      nickname: user.nickname,
      avatarId: user.avatarId,
      xp: user.totalXp,
      level: user.currentLevel,
      levelName: getLevelName(user.currentLevel),
      streakWeeks: user.streakWeeks,
      isCurrentUser: user.id === session.id,
    }));

    return NextResponse.json({
      type: 'all',
      leaderboard,
    });
  }
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
