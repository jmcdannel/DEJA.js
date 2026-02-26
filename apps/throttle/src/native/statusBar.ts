import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

export async function initStatusBar() {
  if (!Capacitor.isNativePlatform()) return

  await StatusBar.setStyle({ style: Style.Dark })
  await StatusBar.setOverlaysWebView({ overlay: true })
}
