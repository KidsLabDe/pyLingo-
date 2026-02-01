import { NextRequest, NextResponse } from 'next/server';
import { getSession, awardXp } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Lektion mit Übungen laden
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  const { slug } = await params;

  if (!session) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    include: {
      module: true,
      exercises: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: 'Lektion nicht gefunden' }, { status: 404 });
  }

  // Prüfen ob Modul freigeschaltet ist
  if (session.totalXp < lesson.module.requiredXp) {
    return NextResponse.json(
      { error: 'Dieses Modul ist noch nicht freigeschaltet!' },
      { status: 403 }
    );
  }

  // User Progress laden
  const progress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: session.id,
        lessonId: lesson.id,
      },
    },
  });

  // Exercises für Frontend aufbereiten (Lösungen entfernen!)
  const exercises = lesson.exercises.map((exercise) => ({
    id: exercise.id,
    order: exercise.order,
    type: exercise.type,
    title: exercise.title,
    instructions: exercise.instructions,
    starterCode: exercise.starterCode,
    hints: JSON.parse(exercise.hints),
    options: exercise.options ? JSON.parse(exercise.options) : null,
    xpReward: exercise.xpReward,
    // Lösung NICHT senden!
  }));

  return NextResponse.json({
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    type: lesson.type,
    xpReward: lesson.xpReward,
    module: {
      title: lesson.module.title,
      icon: lesson.module.icon,
      color: lesson.module.color,
    },
    exercises,
    progress: progress
      ? {
          completed: progress.completed,
          score: progress.score,
          attempts: progress.attempts,
          exercisesDone: JSON.parse(progress.exercisesDone),
        }
      : null,
  });
}

// Übung abschließen
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  const { slug } = await params;

  if (!session) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  }

  const { exerciseId, answer, code } = await request.json();

  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    include: {
      exercises: true,
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: 'Lektion nicht gefunden' }, { status: 404 });
  }

  const exercise = lesson.exercises.find((e) => e.id === exerciseId);
  if (!exercise) {
    return NextResponse.json({ error: 'Übung nicht gefunden' }, { status: 404 });
  }

  // Antwort prüfen
  let isCorrect = false;
  let feedback = '';

  switch (exercise.type) {
    case 'multiple_choice':
      isCorrect = answer === exercise.correctAnswer;
      feedback = isCorrect ? 'Richtig!' : `Falsch! Die richtige Antwort ist: ${exercise.correctAnswer}`;
      break;

    case 'fill_blank':
      isCorrect = answer?.toLowerCase().trim() === exercise.solution?.toLowerCase().trim();
      feedback = isCorrect ? 'Richtig!' : `Falsch! Die richtige Antwort ist: ${exercise.solution}`;
      break;

    case 'code':
      // Code-Aufgaben werden client-seitig mit Pyodide geprüft
      // Hier prüfen wir nur ob der Code die erwartete Ausgabe enthält
      const testCases = JSON.parse(exercise.testCases || '[]');
      if (testCases.length > 0) {
        const expectedOutput = testCases[0].expected;
        if (expectedOutput) {
          // Einfache Prüfung: Enthält die Ausgabe den erwarteten Wert?
          isCorrect = code?.output?.includes(expectedOutput) || false;
          feedback = isCorrect ? 'Dein Code funktioniert!' : 'Die Ausgabe stimmt nicht ganz...';
        } else {
          // Wenn kein erwarteter Output, prüfen wir nur ob Code ausgeführt wurde
          isCorrect = code?.executed || false;
          feedback = isCorrect ? 'Code ausgeführt!' : 'Führe deinen Code aus!';
        }
      } else {
        isCorrect = true; // Keine Tests = automatisch richtig
        feedback = 'Super!';
      }
      break;

    case 'match':
    case 'order':
      // Diese Typen werden client-seitig geprüft
      isCorrect = answer?.correct || false;
      feedback = isCorrect ? 'Richtig!' : 'Versuche es nochmal!';
      break;

    default:
      isCorrect = true;
  }

  // XP vergeben wenn richtig
  let xpAwarded = 0;
  if (isCorrect) {
    // Progress laden oder erstellen
    let progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.id,
          lessonId: lesson.id,
        },
      },
    });

    if (!progress) {
      progress = await prisma.lessonProgress.create({
        data: {
          userId: session.id,
          lessonId: lesson.id,
          exercisesDone: '[]',
        },
      });
    }

    const exercisesDone = JSON.parse(progress.exercisesDone);

    // Nur XP geben wenn Übung noch nicht gemacht wurde
    if (!exercisesDone.includes(exerciseId)) {
      xpAwarded = exercise.xpReward;
      await awardXp(session.id, xpAwarded, 'exercise_complete', exercise.title);

      // Exercise als erledigt markieren
      exercisesDone.push(exerciseId);
      await prisma.lessonProgress.update({
        where: { id: progress.id },
        data: {
          exercisesDone: JSON.stringify(exercisesDone),
          attempts: { increment: 1 },
        },
      });

      // Prüfen ob alle Übungen erledigt sind
      if (exercisesDone.length === lesson.exercises.length) {
        // Lektion abschließen
        await prisma.lessonProgress.update({
          where: { id: progress.id },
          data: {
            completed: true,
            completedAt: new Date(),
            score: 100,
          },
        });

        // Bonus XP für Lektion
        xpAwarded += lesson.xpReward;
        await awardXp(session.id, lesson.xpReward, 'lesson_complete', lesson.title);
      }
    }
  }

  return NextResponse.json({
    correct: isCorrect,
    feedback,
    xpAwarded,
    solution: isCorrect ? exercise.solution : null,
  });
}
