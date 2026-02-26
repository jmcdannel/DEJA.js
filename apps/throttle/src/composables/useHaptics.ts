const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

export type HapticPattern = 'light' | 'medium' | 'heavy'

const patterns: Record<HapticPattern, number> = {
  light: 10,
  medium: 25,
  heavy: 50,
}

export function useHaptics() {
  function vibrate(pattern: HapticPattern = 'light') {
    if (!isSupported) return
    try {
      navigator.vibrate(patterns[pattern])
    } catch {
      // Silently fail on unsupported devices
    }
  }

  function vibrateRaw(ms: number) {
    if (!isSupported) return
    try {
      navigator.vibrate(ms)
    } catch {
      // no-op
    }
  }

  return {
    isSupported,
    vibrate,
    vibrateRaw,
  }
}
