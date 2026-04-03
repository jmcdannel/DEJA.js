import { signInWithEmailAndPassword } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { ref } from 'vue'
import { createLogger } from '@repo/utils'

const log = createLogger('DemoAuth')

const DEMO_LAYOUT_ID = 'demo-betatrack'

export function useDemoAuth() {
  const auth = useFirebaseAuth()!
  const layoutId = useStorage('@DEJA/layoutId', '')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function signInAsDemo(): Promise<boolean> {
    const email = import.meta.env.VITE_DEMO_EMAIL
    const password = import.meta.env.VITE_DEMO_PASSWORD

    if (!email || !password) {
      error.value = 'Demo credentials not configured'
      log.error('VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD must be set')
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      await signInWithEmailAndPassword(auth, email, password)
      layoutId.value = DEMO_LAYOUT_ID
      log.info('Demo sign-in successful, layout:', DEMO_LAYOUT_ID)
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      error.value = message
      log.error('Demo sign-in failed:', message)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    signInAsDemo,
    isLoading,
    error,
    DEMO_LAYOUT_ID,
  }
}
