<script setup lang="ts">
import { Login } from '@repo/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

function handleAuth() {
  router.push({ name: 'home' })
}

function handleNavigateSignup() {
  router.push({ name: 'home' })
}

function handleNavigateForgotPassword() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="fill-height">
    <Login
      @auth="handleAuth"
      @navigate-signup="handleNavigateSignup"
      @navigate-forgot-password="handleNavigateForgotPassword"
    />
  </div>
</template>
