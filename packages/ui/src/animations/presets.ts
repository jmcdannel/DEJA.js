import { DURATION, SPRING } from './constants'

export const presets = {
  // Interaction feedback
  buttonPress: {
    initial: { scale: 1 },
    tapped: { scale: 0.95, transition: { type: 'spring', ...SPRING.snappy } },
  },

  cardHover: {
    initial: { y: 0, scale: 1 },
    hovered: { y: -2, scale: 1.01, transition: { type: 'spring', ...SPRING.gentle } },
  },

  chipPress: {
    initial: { scale: 1 },
    tapped: { scale: 0.92, transition: { duration: DURATION.instant } },
  },

  // State transitions
  fadeIn: {
    initial: { opacity: 0 },
    enter: { opacity: 1, transition: { duration: DURATION.normal } },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 16 },
    enter: { opacity: 1, y: 0, transition: { type: 'spring', ...SPRING.gentle } },
  },

  fadeInScale: {
    initial: { opacity: 0, scale: 0.9 },
    enter: { opacity: 1, scale: 1, transition: { type: 'spring', ...SPRING.gentle } },
  },

  slideInRight: {
    initial: { opacity: 0, x: 24 },
    enter: { opacity: 1, x: 0, transition: { type: 'spring', ...SPRING.gentle } },
  },

  slideInLeft: {
    initial: { opacity: 0, x: -24 },
    enter: { opacity: 1, x: 0, transition: { type: 'spring', ...SPRING.gentle } },
  },

  slideInBottom: {
    initial: { opacity: 0, y: 48 },
    enter: { opacity: 1, y: 0, transition: { type: 'spring', ...SPRING.snappy } },
  },

  // Status indicators
  pulseGlow: {
    initial: { scale: 1, opacity: 0.8 },
    enter: {
      scale: [1, 1.15, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 2000, repeat: Infinity },
    },
  },

  alertShake: {
    initial: { x: 0 },
    enter: {
      x: [0, -4, 4, -4, 4, 0],
      transition: { duration: 400 },
    },
  },

  // Railroad-specific
  turnoutThrow: {
    initial: { rotate: 0 },
    enter: { rotate: -55, transition: { type: 'spring', ...SPRING.stiff } },
  },

  emergencyStop: {
    initial: { scale: 1 },
    enter: {
      scale: [1, 1.1, 0.95, 1],
      transition: { duration: 300 },
    },
  },
} as const

export type PresetName = keyof typeof presets
