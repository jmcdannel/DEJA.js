<script setup lang="ts">
import { Signup } from '@repo/auth'
import { DejaTracker } from '@repo/ui'
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
  <div class="fill-height">
    <div class="tracker-container mx-auto pt-8 mb-0">
      <DejaTracker :active-step="0" compact />
    </div>
    <Signup @signup="handleSignup" @navigate-login="handleNavigateLogin" />
  </div>
</template>

<style scoped>
.tracker-container {
  max-width: 700px;
  padding-bottom: 0;
}
</style>
