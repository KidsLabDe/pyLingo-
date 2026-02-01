'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login fehlgeschlagen');
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

        {/* Login Card */}
        <div className="card">
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            Willkommen zurück!
          </h1>

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
                placeholder="Dein Nickname"
                required
              />
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
                required
              />
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
                  Lädt...
                </span>
              ) : (
                'Anmelden'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-py-gray-400">
              Noch keinen Account?{' '}
              <Link href="/register" className="text-py-blue-400 hover:underline font-semibold">
                Registrieren
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
