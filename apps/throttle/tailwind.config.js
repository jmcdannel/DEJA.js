/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', '../../packages/ui/src/**/*.{vue,js,ts,jsx,tsx}'],
  // EmptyState builds color classes dynamically (e.g. `bg-${color}-500/10`), which the
  // JIT compiler can't see. Safelist the colors used by the throttle's empty states.
  safelist: [
    'bg-green-500',
    'bg-green-500/10',
    'border-green-500/40',
    'text-green-500',
    'text-green-400',
    'bg-amber-500',
    'bg-amber-500/10',
    'border-amber-500/40',
    'text-amber-500',
    'text-amber-400',
  ],
  presets: [require('../../packages/ui/src/tailwind/animation-preset').default],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/container-queries')],
}
