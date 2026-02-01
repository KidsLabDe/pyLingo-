'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [codeConfirm, setCodeConfirm] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code !== codeConfirm) {
      setError('Die Codes stimmen nicht überein!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, code, groupCode: groupCode || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registrierung fehlgeschlagen');
      }

      router.push('/learn');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131f24] to-[#1a2c35] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="text-5xl">🐍</span>
          <span className="text-3xl font-bold text-white">pyLingo</span>
        </Link>

        {/* Register Card */}
        <div className="card">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Erstelle deinen Account
          </h1>
          <p className="text-py-gray-400 text-center mb-6">
            Bereit zum Coden? 🚀
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-py-gray-300 text-sm font-semibold mb-2">
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-py-gray-800 border border-py-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-py-green-500 transition-colors"
                placeholder="Wähle einen coolen Nickname"
                minLength={3}
                required
              />
              <p className="text-py-gray-400 text-xs mt-1">Mindestens 3 Zeichen</p>
            </div>

            <div>
              <label className="block text-py-gray-300 text-sm font-semibold mb-2">
                Geheimer Code
              </label>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-py-gray-800 border border-py-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-py-green-500 transition-colors"
                placeholder="Dein geheimer Code"
                minLength={4}
                required
              />
              <p className="text-py-gray-400 text-xs mt-1">Mindestens 4 Zeichen - merke ihn dir gut!</p>
            </div>

            <div>
              <label className="block text-py-gray-300 text-sm font-semibold mb-2">
                Code wiederholen
              </label>
              <input
                type="password"
                value={codeConfirm}
                onChange={(e) => setCodeConfirm(e.target.value)}
                className="w-full bg-py-gray-800 border border-py-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-py-green-500 transition-colors"
                placeholder="Code nochmal eingeben"
                required
              />
            </div>

            <div>
              <label className="block text-py-gray-300 text-sm font-semibold mb-2">
                Gruppen-Code (optional)
              </label>
              <input
                type="text"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                className="w-full bg-py-gray-800 border border-py-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-py-blue-400 transition-colors uppercase"
                placeholder="z.B. KIDSLAB2024"
              />
              <p className="text-py-gray-400 text-xs mt-1">
                Hast du einen Gruppen-Code von deinem Leiter bekommen?
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-py-red-400/20 border border-py-red-400 text-py-red-400 rounded-xl px-4 py-3 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Erstelle Account...
                </span>
              ) : (
                'Account erstellen'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-py-gray-400">
              Schon einen Account?{' '}
              <Link href="/login" className="text-py-blue-400 hover:underline font-semibold">
                Anmelden
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
