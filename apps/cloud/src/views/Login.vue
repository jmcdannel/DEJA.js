<script setup lang="ts">
import { Login } from '@repo/auth'
import { useRouter } from 'vue-router'
const router = useRouter()

function handleAuth() {
  router.push({ name: 'home' })
}

function handleNavigateSignup() {
  router.push({ name: 'signup' })
}

function handleNavigateForgotPassword() {
  router.push({ name: 'forgot-password' })
}
</script>

<template>
  <Login
    @auth="handleAuth"
    @navigate-signup="handleNavigateSignup"
    @navigate-forgot-password="handleNavigateForgotPassword"
  />
</template> 