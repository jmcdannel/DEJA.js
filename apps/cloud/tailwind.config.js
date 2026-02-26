/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  presets: [require('../../packages/ui/src/tailwind/animation-preset').default],
  theme: {
    extend: {},
    darkMode: 'class',
  },
}