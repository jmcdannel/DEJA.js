import { Capacitor } from '@capacitor/core'
import { Keyboard, KeyboardResize } from '@capacitor/keyboard'

export async function initKeyboard() {
  if (!Capacitor.isNativePlatform()) return

  await Keyboard.setResizeMode({ mode: KeyboardResize.Body })
}
