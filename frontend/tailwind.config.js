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
        reef: {
          deep: '#061B2C',       // Deep Ocean Blue
          midnight: '#082A3A',   // Midnight Blue
          surface: '#0B3346',    // Slightly elevated navy-teal
          card: 'rgba(11, 51, 70, 0.75)', // Glass card surface
          cardHover: 'rgba(15, 62, 86, 0.85)',
          teal: '#087E8B',       // Ocean Teal
          aqua: '#38D6D0',       // Vibrant Aqua
          orange: '#FF8066',     // Coral Orange
          pink: '#FF6F91',       // Coral Pink
          seafoam: '#8DE2C5',    // Seafoam
          white: '#F3FAFC',      // Soft White
          border: 'rgba(56, 214, 208, 0.22)',
          borderHover: 'rgba(56, 214, 208, 0.5)',
        },
        ocean: {
          950: '#061B2C',
          900: '#082A3A',
          850: '#0B3346',
          800: '#0F3E56',
          750: '#144B66',
          700: '#1B5B7C',
          600: '#237096',
          500: '#087E8B',
        },
        coral: {
          healthy: '#10B981',       // Emerald Green
          bleached: '#F59E0B',      // Amber
          dead: '#EF4444',          // Red / Crimson
          blackBand: '#8B5CF6',     // Violet / Deep Purple
          whiteBand: '#38BDF8',     // Sky Blue
          yellowBand: '#EAB308',    // Bright Yellow
          orange: '#FF8066',        // Coral Orange
          pink: '#FF6F91',          // Coral Pink
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-aqua': '0 0 25px -4px rgba(56, 214, 208, 0.35)',
        'glow-teal': '0 0 25px -4px rgba(8, 126, 139, 0.45)',
        'glow-coral': '0 0 25px -4px rgba(255, 128, 102, 0.4)',
        'glow-pink': '0 0 25px -4px rgba(255, 111, 145, 0.35)',
        'reef-card': '0 10px 30px -5px rgba(3, 16, 28, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(180deg, #061B2C 0%, #082A3A 50%, #061B2C 100%)',
        'reef-hero': 'radial-gradient(ellipse at top, rgba(56, 214, 208, 0.15), transparent 70%), linear-gradient(180deg, #061B2C 0%, #082A3A 100%)',
        'coral-accent': 'linear-gradient(135deg, #FF8066 0%, #FF6F91 100%)',
        'aqua-teal': 'linear-gradient(135deg, #38D6D0 0%, #087E8B 100%)',
        'seafoam-aqua': 'linear-gradient(135deg, #8DE2C5 0%, #38D6D0 100%)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
