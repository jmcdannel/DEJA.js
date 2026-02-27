<script setup lang="ts">
import { Signup } from '@repo/auth'
import { useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { useUserProfile } from '@repo/modules'

const router = useRouter()
const user = useCurrentUser()
const { createUserProfile } = useUserProfile()

async function handleSignup() {
  if (user.value) {
    await createUserProfile(user.value.uid, {
      uid: user.value.uid,
      displayName: user.value.displayName || '',
      email: user.value.email || '',
      photoURL: user.value.photoURL,
      layoutIds: [],
      onboardingComplete: false,
    })
  }
  router.push({ name: 'onboarding' })
}

function handleNavigateLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <Signup @signup="handleSignup" @navigate-login="handleNavigateLogin" />
</template>
