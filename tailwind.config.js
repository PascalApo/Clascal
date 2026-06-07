/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0a0f',
          50: '#12121a',
          100: '#1a1a24',
          200: '#22222e',
          300: '#2a2a38',
        },
        cyan: {
          accent: '#00d4ff',
          glow: '#00d4ff33',
        },
        magenta: {
          accent: '#ff00aa',
          glow: '#ff00aa33',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px #00d4ff40, 0 0 40px #00d4ff20',
        'neon-magenta': '0 0 20px #ff00aa40, 0 0 40px #ff00aa20',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
