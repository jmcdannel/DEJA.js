import { createLogger } from '@repo/utils'

const log = createLogger('Auth')

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // 🔗 Account linking
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  'auth/credential-already-in-use':
    'This credential is already associated with a different account.',

  // 🪟 Popup issues
  'auth/popup-blocked':
    'Pop-up was blocked by your browser. Trying alternative sign-in method…',
  'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',

  // 🔑 Email/password
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
  'auth/weak-password': 'Password is too weak. Please use at least 8 characters.',
  'auth/invalid-credential': 'Invalid credentials. Please try again.',

  // 🚫 Rate limiting & disabled
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',

  // 🌐 Network
  'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  'auth/internal-error': 'Something went wrong. Please try again.',

  // 📧 Password reset
  'auth/expired-action-code': 'This reset link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This reset link is invalid. Please request a new one.',
}

// Silently ignored errors (not shown to user)
const SILENT_ERROR_CODES = new Set([
  'auth/cancelled-popup-request', // Fires when a new popup replaces an old one
])

export interface FirebaseAuthError {
  code: string
  message: string
  customData?: {
    email?: string
    _tokenResponse?: unknown
  }
}

export function isFirebaseAuthError(error: unknown): error is FirebaseAuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as FirebaseAuthError).code === 'string' &&
    (error as FirebaseAuthError).code.startsWith('auth/')
  )
}

/**
 * Maps a Firebase Auth error to a user-friendly message.
 * Returns `null` for errors that should be silently ignored (e.g., cancelled popup).
 */
export function getAuthErrorMessage(error: unknown): string | null {
  if (!isFirebaseAuthError(error)) {
    log.error('Non-Firebase auth error:', error)
    return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
  }

  if (SILENT_ERROR_CODES.has(error.code)) {
    log.debug('Silently ignoring auth error:', error.code)
    return null
  }

  const friendlyMessage = AUTH_ERROR_MESSAGES[error.code]
  if (friendlyMessage) {
    log.debug('Auth error:', error.code, '→', friendlyMessage)
    return friendlyMessage
  }

  log.warn('Unhandled auth error code:', error.code, error.message)
  return 'Something went wrong. Please try again.'
}
