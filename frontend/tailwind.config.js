/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#040812',
          900: '#08101E',
          850: '#0D192C',
          800: '#13233D',
          750: '#1A2F50',
          700: '#213B64',
          600: '#2F5288',
          500: '#436FAE',
        },
        coral: {
          healthy: '#10B981',       // Emerald Green
          bleached: '#F59E0B',      // Amber
          dead: '#EF4444',          // Red / Crimson
          blackBand: '#8B5CF6',     // Violet / Deep Purple
          whiteBand: '#38BDF8',     // Sky Blue
          yellowBand: '#EAB308',    // Bright Yellow
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(34, 211, 238, 0.25)',
        'glow-teal': '0 0 20px -5px rgba(45, 212, 191, 0.25)',
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
