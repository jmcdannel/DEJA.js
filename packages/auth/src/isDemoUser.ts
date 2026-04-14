import { getAuth } from 'firebase/auth'
import { DEMO_EMAIL } from '@repo/utils'

export function isDemoUser(): boolean {
  return getAuth().currentUser?.email === DEMO_EMAIL
}

export { DEMO_EMAIL }
