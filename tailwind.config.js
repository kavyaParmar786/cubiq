/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mc: {
          grass: '#5D9E2F',
          'grass-dark': '#4A7A24',
          dirt: '#6B4226',
          'dirt-dark': '#4A2E1A',
          stone: '#8B8B8B',
          'stone-dark': '#5A5A5A',
          coal: '#1A1A1A',
          diamond: '#4EEBD0',
          'diamond-dark': '#2BBFA6',
          gold: '#FFD700',
          redstone: '#FF3333',
          emerald: '#00FF5A',
          netherite: '#2C2424',
          sky: '#87CEEB',
          obsidian: '#0F0F1A',
          'dark-bg': '#0A0A12',
          'card-bg': '#111120',
          'card-border': '#252538',
          'hover-bg': '#16162A',
        }
      },
      fontFamily: {
        minecraft: ['var(--font-minecraft)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(93,158,47,0.12) 0%, transparent 60%), linear-gradient(180deg, #0A0A12 0%, #0A0A12 100%)',
        'card-gradient': 'linear-gradient(135deg, #111120 0%, #16162A 100%)',
        'diamond-glow': 'radial-gradient(circle at center, rgba(78,235,208,0.15) 0%, transparent 70%)',
        'dirt-pattern': "repeating-linear-gradient(45deg, #4A2E1A 0px, #4A2E1A 2px, #6B4226 2px, #6B4226 8px)",
        'stone-pattern': "repeating-linear-gradient(0deg, #5A5A5A 0px, #5A5A5A 1px, #8B8B8B 1px, #8B8B8B 8px)",
      },
      boxShadow: {
        'mc-card': '0 0 0 1px #252538, 0 8px 32px rgba(0,0,0,0.6)',
        'diamond-glow': '0 0 20px rgba(78,235,208,0.4), 0 0 40px rgba(78,235,208,0.15)',
        'gold-glow': '0 0 20px rgba(255,215,0,0.4)',
        'redstone-glow': '0 0 20px rgba(255,51,51,0.4)',
        'emerald-glow': '0 0 20px rgba(0,255,90,0.4)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'flicker': 'flicker 4s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(78,235,208,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(78,235,208,0.7), 0 0 60px rgba(78,235,208,0.3)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '98%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
