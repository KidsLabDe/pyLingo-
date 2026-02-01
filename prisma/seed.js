const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🐍 Seeding pyLingo Datenbank...\n');

  // ============================================
  // ACHIEVEMENTS / BADGES
  // ============================================
  console.log('🏆 Erstelle Achievements...');

  const achievements = [
    // XP Achievements
    { slug: 'first-xp', name: 'Erste Schritte', description: 'Verdiene deine ersten XP', icon: '⭐', condition: JSON.stringify({ type: 'xp_total', value: 1 }), xpReward: 5, category: 'general', rarity: 'common' },
    { slug: 'xp-100', name: 'Aufwärmen', description: 'Sammle 100 XP', icon: '🔥', condition: JSON.stringify({ type: 'xp_total', value: 100 }), xpReward: 10, category: 'general', rarity: 'common' },
    { slug: 'xp-500', name: 'Python-Fan', description: 'Sammle 500 XP', icon: '🐍', condition: JSON.stringify({ type: 'xp_total', value: 500 }), xpReward: 25, category: 'general', rarity: 'rare' },
    { slug: 'xp-1000', name: 'Code-Meister', description: 'Sammle 1000 XP', icon: '👑', condition: JSON.stringify({ type: 'xp_total', value: 1000 }), xpReward: 50, category: 'general', rarity: 'epic' },
    { slug: 'xp-5000', name: 'Legende', description: 'Sammle 5000 XP', icon: '🏆', condition: JSON.stringify({ type: 'xp_total', value: 5000 }), xpReward: 100, category: 'general', rarity: 'legendary' },

    // Streak Achievements
    { slug: 'streak-1', name: 'Dranbleiber', description: 'Erreiche einen 1-Wochen-Streak', icon: '🔥', condition: JSON.stringify({ type: 'streak', value: 1 }), xpReward: 15, category: 'streak', rarity: 'common' },
    { slug: 'streak-4', name: 'Ausdauer', description: 'Erreiche einen 4-Wochen-Streak', icon: '💪', condition: JSON.stringify({ type: 'streak', value: 4 }), xpReward: 50, category: 'streak', rarity: 'rare' },
    { slug: 'streak-8', name: 'Unaufhaltsam', description: 'Erreiche einen 8-Wochen-Streak', icon: '⚡', condition: JSON.stringify({ type: 'streak', value: 8 }), xpReward: 100, category: 'streak', rarity: 'epic' },
    { slug: 'streak-12', name: 'Streak-Meister', description: 'Erreiche einen 12-Wochen-Streak', icon: '🌟', condition: JSON.stringify({ type: 'streak', value: 12 }), xpReward: 200, category: 'streak', rarity: 'legendary' },

    // Lektions-Achievements
    { slug: 'first-lesson', name: 'Los gehts!', description: 'Schließe deine erste Lektion ab', icon: '🎯', condition: JSON.stringify({ type: 'lessons_completed', value: 1 }), xpReward: 10, category: 'general', rarity: 'common' },
    { slug: 'lessons-10', name: 'Fleißig', description: 'Schließe 10 Lektionen ab', icon: '📚', condition: JSON.stringify({ type: 'lessons_completed', value: 10 }), xpReward: 30, category: 'general', rarity: 'rare' },
    { slug: 'lessons-25', name: 'Wissensdurst', description: 'Schließe 25 Lektionen ab', icon: '🧠', condition: JSON.stringify({ type: 'lessons_completed', value: 25 }), xpReward: 75, category: 'general', rarity: 'epic' },

    // Speed Achievements
    { slug: 'speed-demon', name: 'Blitzschnell', description: 'Schließe eine Lektion in unter 2 Minuten ab', icon: '⚡', condition: JSON.stringify({ type: 'speed', value: 120 }), xpReward: 20, category: 'speed', rarity: 'rare' },
    { slug: 'perfect-score', name: 'Perfektionist', description: 'Erreiche 100% bei einer Lektion', icon: '💯', condition: JSON.stringify({ type: 'perfect_score', value: 100 }), xpReward: 15, category: 'general', rarity: 'common' },
    { slug: 'no-hints', name: 'Selbstständig', description: 'Schließe eine Lektion ohne Hinweise ab', icon: '🎓', condition: JSON.stringify({ type: 'no_hints', value: 1 }), xpReward: 10, category: 'general', rarity: 'common' },

    // Spezielle Achievements
    { slug: 'first-game', name: 'Spieler', description: 'Spiele dein erstes Mini-Spiel', icon: '🎮', condition: JSON.stringify({ type: 'games_played', value: 1 }), xpReward: 10, category: 'general', rarity: 'common' },
    { slug: 'bug-hunter', name: 'Bug-Jäger', description: 'Finde und behebe einen Bug in einer Aufgabe', icon: '🐛', condition: JSON.stringify({ type: 'bugs_fixed', value: 1 }), xpReward: 20, category: 'general', rarity: 'rare' },
    { slug: 'night-owl', name: 'Nachteule', description: 'Lerne nach 22 Uhr', icon: '🦉', condition: JSON.stringify({ type: 'time_of_day', value: 'night' }), xpReward: 10, category: 'general', rarity: 'rare' },
    { slug: 'early-bird', name: 'Frühaufsteher', description: 'Lerne vor 7 Uhr', icon: '🐦', condition: JSON.stringify({ type: 'time_of_day', value: 'morning' }), xpReward: 10, category: 'general', rarity: 'rare' },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement,
    });
  }

  // ============================================
  // MODULE & LEKTIONEN
  // ============================================
  console.log('📚 Erstelle Module und Lektionen...');

  // MODUL 1: Erste Schritte
  const modul1 = await prisma.module.upsert({
    where: { slug: 'erste-schritte' },
    update: {},
    create: {
      slug: 'erste-schritte',
      title: 'Erste Schritte',
      description: 'Lerne Python kennen und schreibe deinen ersten Code!',
      icon: '🚀',
      order: 1,
      color: '#58cc02',
      requiredXp: 0,
    },
  });

  // Lektion 1.1: Hallo Python
  const lektion1_1 = await prisma.lesson.upsert({
    where: { slug: 'hallo-python' },
    update: {},
    create: {
      slug: 'hallo-python',
      title: 'Hallo Python!',
      description: 'Dein erster Python-Befehl: print()',
      order: 1,
      moduleId: modul1.id,
      type: 'lesson',
      xpReward: 15,
    },
  });

  // Übungen für Lektion 1.1
  await prisma.exercise.deleteMany({ where: { lessonId: lektion1_1.id } });
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: lektion1_1.id,
        order: 1,
        type: 'multiple_choice',
        title: 'Was ist Python?',
        instructions: 'Python ist eine **Programmiersprache**. Mit Python kannst du dem Computer sagen, was er tun soll!\n\nWelches Tier ist das Maskottchen von Python?',
        options: JSON.stringify(['🐕 Hund', '🐍 Schlange', '🐱 Katze', '🦁 Löwe']),
        correctAnswer: '🐍 Schlange',
        xpReward: 3,
      },
      {
        lessonId: lektion1_1.id,
        order: 2,
        type: 'code',
        title: 'Dein erster Befehl',
        instructions: 'Mit `print()` kannst du Text auf dem Bildschirm ausgeben.\n\n**Aufgabe:** Schreibe Code, der "Hallo Welt!" ausgibt.',
        starterCode: '# Schreibe deinen Code hier\n',
        solution: 'print("Hallo Welt!")',
        hints: JSON.stringify(['Benutze print()', 'Der Text muss in Anführungszeichen stehen', 'print("Hallo Welt!")']),
        testCases: JSON.stringify([{ expected: 'Hallo Welt!' }]),
        xpReward: 5,
      },
      {
        lessonId: lektion1_1.id,
        order: 3,
        type: 'fill_blank',
        title: 'Fülle die Lücke',
        instructions: 'Vervollständige den Code, um "Python ist cool!" auszugeben.',
        starterCode: '___("Python ist cool!")',
        solution: 'print',
        hints: JSON.stringify(['Mit welchem Befehl gibst du Text aus?']),
        xpReward: 4,
      },
      {
        lessonId: lektion1_1.id,
        order: 4,
        type: 'code',
        title: 'Dein Name',
        instructions: '**Aufgabe:** Lass Python deinen Namen ausgeben!\n\nBeispiel: `print("Max")`',
        starterCode: '# Gib deinen Namen aus\n',
        solution: 'print("Name")',
        hints: JSON.stringify(['Ersetze "Name" mit deinem echten Namen']),
        testCases: JSON.stringify([{ type: 'contains_print' }]),
        xpReward: 3,
      },
    ],
  });

  // Lektion 1.2: Variablen
  const lektion1_2 = await prisma.lesson.upsert({
    where: { slug: 'variablen' },
    update: {},
    create: {
      slug: 'variablen',
      title: 'Variablen - Dein Gedächtnis',
      description: 'Speichere Daten in Variablen',
      order: 2,
      moduleId: modul1.id,
      type: 'lesson',
      xpReward: 20,
    },
  });

  await prisma.exercise.deleteMany({ where: { lessonId: lektion1_2.id } });
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: lektion1_2.id,
        order: 1,
        type: 'multiple_choice',
        title: 'Was ist eine Variable?',
        instructions: 'Eine **Variable** ist wie eine Box, in der du Dinge speichern kannst.\n\n```python\nname = "Anna"\nalter = 14\n```\n\nWas speichert die Variable `alter`?',
        options: JSON.stringify(['Anna', '14', 'name', 'alter']),
        correctAnswer: '14',
        xpReward: 3,
      },
      {
        lessonId: lektion1_2.id,
        order: 2,
        type: 'code',
        title: 'Erstelle eine Variable',
        instructions: '**Aufgabe:** Erstelle eine Variable `lieblings_farbe` und speichere deine Lieblingsfarbe darin. Gib sie dann aus!',
        starterCode: '# Erstelle die Variable\nlieblings_farbe = \n\n# Gib sie aus\nprint(lieblings_farbe)',
        solution: 'lieblings_farbe = "blau"\nprint(lieblings_farbe)',
        hints: JSON.stringify(['Text muss in Anführungszeichen', 'z.B. lieblings_farbe = "rot"']),
        testCases: JSON.stringify([{ type: 'has_variable', name: 'lieblings_farbe' }]),
        xpReward: 5,
      },
      {
        lessonId: lektion1_2.id,
        order: 3,
        type: 'match',
        title: 'Verbinde richtig',
        instructions: 'Welcher Wert gehört zu welchem Datentyp?',
        options: JSON.stringify({
          left: ['"Hallo"', '42', '3.14', 'True'],
          right: ['String (Text)', 'Integer (Ganzzahl)', 'Float (Kommazahl)', 'Boolean (Ja/Nein)'],
          correct: [[0, 0], [1, 1], [2, 2], [3, 3]],
        }),
        xpReward: 4,
      },
      {
        lessonId: lektion1_2.id,
        order: 4,
        type: 'code',
        title: 'Rechnen mit Variablen',
        instructions: 'Du kannst mit Variablen auch rechnen!\n\n**Aufgabe:** Erstelle zwei Variablen `a = 10` und `b = 5`. Berechne die Summe und gib sie aus.',
        starterCode: 'a = 10\nb = 5\n\n# Berechne die Summe\nsumme = \n\nprint(summe)',
        solution: 'a = 10\nb = 5\nsumme = a + b\nprint(summe)',
        hints: JSON.stringify(['summe = a + b']),
        testCases: JSON.stringify([{ expected: '15' }]),
        xpReward: 5,
      },
    ],
  });

  // Lektion 1.3: Rechnen
  const lektion1_3 = await prisma.lesson.upsert({
    where: { slug: 'rechnen' },
    update: {},
    create: {
      slug: 'rechnen',
      title: 'Rechnen wie ein Computer',
      description: 'Mathematische Operationen in Python',
      order: 3,
      moduleId: modul1.id,
      type: 'lesson',
      xpReward: 20,
    },
  });

  await prisma.exercise.deleteMany({ where: { lessonId: lektion1_3.id } });
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: lektion1_3.id,
        order: 1,
        type: 'multiple_choice',
        title: 'Rechenzeichen',
        instructions: 'Python kann rechnen! Hier sind die wichtigsten Operatoren:\n\n- `+` Addition\n- `-` Subtraktion\n- `*` Multiplikation\n- `/` Division\n- `**` Potenz (hoch)\n\nWas ist das Ergebnis von `2 ** 3`?',
        options: JSON.stringify(['5', '6', '8', '9']),
        correctAnswer: '8',
        xpReward: 3,
      },
      {
        lessonId: lektion1_3.id,
        order: 2,
        type: 'code',
        title: 'Taschenrechner',
        instructions: '**Aufgabe:** Berechne `(15 + 5) * 2` und gib das Ergebnis aus.',
        starterCode: '# Berechne und gib aus\n',
        solution: 'print((15 + 5) * 2)',
        hints: JSON.stringify(['Benutze Klammern für die richtige Reihenfolge', 'print((15 + 5) * 2)']),
        testCases: JSON.stringify([{ expected: '40' }]),
        xpReward: 5,
      },
      {
        lessonId: lektion1_3.id,
        order: 3,
        type: 'order',
        title: 'Reihenfolge der Operationen',
        instructions: 'Bringe die Operationen in die richtige Prioritäts-Reihenfolge (höchste zuerst):',
        options: JSON.stringify({
          items: ['Klammern ()', 'Potenz **', 'Multiplikation *', 'Addition +'],
          correctOrder: [0, 1, 2, 3],
        }),
        xpReward: 4,
      },
    ],
  });

  // Mini-Spiel: Zahlenraten
  const spiel1 = await prisma.lesson.upsert({
    where: { slug: 'spiel-zahlenraten' },
    update: {},
    create: {
      slug: 'spiel-zahlenraten',
      title: '🎮 Zahlenraten',
      description: 'Baue dein erstes Mini-Spiel!',
      order: 4,
      moduleId: modul1.id,
      type: 'game',
      xpReward: 30,
    },
  });

  await prisma.exercise.deleteMany({ where: { lessonId: spiel1.id } });
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: spiel1.id,
        order: 1,
        type: 'code',
        title: 'Die geheime Zahl',
        instructions: 'Wir bauen ein Zahlenraten-Spiel! Zuerst brauchen wir eine geheime Zahl.\n\n**Aufgabe:** Speichere die Zahl `7` in einer Variable namens `geheime_zahl`.',
        starterCode: '# Die geheime Zahl\n',
        solution: 'geheime_zahl = 7',
        testCases: JSON.stringify([{ type: 'has_variable', name: 'geheime_zahl', value: 7 }]),
        xpReward: 5,
      },
      {
        lessonId: spiel1.id,
        order: 2,
        type: 'code',
        title: 'Spieler rät',
        instructions: 'Mit `input()` kann der Spieler etwas eingeben.\n\n**Aufgabe:** Frage den Spieler nach seiner Zahl.',
        starterCode: 'geheime_zahl = 7\n\n# Frage den Spieler\ngeraten = input("Rate eine Zahl: ")\n\n# Wandle in Zahl um\ngeraten = int(geraten)\n\nprint("Du hast geraten:", geraten)',
        solution: 'geheime_zahl = 7\ngeraten = input("Rate eine Zahl: ")\ngeraten = int(geraten)\nprint("Du hast geraten:", geraten)',
        testCases: JSON.stringify([{ type: 'uses_input' }]),
        xpReward: 10,
      },
    ],
  });

  // MODUL 2: Entscheidungen
  const modul2 = await prisma.module.upsert({
    where: { slug: 'entscheidungen' },
    update: {},
    create: {
      slug: 'entscheidungen',
      title: 'Entscheidungen',
      description: 'Lass Python Entscheidungen treffen mit if, else und elif!',
      icon: '🔀',
      order: 2,
      color: '#1cb0f6',
      requiredXp: 50,
    },
  });

  const lektion2_1 = await prisma.lesson.upsert({
    where: { slug: 'if-bedingung' },
    update: {},
    create: {
      slug: 'if-bedingung',
      title: 'if - Wenn...dann',
      description: 'Lerne Bedingungen mit if',
      order: 1,
      moduleId: modul2.id,
      type: 'lesson',
      xpReward: 20,
    },
  });

  await prisma.exercise.deleteMany({ where: { lessonId: lektion2_1.id } });
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: lektion2_1.id,
        order: 1,
        type: 'multiple_choice',
        title: 'Was bedeutet if?',
        instructions: '`if` bedeutet "wenn" auf Englisch.\n\n```python\nalter = 16\nif alter >= 18:\n    print("Du bist volljährig!")\n```\n\nWas passiert hier?',
        options: JSON.stringify([
          'Es wird "Du bist volljährig!" ausgegeben',
          'Nichts passiert',
          'Ein Fehler tritt auf',
          'alter wird auf 18 gesetzt',
        ]),
        correctAnswer: 'Nichts passiert',
        xpReward: 3,
      },
      {
        lessonId: lektion2_1.id,
        order: 2,
        type: 'code',
        title: 'Erste Bedingung',
        instructions: '**Aufgabe:** Schreibe Code, der "Jackpot!" ausgibt, wenn `zahl` gleich `7` ist.',
        starterCode: 'zahl = 7\n\n# Wenn zahl gleich 7 ist\n',
        solution: 'zahl = 7\nif zahl == 7:\n    print("Jackpot!")',
        hints: JSON.stringify(['if zahl == 7:', 'Vergiss den Doppelpunkt nicht!', 'Der print-Befehl muss eingerückt sein']),
        testCases: JSON.stringify([{ expected: 'Jackpot!' }]),
        xpReward: 5,
      },
      {
        lessonId: lektion2_1.id,
        order: 3,
        type: 'multiple_choice',
        title: 'Vergleichsoperatoren',
        instructions: 'Welcher Operator prüft ob zwei Werte **gleich** sind?',
        options: JSON.stringify(['=', '==', '!=', '<>']),
        correctAnswer: '==',
        xpReward: 3,
      },
    ],
  });

  // MODUL 3: Schleifen
  const modul3 = await prisma.module.upsert({
    where: { slug: 'schleifen' },
    update: {},
    create: {
      slug: 'schleifen',
      title: 'Schleifen',
      description: 'Wiederhole Aktionen mit for und while!',
      icon: '🔄',
      order: 3,
      color: '#ff9600',
      requiredXp: 120,
    },
  });

  const lektion3_1 = await prisma.lesson.upsert({
    where: { slug: 'for-schleife' },
    update: {},
    create: {
      slug: 'for-schleife',
      title: 'for - Wiederhole X mal',
      description: 'Die for-Schleife für Wiederholungen',
      order: 1,
      moduleId: modul3.id,
      type: 'lesson',
      xpReward: 25,
    },
  });

  await prisma.exercise.deleteMany({ where: { lessonId: lektion3_1.id } });
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: lektion3_1.id,
        order: 1,
        type: 'multiple_choice',
        title: 'Was macht eine Schleife?',
        instructions: 'Eine **Schleife** wiederholt Code mehrmals.\n\n```python\nfor i in range(3):\n    print("Hallo")\n```\n\nWie oft wird "Hallo" ausgegeben?',
        options: JSON.stringify(['1 mal', '2 mal', '3 mal', '4 mal']),
        correctAnswer: '3 mal',
        xpReward: 3,
      },
      {
        lessonId: lektion3_1.id,
        order: 2,
        type: 'code',
        title: 'Countdown',
        instructions: '**Aufgabe:** Schreibe eine Schleife, die von 5 bis 1 runterzählt und dann "Start!" ausgibt.',
        starterCode: '# Countdown von 5 bis 1\n\nprint("Start!")',
        solution: 'for i in range(5, 0, -1):\n    print(i)\nprint("Start!")',
        hints: JSON.stringify(['range(5, 0, -1) zählt rückwärts', 'for i in range(5, 0, -1):']),
        testCases: JSON.stringify([{ expected: '5\n4\n3\n2\n1\nStart!' }]),
        xpReward: 8,
      },
    ],
  });

  // Erstelle Hackerwerkstatt-Gruppe
  console.log('👥 Erstelle Hackerwerkstatt-Gruppe...');

  await prisma.group.upsert({
    where: { joinCode: 'KIDSLAB2024' },
    update: {},
    create: {
      name: 'Hackerwerkstatt KidsLab',
      joinCode: 'KIDSLAB2024',
      description: 'Die offizielle Gruppe der Hackerwerkstatt im KidsLab',
      weeklyGoal: 500,
    },
  });

  console.log('\n✅ Datenbank erfolgreich befüllt!');
  console.log('📊 Erstellt:');
  console.log(`   - ${achievements.length} Achievements`);
  console.log('   - 3 Module');
  console.log('   - 6 Lektionen');
  console.log('   - 1 Gruppe (Code: KIDSLAB2024)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
