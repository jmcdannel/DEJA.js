import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import type { FirebaseApp } from 'firebase/app'

/**
 * Initialize Firebase App Check with reCAPTCHA v3.
 * Only activates when VITE_FIREBASE_APPCHECK_KEY is set.
 * Uses debug provider in development mode.
 */
export function initAppCheck(app: FirebaseApp): void {
  const siteKey = import.meta.env.VITE_FIREBASE_APPCHECK_KEY

  if (!siteKey) {
    return
  }

  // Enable debug provider for local development
  if (import.meta.env.DEV) {
    // @ts-expect-error -- Firebase App Check debug token global
    self.FIREBASE_APPCHECK_DEBUG_TOKEN =
      import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN || true
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  })
}
