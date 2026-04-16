/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#070A0E',
          surface: '#0E1420',
          elevated: '#161C28',
          border: '#1E2A3A',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C97A',
          dim: 'rgba(201,168,76,0.15)',
        },
        buy: '#22C55E',
        wait: '#F59E0B',
        avoid: '#EF4444',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'mesh': 'mesh 15s ease infinite',
        'bar-fill': 'barFill 1s ease-out forwards',
        'gauge-fill': 'gaugeFill 1.5s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        mesh: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        barFill: {
          from: { width: '0%' },
          to: { width: 'var(--bar-width)' },
        },
        gaugeFill: {
          from: { strokeDashoffset: 'var(--dash-total)' },
          to: { strokeDashoffset: 'var(--dash-offset)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'gold': '0 0 20px rgba(201,168,76,0.3), 0 0 60px rgba(201,168,76,0.1)',
        'buy': '0 0 20px rgba(34,197,94,0.4), 0 0 60px rgba(34,197,94,0.2)',
        'wait': '0 0 20px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.2)',
        'avoid': '0 0 20px rgba(239,68,68,0.4), 0 0 60px rgba(239,68,68,0.2)',
      },
    },
  },
  plugins: [],
}
