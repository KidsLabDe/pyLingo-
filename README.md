# 🐍 pyLingo

**Python lernen mit Spaß - wie Duolingo, aber für Code!**

Eine interaktive Lernplattform für die Hackerwerkstatt im KidsLab. Spielerisch Python lernen mit XP, Streaks, Leaderboards und Badges.

## Features

- 📚 **Interaktive Lektionen** - Schritt für Schritt Python lernen
- 🎮 **Mini-Spiele** - Spaß beim Coden
- ⭐ **XP-System** - Punkte für jede gelöste Aufgabe
- 🔥 **Wöchentlicher Streak** - Bleib dran!
- 🏆 **Leaderboard** - Miss dich mit deiner Gruppe
- 🏅 **Badges & Achievements** - Sammle Abzeichen
- 👥 **Gruppen-Features** - Für die Hackerwerkstatt
- 🐍 **Python im Browser** - Kein Setup nötig (Pyodide)

## Tech Stack

- **Frontend**: Next.js 14 + React
- **Styling**: Tailwind CSS (Duolingo-Style)
- **Backend**: Next.js API Routes
- **Datenbank**: SQLite + Prisma
- **Python im Browser**: Pyodide

## Installation

### 1. Repository klonen

```bash
git clone https://github.com/KidsLabDe/pyLingo-.git
cd pyLingo-
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Umgebungsvariablen einrichten

```bash
cp .env.example .env
```

Bearbeite `.env` und setze einen geheimen Schlüssel:

```env
DATABASE_URL="file:./dev.db"
APP_SECRET="dein-super-geheimer-schluessel-hier"
```

### 4. Datenbank initialisieren

```bash
npx prisma db push
npm run db:seed
```

### 5. Entwicklungsserver starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## Deployment

### Vercel (Empfohlen - Kostenlos!)

1. Push zu GitHub
2. Vercel mit Repository verbinden
3. Umgebungsvariablen setzen
4. Fertig!

### Eigener Server

```bash
npm run build
npm run start
```

## Gruppencode

Die Hackerwerkstatt-Gruppe hat den Code: **KIDSLAB2024**

Diesen Code können die Jugendlichen bei der Registrierung eingeben, um der Gruppe beizutreten.

## Neue Lektionen hinzufügen

Lektionen werden in `prisma/seed.js` definiert. Nach Änderungen:

```bash
npm run db:seed
```

## Struktur

```
pyLingo/
├── src/
│   ├── app/
│   │   ├── (app)/           # Eingeloggte Seiten
│   │   │   ├── learn/       # Lernübersicht
│   │   │   ├── lesson/      # Lektions-Seite
│   │   │   ├── leaderboard/ # Rangliste
│   │   │   └── profile/     # Profil
│   │   ├── (auth)/          # Login/Register
│   │   └── api/             # API Routes
│   ├── components/          # React Komponenten
│   └── lib/                 # Utilities
├── prisma/
│   ├── schema.prisma        # Datenbank-Schema
│   └── seed.js              # Initiale Daten
└── public/                  # Statische Dateien
```

## Level-System

| Level | Name | XP benötigt |
|-------|------|-------------|
| 1 | Python-Neuling | 0 |
| 2 | Code-Entdecker | 50 |
| 3 | Syntax-Lehrling | 150 |
| 4 | Variablen-Meister | 300 |
| 5 | Schleifen-Zauberer | 500 |
| ... | ... | ... |
| 20 | Code-Gott | 12000 |

## Lizenz

MIT - Frei verwendbar für Bildungszwecke.

---

Made with 💚 für die Hackerwerkstatt im KidsLab
