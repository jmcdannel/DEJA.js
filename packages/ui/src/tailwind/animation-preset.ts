import type { Config } from 'tailwindcss'

const animationPreset: Partial<Config> = {
  theme: {
    extend: {
      keyframes: {
        'deja-ping': {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        'deja-bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-25%)' },
        },
        'deja-pulse-glow': {
          '0%, 100%': {
            opacity: '0.8',
            boxShadow: '0 0 0 0 var(--deja-glow-color, rgba(56,189,248,0.4))',
          },
          '50%': {
            opacity: '1',
            boxShadow: '0 0 12px 4px var(--deja-glow-color, rgba(56,189,248,0.4))',
          },
        },
        'deja-press': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'deja-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-3px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(3px)' },
        },
        'deja-fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'deja-fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'deja-fade-in-scale': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'deja-slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'deja-slide-in-bottom': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'deja-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'deja-lcd-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.98' },
        },
        'deja-emergency-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.6)' },
          '50%': { boxShadow: '0 0 20px 8px rgba(239,68,68,0.3)' },
        },
      },
      animation: {
        'deja-ping': 'deja-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'deja-bounce-subtle': 'deja-bounce-subtle 1s ease-in-out infinite',
        'deja-pulse-glow': 'deja-pulse-glow 2s ease-in-out infinite',
        'deja-press': 'deja-press 150ms ease-out',
        'deja-shake': 'deja-shake 500ms ease-in-out',
        'deja-fade-in': 'deja-fade-in 250ms ease-out',
        'deja-fade-in-up': 'deja-fade-in-up 250ms ease-out',
        'deja-fade-in-scale': 'deja-fade-in-scale 250ms ease-out',
        'deja-slide-in-right': 'deja-slide-in-right 300ms ease-out',
        'deja-slide-in-bottom': 'deja-slide-in-bottom 300ms ease-out',
        'deja-blink': 'deja-blink 0.8s infinite',
        'deja-lcd-flicker': 'deja-lcd-flicker 0.1s infinite',
        'deja-emergency-pulse': 'deja-emergency-pulse 1s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'deja-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'deja-decelerate': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'deja-accelerate': 'cubic-bezier(0.4, 0.0, 1, 1)',
        'deja-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'deja-sharp': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      transitionDuration: {
        'deja-instant': '100ms',
        'deja-fast': '150ms',
        'deja-normal': '250ms',
        'deja-slow': '400ms',
      },
    },
  },
}

export default animationPreset
