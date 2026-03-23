import { ref, computed } from 'vue'
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  linkWithCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  type AuthProvider,
  type OAuthCredential,
  type UserCredential,
} from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'
import { createLogger } from '@repo/utils'
import { getAuthErrorMessage, isFirebaseAuthError } from './errors'
import { syncUserProfile } from './syncUserProfile'

const log = createLogger('Auth')

export type ProviderName = 'google' | 'github' | 'facebook' | 'apple' | 'microsoft'

const STORAGE_KEY = '@DEJA/pendingLinkCredential'

function createProviders(): Record<ProviderName, AuthProvider> {
  return {
    google: new GoogleAuthProvider(),
    github: new GithubAuthProvider(),
    facebook: new FacebookAuthProvider(),
    apple: new OAuthProvider('apple.com'),
    microsoft: new OAuthProvider('microsoft.com'),
  }
}

/**
 * Detect environments where popups are unreliable (iOS Safari, Samsung Internet, PWAs).
 */
function shouldUseRedirect(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isSamsungBrowser = /SamsungBrowser/.test(ua)
  const isStandalone =
    typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
  return isIOS || isSamsungBrowser || isStandalone
}

/**
 * Extract an OAuthCredential from a Firebase error for account linking.
 */
function credentialFromError(error: unknown): OAuthCredential | null {
  try {
    return (
      GoogleAuthProvider.credentialFromError(error as Parameters<typeof GoogleAuthProvider.credentialFromError>[0]) ??
      GithubAuthProvider.credentialFromError(error as Parameters<typeof GithubAuthProvider.credentialFromError>[0]) ??
      FacebookAuthProvider.credentialFromError(error as Parameters<typeof FacebookAuthProvider.credentialFromError>[0]) ??
      OAuthProvider.credentialFromError(error as Parameters<typeof OAuthProvider.credentialFromError>[0]) ??
      null
    )
  } catch {
    return null
  }
}

export function useAuthProvider() {
  const auth = useFirebaseAuth()
  const providers = createProviders()

  const loadingProvider = ref<ProviderName | null>(null)
  const loading = computed(() => loadingProvider.value !== null)
  const error = ref<string | null>(null)

  // Account linking state
  const pendingCredential = ref<OAuthCredential | null>(null)
  const pendingEmail = ref<string | null>(null)
  const showLinkDialog = ref(false)

  function clearError() {
    error.value = null
  }

  function handleSuccess(result: UserCredential) {
    log.debug('Auth success:', result.user.uid)
    // 🔄 Sync profile in background — don't block the login flow
    syncUserProfile(result.user)
  }

  function handleError(err: unknown): void {
    if (isFirebaseAuthError(err) && err.code === 'auth/account-exists-with-different-credential') {
      // 🔗 Account linking flow
      const credential = credentialFromError(err)
      const email = (err.customData?.email as string) ?? null
      if (credential) {
        pendingCredential.value = credential
        pendingEmail.value = email
        showLinkDialog.value = true
        log.debug('Account linking required for:', email)
        return
      }
    }

    const message = getAuthErrorMessage(err)
    if (message !== null) {
      error.value = message
    }
  }

  /**
   * Sign in with an OAuth provider. Automatically falls back to redirect on mobile
   * or when popups are blocked.
   */
  async function signInWithProvider(providerName: ProviderName): Promise<UserCredential | null> {
    if (!auth) return null
    const provider = providers[providerName]
    if (!provider) return null

    loadingProvider.value = providerName
    error.value = null

    try {
      if (shouldUseRedirect()) {
        // 📱 Mobile/PWA — use redirect directly
        persistPendingCredential()
        await signInWithRedirect(auth, provider)
        return null // Page will reload
      }

      // 🖥️ Desktop — try popup first
      const result = await signInWithPopup(auth, provider)
      handleSuccess(result)
      return result
    } catch (err: unknown) {
      // If popup was blocked, fall back to redirect
      if (isFirebaseAuthError(err) && err.code === 'auth/popup-blocked') {
        log.debug('Popup blocked, falling back to redirect')
        try {
          persistPendingCredential()
          await signInWithRedirect(auth, provider)
          return null // Page will reload
        } catch (redirectErr) {
          handleError(redirectErr)
          return null
        }
      }

      handleError(err)
      return null
    } finally {
      loadingProvider.value = null
    }
  }

  /**
   * Process the result of a redirect-based sign-in. Call this in `onMounted`.
   */
  async function handleRedirectResult(): Promise<UserCredential | null> {
    if (!auth) return null

    try {
      // Check for stored pending credential (from pre-redirect account linking)
      const storedCredential = restorePendingCredential()

      const result = await getRedirectResult(auth)
      if (!result) return null

      // If we had a pending link credential, complete the linking
      if (storedCredential && auth.currentUser) {
        try {
          await linkWithCredential(auth.currentUser, storedCredential)
          log.debug('Account linked after redirect')
        } catch (linkErr) {
          log.error('Failed to link after redirect:', linkErr)
          // Don't block — the user is still signed in
        }
      }

      handleSuccess(result)
      return result
    } catch (err: unknown) {
      handleError(err)
      return null
    }
  }

  /**
   * Complete account linking by signing in with an existing provider, then linking
   * the pending credential. Used by AccountLinkingDialog.
   */
  async function linkWithProvider(providerName: ProviderName): Promise<boolean> {
    if (!auth || !pendingCredential.value) return false
    const provider = providers[providerName]
    if (!provider) return false

    loadingProvider.value = providerName
    error.value = null

    try {
      let result: UserCredential

      if (shouldUseRedirect()) {
        // Store credential for post-redirect linking
        persistPendingCredential()
        await signInWithRedirect(auth, provider)
        return false // Page will reload
      }

      result = await signInWithPopup(auth, provider)
      await linkWithCredential(result.user, pendingCredential.value)

      log.debug('Account linked successfully')
      pendingCredential.value = null
      pendingEmail.value = null
      showLinkDialog.value = false
      handleSuccess(result)
      return true
    } catch (err: unknown) {
      handleError(err)
      return false
    } finally {
      loadingProvider.value = null
    }
  }

  function dismissLinkDialog() {
    showLinkDialog.value = false
    pendingCredential.value = null
    pendingEmail.value = null
  }

  // SessionStorage helpers for redirect-based linking
  function persistPendingCredential() {
    if (pendingCredential.value) {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            providerId: pendingCredential.value.providerId,
            idToken: pendingCredential.value.idToken,
            accessToken: pendingCredential.value.accessToken,
          }),
        )
      } catch {
        log.warn('Failed to persist pending credential to sessionStorage')
      }
    }
  }

  function restorePendingCredential(): OAuthCredential | null {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      sessionStorage.removeItem(STORAGE_KEY)
      if (!stored) return null

      const data = JSON.parse(stored) as {
        providerId: string
        idToken?: string
        accessToken?: string
      }

      const provider = new OAuthProvider(data.providerId)
      return provider.credential({
        idToken: data.idToken,
        accessToken: data.accessToken,
      })
    } catch {
      return null
    }
  }

  return {
    // 🎬 Actions
    signInWithProvider,
    handleRedirectResult,
    linkWithProvider,
    dismissLinkDialog,
    clearError,

    // 📊 State
    loading,
    loadingProvider,
    error,

    // 🔗 Account linking
    pendingCredential,
    pendingEmail,
    showLinkDialog,
  }
}
