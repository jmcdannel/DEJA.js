<script setup lang="ts">
import { Signup } from '@repo/auth'
import { useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { useUserProfile, useLayout } from '@repo/modules'
import { useStorage } from '@vueuse/core'

const router = useRouter()
const user = useCurrentUser()
const { createUserProfile, addLayoutToProfile } = useUserProfile()
const { createLayout } = useLayout()
const storedLayoutId = useStorage('@DEJA/layoutId', '')

async function handleSignup(layoutId: string) {
  if (user.value) {
    await createUserProfile(user.value.uid, {
      uid: user.value.uid,
      displayName: user.value.displayName || '',
      email: user.value.email || '',
      photoURL: user.value.photoURL,
      layoutIds: [layoutId],
      onboardingComplete: false,
    })
    await createLayout(layoutId, { id: layoutId, name: layoutId })
    await addLayoutToProfile(user.value.uid, layoutId)
    storedLayoutId.value = layoutId
  }
  router.push({ name: 'pending-approval' })
}

function handleNavigateLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <Signup @signup="handleSignup" @navigate-login="handleNavigateLogin" />
</template>
