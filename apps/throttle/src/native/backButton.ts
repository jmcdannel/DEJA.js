import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import type { Router } from 'vue-router'

export function initBackButton(router: Router) {
  if (!Capacitor.isNativePlatform()) return

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      router.back()
    } else {
      App.minimizeApp()
    }
  })
}
