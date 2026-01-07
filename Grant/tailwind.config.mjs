/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        // Custom dark theme matching the original design
        dark: {
          bg: '#0D1117',
          card: 'rgba(31, 41, 55, 0.5)',
        },
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-attention': 'bounce-attention 2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          'from, to': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: '#22d3ee' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 4px rgba(251, 146, 60, 0.3)' },
          '50%': { boxShadow: '0 0 8px rgba(251, 146, 60, 0.6)' },
        },
        'bounce-attention': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '25%': { transform: 'translateY(-4px) scale(1.05)' },
          '50%': { transform: 'translateY(0) scale(1)' },
          '75%': { transform: 'translateY(-2px) scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
};
