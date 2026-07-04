/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: 'var(--bg-primary)',
        card: 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
        accent: 'var(--accent)',
        'accent-light': 'var(--accent-light)',
        edge: 'var(--border)',
        'edge-accent': 'var(--border-accent)',
        ink: 'var(--text-primary)',
        'ink-2': 'var(--text-secondary)',
        'ink-3': 'var(--text-muted)',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
