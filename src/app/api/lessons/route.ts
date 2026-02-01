import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  }

  // Alle Module mit Lektionen laden
  const modules = await prisma.module.findMany({
    orderBy: { order: 'asc' },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          exercises: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              type: true,
              xpReward: true,
            },
          },
        },
      },
    },
  });

  // User Progress laden
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: session.id },
  });

  const progressMap = new Map(progress.map((p) => [p.lessonId, p]));

  // Module mit Status anreichern
  const modulesWithStatus = modules.map((module) => {
    const isUnlocked = session.totalXp >= module.requiredXp;

    const lessons = module.lessons.map((lesson) => {
      const lessonProgress = progressMap.get(lesson.id);

      return {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        xpReward: lesson.xpReward,
        exerciseCount: lesson.exercises.length,
        totalXp: lesson.exercises.reduce((sum, e) => sum + e.xpReward, 0) + lesson.xpReward,
        status: lessonProgress?.completed
          ? 'completed'
          : isUnlocked
          ? 'available'
          : 'locked',
        score: lessonProgress?.score || 0,
        attempts: lessonProgress?.attempts || 0,
      };
    });

    return {
      id: module.id,
      slug: module.slug,
      title: module.title,
      description: module.description,
      icon: module.icon,
      color: module.color,
      requiredXp: module.requiredXp,
      isUnlocked,
      lessons,
      completedCount: lessons.filter((l) => l.status === 'completed').length,
      totalCount: lessons.length,
    };
  });

  return NextResponse.json({
    modules: modulesWithStatus,
    userXp: session.totalXp,
  });
}
