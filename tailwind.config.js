/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Duolingo-inspirierte Farben
        'py-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#58cc02', // Hauptgrün wie Duolingo
          600: '#4caf00',
          700: '#3d8c00',
          800: '#2d6600',
          900: '#1a4000',
        },
        'py-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#1cb0f6', // Duolingo Blau
          500: '#1899d6',
          600: '#0077b6',
          700: '#005f8f',
          800: '#004766',
          900: '#002f40',
        },
        'py-yellow': {
          400: '#ffc800', // Gold für XP
          500: '#ffb700',
        },
        'py-orange': {
          400: '#ff9600', // Streak-Farbe
          500: '#ff7700',
        },
        'py-red': {
          400: '#ff4b4b', // Fehler
          500: '#ea2b2b',
        },
        'py-purple': {
          400: '#ce82ff', // Spezielle Badges
          500: '#a855f7',
        },
        'py-gray': {
          50: '#f7f7f7',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#afafaf',
          400: '#777777',
          500: '#4b4b4b',
          600: '#3c3c3c',
          700: '#2b2b2b',
          800: '#1a1a1a',
          900: '#111111',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'pop': 'pop 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'confetti': 'confetti 1s ease-out forwards',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
        },
      },
      boxShadow: {
        'btn': '0 4px 0 0 rgba(0, 0, 0, 0.2)',
        'btn-hover': '0 2px 0 0 rgba(0, 0, 0, 0.2)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
