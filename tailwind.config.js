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
        // Minecraft-inspired palette
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
          'dark-bg': '#0D0D14',
          'card-bg': '#141420',
          'card-border': '#2A2A3E',
          'hover-bg': '#1A1A2E',
        }
      },
      fontFamily: {
        minecraft: ['var(--font-minecraft)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'dirt-pattern': "repeating-linear-gradient(45deg, #4A2E1A 0px, #4A2E1A 2px, #6B4226 2px, #6B4226 8px)",
        'stone-pattern': "repeating-linear-gradient(0deg, #5A5A5A 0px, #5A5A5A 1px, #8B8B8B 1px, #8B8B8B 8px)",
        'grass-gradient': 'linear-gradient(180deg, #5D9E2F 0%, #4A7A24 40%, #6B4226 40%, #4A2E1A 100%)',
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(93,158,47,0.15) 0%, transparent 60%), linear-gradient(180deg, #0D0D14 0%, #0D0D14 100%)',
        'card-gradient': 'linear-gradient(135deg, #141420 0%, #1A1A2E 100%)',
        'diamond-glow': 'radial-gradient(circle at center, rgba(78,235,208,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'mc-btn': '0 4px 0 #3A6A1A, inset 0 1px 0 rgba(255,255,255,0.1)',
        'mc-btn-hover': '0 2px 0 #3A6A1A, inset 0 1px 0 rgba(255,255,255,0.1)',
        'mc-btn-press': '0 0px 0 #3A6A1A, inset 0 2px 0 rgba(0,0,0,0.2)',
        'mc-card': '0 0 0 2px #2A2A3E, 0 8px 32px rgba(0,0,0,0.5)',
        'diamond-glow': '0 0 20px rgba(78,235,208,0.4), 0 0 40px rgba(78,235,208,0.15)',
        'gold-glow': '0 0 20px rgba(255,215,0,0.4)',
        'redstone-glow': '0 0 20px rgba(255,51,51,0.4)',
        'emerald-glow': '0 0 20px rgba(0,255,90,0.4)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pixel-in': 'pixelIn 0.3s steps(8) forwards',
        'scan': 'scan 3s linear infinite',
        'flicker': 'flicker 4s linear infinite',
        'grass-wave': 'grassWave 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-pixel': 'bouncePixel 0.5s steps(4) infinite',
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
        pixelIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.6' },
          '99%': { opacity: '1' },
        },
        grassWave: {
          '0%, 100%': { clipPath: 'polygon(0 30%, 5% 25%, 10% 30%, 15% 22%, 20% 30%, 25% 25%, 30% 30%, 35% 22%, 40% 30%, 45% 25%, 50% 30%, 55% 22%, 60% 30%, 65% 25%, 70% 30%, 75% 22%, 80% 30%, 85% 25%, 90% 30%, 95% 22%, 100% 30%, 100% 100%, 0 100%)' },
          '50%': { clipPath: 'polygon(0 25%, 5% 30%, 10% 25%, 15% 30%, 20% 25%, 25% 30%, 30% 25%, 35% 30%, 40% 25%, 45% 30%, 50% 25%, 55% 30%, 60% 25%, 65% 30%, 70% 25%, 75% 30%, 80% 25%, 85% 30%, 90% 25%, 95% 30%, 100% 25%, 100% 100%, 0 100%)' },
        },
        bouncePixel: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
