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
        // Official ReefSentra Coral Reef Palette
        reef: {
          deep: '#061B2C',          // Deep Ocean Blue background
          midnight: '#162B42',      // Midnight Current (#162B42) - Primary dark surfaces
          surface: '#12253A',       // Subtle dark card elevation
          card: 'rgba(22, 43, 66, 0.78)',      // Glass card surface
          cardHover: 'rgba(28, 54, 82, 0.90)',
          coralBay: '#29B8E6',      // Coral Bay Blue (#29B8E6) - Primary data highlights
          blush: '#B8688B',         // Seashell Blush (#B8688B) - Secondary series
          sunset: '#FB8E5F',        // Sunset Foam (#FB8E5F) - Bleaching & warm accents
          deepSea: '#0A5CAB',       // Deep Sea Dive (#0A5CAB) - Supporting data series
          candy: '#C94889',         // Ocean Candy (#C94889) - Additional category indicators
          current: '#162B42',       // Midnight Current
          aqua: '#29B8E6',          // Linked to Coral Bay Blue
          teal: '#087E8B',          // Supporting Ocean Teal
          orange: '#FB8E5F',        // Linked to Sunset Foam
          pink: '#C94889',          // Linked to Ocean Candy
          seafoam: '#8DE2C5',       // Supporting Seafoam
          white: '#F3FAFC',         // Soft White for readability
          border: 'rgba(41, 184, 230, 0.22)',
          borderHover: 'rgba(41, 184, 230, 0.5)',
        },
        coral: {
          healthy: '#29B8E6',       // Healthy Coral -> Coral Bay Blue (#29B8E6)
          bleached: '#FB8E5F',      // Bleached Coral -> Sunset Foam (#FB8E5F)
          dead: '#B8688B',          // Dead Coral -> Seashell Blush (#B8688B)
          blackBand: '#0A5CAB',     // Black Band Disease -> Deep Sea Dive (#0A5CAB)
          whiteBand: '#C94889',     // White Band Disease -> Ocean Candy (#C94889)
          yellowBand: '#F5B838',    // Yellow Band Disease -> Distinct Sunlit Yellow
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-aqua': '0 0 25px -4px rgba(41, 184, 230, 0.4)',
        'glow-teal': '0 0 25px -4px rgba(8, 126, 139, 0.45)',
        'glow-sunset': '0 0 25px -4px rgba(251, 142, 95, 0.4)',
        'glow-coral': '0 0 25px -4px rgba(251, 142, 95, 0.4)',
        'glow-candy': '0 0 25px -4px rgba(201, 72, 137, 0.4)',
        'glow-pink': '0 0 25px -4px rgba(201, 72, 137, 0.35)',
        'reef-card': '0 10px 30px -5px rgba(6, 27, 44, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(180deg, #061B2C 0%, #162B42 50%, #061B2C 100%)',
        'reef-hero': 'radial-gradient(ellipse at top, rgba(41, 184, 230, 0.18), transparent 70%), linear-gradient(180deg, #061B2C 0%, #162B42 100%)',
        'coral-accent': 'linear-gradient(135deg, #FB8E5F 0%, #C94889 100%)',
        'aqua-teal': 'linear-gradient(135deg, #29B8E6 0%, #087E8B 100%)',
        'seafoam-aqua': 'linear-gradient(135deg, #8DE2C5 0%, #29B8E6 100%)',
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
