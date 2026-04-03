import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getCurrentUser } from 'vuefire'
import { createLogger } from '@repo/utils'

const log = createLogger('AutoLogin')

export async function ensureAutoLogin(): Promise<void> {
  log.debug('ensureAutoLogin check:', {
    VITE_AUTO_LOGIN: import.meta.env.VITE_AUTO_LOGIN,
    VITE_DEMO_EMAIL: import.meta.env.VITE_DEMO_EMAIL ? '✅ set' : '❌ missing',
    VITE_DEMO_PASSWORD: import.meta.env.VITE_DEMO_PASSWORD ? '✅ set' : '❌ missing',
  })
  if (import.meta.env.VITE_AUTO_LOGIN !== 'true') return

  const currentUser = await getCurrentUser()
  if (currentUser) return

  const email = import.meta.env.VITE_DEMO_EMAIL
  const password = import.meta.env.VITE_DEMO_PASSWORD
  if (!email || !password) {
    log.warn('VITE_AUTO_LOGIN is set but VITE_DEMO_EMAIL/VITE_DEMO_PASSWORD are missing')
    return
  }

  try {
    await signInWithEmailAndPassword(getAuth(), email, password)
    log.info('Auto-login successful as', email)
  } catch (err) {
    log.error('Auto-login failed:', err)
  }
}
