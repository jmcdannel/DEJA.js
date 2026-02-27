import { doc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useDocument } from 'vuefire'
import type { UserProfile } from './types'

export function useUserProfile() {
  function getUserProfile(uid: string) {
    return useDocument<UserProfile>(doc(db, 'users', uid))
  }

  async function createUserProfile(uid: string, data: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }

  async function markOnboardingComplete(uid: string) {
    await updateUserProfile(uid, { onboardingComplete: true })
  }

  async function addLayoutToProfile(uid: string, layoutId: string) {
    await setDoc(doc(db, 'users', uid), {
      layoutIds: arrayUnion(layoutId),
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }

  return {
    getUserProfile,
    createUserProfile,
    updateUserProfile,
    markOnboardingComplete,
    addLayoutToProfile,
  }
}

export default useUserProfile
