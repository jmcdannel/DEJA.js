import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export type HapticPattern = 'light' | 'medium' | 'heavy'

const webPatterns: Record<HapticPattern, number> = {
  light: 10,
  medium: 25,
  heavy: 50,
}

const nativePatterns: Record<HapticPattern, ImpactStyle> = {
  light: ImpactStyle.Light,
  medium: ImpactStyle.Medium,
  heavy: ImpactStyle.Heavy,
}

const isNative = Capacitor.isNativePlatform()
const isWebSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

export function useHaptics() {
  function vibrate(pattern: HapticPattern = 'light') {
    if (isNative) {
      Haptics.impact({ style: nativePatterns[pattern] }).catch(() => {
        // Silently fail on unsupported devices
      })
      return
    }
    if (!isWebSupported) return
    try {
      navigator.vibrate(webPatterns[pattern])
    } catch {
      // Silently fail on unsupported devices
    }
  }

  function vibrateRaw(ms: number) {
    if (isNative) {
      Haptics.vibrate({ duration: ms }).catch(() => {
        // no-op
      })
      return
    }
    if (!isWebSupported) return
    try {
      navigator.vibrate(ms)
    } catch {
      // no-op
    }
  }

  return {
    isSupported: isNative || isWebSupported,
    vibrate,
    vibrateRaw,
  }
}
