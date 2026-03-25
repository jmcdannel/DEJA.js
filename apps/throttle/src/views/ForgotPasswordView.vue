<script setup lang="ts">
import { ForgotPassword } from '@repo/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

function handleNavigateLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="fill-height">
    <ForgotPassword
      @navigate-login="handleNavigateLogin"
    />
  </div>
</template>
