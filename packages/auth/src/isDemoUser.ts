// packages/auth/src/isDemoUser.ts
import { getAuth } from 'firebase/auth'

const DEMO_EMAIL = 'demo@dejajs.com'

export function isDemoUser(): boolean {
  return getAuth().currentUser?.email === DEMO_EMAIL
}

export { DEMO_EMAIL }
