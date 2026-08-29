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
        'paper-white': '#fdfbf7',
        'paper-cream': '#f9f6f0',
        'midnight-slate': '#1a1a1a',
        'midnight-dark': '#141414',
        'ink': '#2d2926',
        'ink-light': '#4a4540',
        'ink-muted': '#6b6460',
        'accent-gold': '#c9a959',
        'accent-amber': '#d4a373',
      },
      fontFamily: {
        'handwriting': ['Caveat', 'Dancing Script', 'cursive'],
        'handwriting-alt': ['Dancing Script', 'Caveat', 'cursive'],
        'serif': ['Merriweather', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'paper-texture': "url('/textures/paper-grain.png')",
      },
      minHeight: {
        'touch': '44px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

