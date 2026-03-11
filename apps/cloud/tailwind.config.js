/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  presets: [require('../../packages/ui/src/tailwind/animation-preset').default],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          cyan: '#00E5FF',
          magenta: '#D500F9',
          lime: '#C6FF00',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(0, 229, 255, 0.4)',
        'glow-magenta': '0 0 15px -3px rgba(213, 0, 249, 0.4)',
        'glow-lime': '0 0 15px -3px rgba(198, 255, 0, 0.4)',
        'soft-dark': '0 10px 40px -10px rgba(0,0,0,0.5)',
      }
    },
    darkMode: 'class',
  },
}