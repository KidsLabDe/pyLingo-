'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131f24] to-[#1a2c35] flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-4xl">🐍</span>
          <span className="text-2xl font-bold text-white">pyLingo</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="btn-outline"
          >
            Anmelden
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            🐍
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Lerne <span className="text-py-green-500">Python</span>
          </h1>

          <p className="text-xl text-py-gray-300 mb-8 max-w-lg">
            Spielerisch programmieren lernen - wie Duolingo, aber für Code!
            Für die <span className="text-py-blue-400 font-semibold">Hackerwerkstatt</span> im KidsLab.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="btn-primary text-lg px-8 py-4"
            >
              Jetzt starten - Kostenlos!
            </Link>
            <Link
              href="/login"
              className="btn-secondary text-lg px-8 py-4"
            >
              Ich habe einen Account
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <FeatureCard
            emoji="🎮"
            title="Spielerisch lernen"
            description="Mini-Spiele, Quizze und interaktive Übungen"
          />
          <FeatureCard
            emoji="🔥"
            title="Wöchentlicher Streak"
            description="Bleib dran und baue deinen Streak aus!"
          />
          <FeatureCard
            emoji="🏆"
            title="Leaderboard"
            description="Miss dich mit deiner Gruppe"
          />
        </motion.div>

        {/* Gamification Preview */}
        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="xp-badge text-base">
            <span>⭐</span> XP sammeln
          </div>
          <div className="streak-badge text-base">
            <span>🔥</span> Streak halten
          </div>
          <div className="level-badge text-base">
            <span>🎯</span> Level aufsteigen
          </div>
          <div className="bg-py-green-500/20 text-py-green-400 font-bold px-3 py-1 rounded-full text-base flex items-center gap-1">
            <span>🏅</span> Badges freischalten
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-py-gray-400 text-sm">
        <p>Made with 💚 für die Hackerwerkstatt im KidsLab</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card-hover text-center">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-py-gray-300 text-sm">{description}</p>
    </div>
  );
}
