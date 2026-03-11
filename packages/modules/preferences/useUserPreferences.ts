import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCurrentUser, useDocument } from 'vuefire'
import { db } from '@repo/firebase-config'
import { createLogger } from '@repo/utils'
import type { UserPreferences, AppBackgroundPrefs } from './types'

const log = createLogger('UserPreferences')

const DEFAULT_BACKGROUND_PREFS: AppBackgroundPrefs = {
  default: 'none',
  pages: {},
}

export function useUserPreferences() {
  const user = useCurrentUser()

  const localCache = useStorage<UserPreferences | null>(
    '@DEJA/userPreferences',
    null,
  )

  const userDocRef = computed(() =>
    user.value?.uid ? doc(db, 'users', user.value.uid) : null,
  )

  const firestorePrefs = useDocument<UserPreferences>(userDocRef)

  const isLoaded = computed(() => firestorePrefs.value !== undefined)

  const preferences: ComputedRef<UserPreferences | null> = computed(() => {
    if (firestorePrefs.value) {
      return firestorePrefs.value
    }
    return localCache.value
  })

  // Sync Firestore → localStorage cache (strip non-serializable fields like Timestamp)
  watch(firestorePrefs, (newVal) => {
    if (newVal) {
      const { updatedAt, ...serializable } = newVal as UserPreferences & Record<string, unknown>
      localCache.value = serializable as UserPreferences
    }
  })

  // Generic preference access
  function getPreference<T>(key: string, defaultValue: T): ComputedRef<T> {
    return computed(() => {
      if (!preferences.value) return defaultValue
      const val = (preferences.value as unknown as Record<string, unknown>)[key]
      return (val as T) ?? defaultValue
    })
  }

  async function setPreference(
    key: string,
    value: unknown,
  ): Promise<void> {
    if (!user.value?.uid) {
      log.warn('Cannot save preference: user not authenticated')
      return
    }

    const update = {
      [key]: value,
      updatedAt: serverTimestamp(),
    }

    // Optimistic local update
    localCache.value = {
      ...localCache.value,
      [key]: value,
    } as UserPreferences

    try {
      await setDoc(doc(db, 'users', user.value.uid), update, { merge: true })
    } catch (e) {
      log.error('Error saving preference:', e)
    }
  }

  // Background-specific methods
  function getBackground(
    appName: string,
    routePath: string,
  ): ComputedRef<string> {
    return computed(() => {
      const appPrefs = preferences.value?.backgrounds?.[appName]
      if (!appPrefs) return 'none'
      return appPrefs.pages[routePath] ?? appPrefs.default ?? 'none'
    })
  }

  async function setAppBackground(
    appName: string,
    backgroundId: string,
  ): Promise<void> {
    if (!user.value?.uid) {
      log.warn('Cannot save background: user not authenticated')
      return
    }

    const currentAppPrefs =
      preferences.value?.backgrounds?.[appName] ?? DEFAULT_BACKGROUND_PREFS

    const update = {
      backgrounds: {
        ...preferences.value?.backgrounds,
        [appName]: {
          ...currentAppPrefs,
          default: backgroundId,
        },
      },
      updatedAt: serverTimestamp(),
    }

    // Optimistic local update
    localCache.value = {
      ...localCache.value,
      backgrounds: update.backgrounds,
    } as UserPreferences

    try {
      await setDoc(doc(db, 'users', user.value.uid), update, { merge: true })
    } catch (e) {
      log.error('Error saving app background:', e)
    }
  }

  async function setPageBackground(
    appName: string,
    routePath: string,
    backgroundId: string,
  ): Promise<void> {
    if (!user.value?.uid) {
      log.warn('Cannot save page background: user not authenticated')
      return
    }

    const currentAppPrefs =
      preferences.value?.backgrounds?.[appName] ?? DEFAULT_BACKGROUND_PREFS

    const update = {
      backgrounds: {
        ...preferences.value?.backgrounds,
        [appName]: {
          ...currentAppPrefs,
          pages: {
            ...currentAppPrefs.pages,
            [routePath]: backgroundId,
          },
        },
      },
      updatedAt: serverTimestamp(),
    }

    localCache.value = {
      ...localCache.value,
      backgrounds: update.backgrounds,
    } as UserPreferences

    try {
      await setDoc(doc(db, 'users', user.value.uid), update, { merge: true })
    } catch (e) {
      log.error('Error saving page background:', e)
    }
  }

  async function clearPageBackground(
    appName: string,
    routePath: string,
  ): Promise<void> {
    if (!user.value?.uid) {
      log.warn('Cannot clear page background: user not authenticated')
      return
    }

    const currentAppPrefs =
      preferences.value?.backgrounds?.[appName] ?? DEFAULT_BACKGROUND_PREFS

    const { [routePath]: _, ...remainingPages } = currentAppPrefs.pages

    const update = {
      backgrounds: {
        ...preferences.value?.backgrounds,
        [appName]: {
          ...currentAppPrefs,
          pages: remainingPages,
        },
      },
      updatedAt: serverTimestamp(),
    }

    localCache.value = {
      ...localCache.value,
      backgrounds: update.backgrounds,
    } as UserPreferences

    try {
      await setDoc(doc(db, 'users', user.value.uid), update, { merge: true })
    } catch (e) {
      log.error('Error clearing page background:', e)
    }
  }

  return {
    preferences,
    isLoaded,
    getPreference,
    setPreference,
    getBackground,
    setAppBackground,
    setPageBackground,
    clearPageBackground,
  }
}

export default useUserPreferences
