// Duration scale (ms)
export const DURATION = {
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 400,
  glacial: 600,
} as const

// Easing curves — named for intent
export const EASING = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const

// Spring configs for @vueuse/motion
export const SPRING = {
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  snappy: { stiffness: 300, damping: 20, mass: 0.8 },
  bouncy: { stiffness: 200, damping: 10, mass: 1 },
  stiff: { stiffness: 500, damping: 30, mass: 0.5 },
} as const

// Glassmorphic glow colors
export const GLOW = {
  cyan: 'rgba(56, 189, 248, 0.4)',
  teal: 'rgba(34, 211, 238, 0.35)',
  success: 'rgba(16, 185, 129, 0.4)',
  error: 'rgba(239, 68, 68, 0.4)',
  warning: 'rgba(249, 115, 22, 0.4)',
} as const
