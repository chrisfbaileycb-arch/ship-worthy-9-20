/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // High-contrast accessibility overrides to guarantee WCAG 2.1 AA 4.5:1 contrast on dark surfaces
        slate: {
          400: '#cbd5e1', // High-contrast slate-300 equivalent (>7:1 on dark surfaces)
          500: '#94a3b8', // High-contrast slate-400 equivalent (>4.5:1 on dark surfaces)
          600: '#64748b',
        },
        zinc: {
          400: '#d4d4d8', // High-contrast zinc (>7:1 on dark surfaces)
          500: '#a1a1aa', // High-contrast zinc (>4.5:1 on dark surfaces)
        },
        // High-contrast text & surface tokens (WCAG 2.1 AA compliant > 4.5:1)
        surface: {
          dark: "#0a0f18",
          card: "#111927",
          border: "#2b3b52",
        },
        muted: {
          light: "#e2e8f0", // slate-200 replacement for unreadable text
          base: "#cbd5e1",  // slate-300 minimum for secondary labels
        },
        secondary: {
          bg: "#1e293b",
          border: "#475569",
          text: "#f8fafc",   // slate-50 high contrast text on buttons
          hover: "#334155",
        },
      },
    },
  },
  plugins: [],
};

