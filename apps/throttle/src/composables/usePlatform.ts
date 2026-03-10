import { Capacitor } from '@capacitor/core'

export function usePlatform() {
  const platform = Capacitor.getPlatform()
  const isNative = Capacitor.isNativePlatform()
  const isIos = platform === 'ios'
  const isAndroid = platform === 'android'
  const isWeb = platform === 'web'

  return {
    platform,
    isNative,
    isIos,
    isAndroid,
    isWeb,
  }
}
