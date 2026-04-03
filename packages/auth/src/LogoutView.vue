<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { signOut } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'
import { createLogger } from '@repo/utils'

const log = createLogger('Auth')
const auth = useFirebaseAuth()

const signingOut = ref(true)
const error = ref(false)

onMounted(async () => {
  if (!auth) {
    signingOut.value = false
    return
  }
  try {
    await signOut(auth)
    log.debug('User signed out successfully')
  } catch (reason) {
    log.error('Failed signOut', reason)
    error.value = true
  } finally {
    signingOut.value = false
  }
})
</script>

<template>
  <div class="logout-container">
    <div class="logout-card">
      <!-- ⏳ Signing out -->
      <template v-if="signingOut">
        <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
        <p class="text-body-1 text-medium-emphasis">Signing out…</p>
      </template>

      <!-- ❌ Error -->
      <template v-else-if="error">
        <v-icon size="48" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
        <h2 class="text-h5 font-weight-bold mb-2">Something went wrong</h2>
        <p class="text-body-2 text-medium-emphasis mb-6">
          We couldn't sign you out. Please try again.
        </p>
        <v-btn color="primary" variant="tonal" to="/login" class="text-none">
          Back to Sign In
        </v-btn>
      </template>

      <!-- ✅ Success -->
      <template v-else>
        <v-icon size="48" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
        <h2 class="text-h5 font-weight-bold mb-2">You've been signed out</h2>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Thanks for using DEJA.js. See you next time! 🚂
        </p>
        <v-btn color="primary" variant="tonal" to="/login" class="text-none">
          <v-icon start>mdi-login</v-icon>
          Sign in again
        </v-btn>
      </template>
    </div>
  </div>
</template>

<style scoped>
.logout-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 24px;
}

.logout-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
}
</style>
