// packages/auth/src/ensureAutoLogin.ts
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getCurrentUser } from 'vuefire'
import { createLogger } from '@repo/utils'

const log = createLogger('AutoLogin')

export async function ensureAutoLogin(): Promise<void> {
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
