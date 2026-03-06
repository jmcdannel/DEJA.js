<script setup lang="ts">
import { Signup } from '@repo/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

function handleSignup() {
  router.push({ name: 'onboarding' })
}

function handleNavigateLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <Signup @signup="handleSignup" @navigate-login="handleNavigateLogin" />
</template>
