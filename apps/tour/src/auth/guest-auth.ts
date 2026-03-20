import { getCurrentUser } from 'vuefire'
import { createLogger } from '@repo/utils'
import { useGuestStore } from '../stores/guest'

const log = createLogger('GuestAuth')

export async function requireGuestOrAuth() {
  log.debug('Checking authentication for guest or Firebase user...')
  // Check if user is authenticated with Firebase
  const firebaseUser = await getCurrentUser()
  
  if (firebaseUser) {
    // Firebase user is authenticated, allow access
    return true
  }
  
  // Check if user is a guest
  const guestStore = useGuestStore()
  if (guestStore.isGuestUser) {
    // Guest user is authenticated, allow access
    return true
  }
  
  // Neither Firebase user nor guest, redirect to login
  return {
    path: '/login',
    query: { redirect: window.location.pathname }
  }
}

export function isAuthenticated() {
  const guestStore = useGuestStore()
  return guestStore.isGuestUser
}
