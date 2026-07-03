/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#F5F6FA',
          dark: '#06070C',
        },
        ink: {
          DEFAULT: '#0B0D12',
          inverse: '#F5F6FA',
          muted: '#6B7080',
          'muted-dark': '#9297A8',
        },
        signal: {
          indigo: '#4F6BFF',
          'indigo-soft': '#7C90FF',
          teal: '#17E3C2',
          ember: '#FF6B4A',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.62)',
          'light-border': 'rgba(255, 255, 255, 0.85)',
          dark: 'rgba(18, 20, 28, 0.55)',
          'dark-border': 'rgba(255, 255, 255, 0.08)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '20px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(15, 20, 40, 0.08)',
        'glass-lg': '0 20px 60px rgba(15, 20, 40, 0.14)',
        beam: '0 0 0 1.5px rgba(79, 107, 255, 0.5), 0 0 32px rgba(23, 227, 194, 0.35)',
        'glow-teal': '0 0 24px rgba(23, 227, 194, 0.45)',
      },
      backgroundImage: {
        mesh: 'radial-gradient(at 20% 0%, rgba(79,107,255,0.16) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(23,227,194,0.14) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(255,107,74,0.08) 0px, transparent 50%)',
        'mesh-dark': 'radial-gradient(at 20% 0%, rgba(79,107,255,0.28) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(23,227,194,0.2) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(255,107,74,0.12) 0px, transparent 50%)',
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'ring-fill': {
          from: { strokeDashoffset: 'var(--ring-start, 220)' },
          to: { strokeDashoffset: 'var(--ring-end, 0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.4s linear infinite',
        'float-slow': 'float-slow 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
