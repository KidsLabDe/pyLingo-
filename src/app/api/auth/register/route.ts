import { NextRequest, NextResponse } from 'next/server';
import { registerUser, setSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { nickname, code, groupCode } = await request.json();

    if (!nickname || !code) {
      return NextResponse.json(
        { error: 'Nickname und Code sind erforderlich!' },
        { status: 400 }
      );
    }

    if (nickname.length < 3) {
      return NextResponse.json(
        { error: 'Nickname muss mindestens 3 Zeichen lang sein!' },
        { status: 400 }
      );
    }

    if (code.length < 4) {
      return NextResponse.json(
        { error: 'Code muss mindestens 4 Zeichen lang sein!' },
        { status: 400 }
      );
    }

    const user = await registerUser(nickname, code, groupCode);
    await setSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nickname: user.nickname,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
