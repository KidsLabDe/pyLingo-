import { NextRequest, NextResponse } from 'next/server';
import { loginUser, setSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { nickname, code } = await request.json();

    if (!nickname || !code) {
      return NextResponse.json(
        { error: 'Nickname und Code sind erforderlich!' },
        { status: 400 }
      );
    }

    const user = await loginUser(nickname, code);
    await setSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nickname: user.nickname,
        totalXp: user.totalXp,
        currentLevel: user.currentLevel,
        streakWeeks: user.streakWeeks,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
