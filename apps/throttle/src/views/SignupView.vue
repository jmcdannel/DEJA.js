<script setup lang="ts">
import { Signup } from '@repo/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

function handleSignup() {
  router.push({ name: 'home' })
}

function handleNavigateLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="fill-height">
    <Signup
      @signup="handleSignup"
      @navigate-login="handleNavigateLogin"
    />
  </div>
</template>
