import { cookies } from 'next/headers';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'pylingo_session';

export interface SessionUser {
  id: string;
  nickname: string;
  avatarId: number;
  totalXp: number;
  currentLevel: number;
  streakWeeks: number;
  groupId: string | null;
}

// Session aus Cookie holen
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const userId = sessionCookie.value;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        avatarId: true,
        totalXp: true,
        currentLevel: true,
        streakWeeks: true,
        groupId: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

// Benutzer registrieren
export async function registerUser(nickname: string, code: string, groupCode?: string) {
  // Prüfen ob Nickname bereits existiert
  const existingUser = await prisma.user.findUnique({
    where: { nickname },
  });

  if (existingUser) {
    throw new Error('Dieser Nickname ist bereits vergeben!');
  }

  // Code hashen
  const hashedCode = await bcrypt.hash(code, 10);

  // Gruppe finden falls angegeben
  let groupId: string | null = null;
  if (groupCode) {
    const group = await prisma.group.findUnique({
      where: { joinCode: groupCode },
    });
    if (group) {
      groupId = group.id;
    }
  }

  // Benutzer erstellen
  const user = await prisma.user.create({
    data: {
      nickname,
      code: hashedCode,
      groupId,
    },
  });

  return user;
}

// Benutzer anmelden
export async function loginUser(nickname: string, code: string) {
  const user = await prisma.user.findUnique({
    where: { nickname },
  });

  if (!user) {
    throw new Error('Benutzer nicht gefunden!');
  }

  const isValid = await bcrypt.compare(code, user.code);
  if (!isValid) {
    throw new Error('Falscher Code!');
  }

  // Streak prüfen und aktualisieren
  await updateStreak(user.id);

  return user;
}

// Session setzen
export async function setSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 Tage
    path: '/',
  });
}

// Session löschen (Logout)
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Level basierend auf XP berechnen
export function calculateLevel(xp: number): number {
  // Level-Kurve: 0-50 = 1, 51-150 = 2, 151-300 = 3, etc.
  const levels = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250, 2750, 3300, 4000, 4800, 5700, 6700, 7800, 9000, 10500, 12000];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Level-Namen
export function getLevelName(level: number): string {
  const names = [
    'Python-Neuling',      // 1
    'Code-Entdecker',      // 2
    'Syntax-Lehrling',     // 3
    'Variablen-Meister',   // 4
    'Schleifen-Zauberer',  // 5
    'Funktions-Künstler',  // 6
    'Debug-Detektiv',      // 7
    'Algorithmen-Held',    // 8
    'Code-Ninja',          // 9
    'Python-Meister',      // 10
    'Hacker-Profi',        // 11
    'Byte-Champion',       // 12
    'Script-Virtuose',     // 13
    'Program-Legende',     // 14
    'Code-Genie',          // 15
    'Cyber-Magier',        // 16
    'Tech-Titan',          // 17
    'Python-Guru',         // 18
    'Digital-Legende',     // 19
    'Code-Gott',           // 20
  ];
  return names[Math.min(level - 1, names.length - 1)] || 'Unbekannt';
}

// Streak aktualisieren
async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const now = new Date();
  const lastActive = user.lastActiveAt;

  // Berechne die Woche (Montag-Sonntag)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const currentWeekStart = getWeekStart(now);
  const lastWeekStart = getWeekStart(lastActive);

  // Unterschied in Wochen
  const weekDiff = Math.floor(
    (currentWeekStart.getTime() - lastWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  let newStreak = user.streakWeeks;

  if (weekDiff === 0) {
    // Gleiche Woche - Streak bleibt
  } else if (weekDiff === 1) {
    // Letzte Woche war aktiv - Streak erhöhen
    newStreak += 1;
  } else if (weekDiff > 1 && user.streakFreezes > 0) {
    // Streak-Freeze benutzen
    await prisma.user.update({
      where: { id: userId },
      data: {
        streakFreezes: user.streakFreezes - 1,
        lastActiveAt: now,
      },
    });
    return;
  } else {
    // Streak verloren
    newStreak = 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      streakWeeks: newStreak,
      lastActiveAt: now,
    },
  });
}

// XP vergeben
export async function awardXp(
  userId: string,
  amount: number,
  reason: string,
  details?: string
) {
  // XP Event erstellen
  await prisma.xpEvent.create({
    data: {
      userId,
      amount,
      reason,
      details,
    },
  });

  // User XP aktualisieren
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      totalXp: { increment: amount },
    },
  });

  // Level aktualisieren
  const newLevel = calculateLevel(user.totalXp);
  if (newLevel !== user.currentLevel) {
    await prisma.user.update({
      where: { id: userId },
      data: { currentLevel: newLevel },
    });
  }

  // Gruppen-XP aktualisieren falls in Gruppe
  if (user.groupId) {
    await prisma.group.update({
      where: { id: user.groupId },
      data: {
        totalXp: { increment: amount },
      },
    });
  }

  // Wöchentliche Stats aktualisieren
  const weekStart = getWeekStart(new Date());
  await prisma.weeklyStats.upsert({
    where: {
      userId_weekStart: {
        userId,
        weekStart,
      },
    },
    update: {
      xpEarned: { increment: amount },
    },
    create: {
      userId,
      weekStart,
      xpEarned: amount,
    },
  });

  return { newXp: user.totalXp, newLevel };
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
