import type { Router } from 'vue-router'
import { initStatusBar } from './statusBar'
import { initKeyboard } from './keyboard'
import { initBackButton } from './backButton'

export async function initNative(router: Router) {
  await initStatusBar()
  await initKeyboard()
  initBackButton(router)
}
