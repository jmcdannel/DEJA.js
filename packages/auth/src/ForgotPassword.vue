<script setup lang="ts">
import { ref } from 'vue'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'

defineEmits<{
  'navigate-login': []
}>()

const auth = useFirebaseAuth()
const email = ref('')
const sent = ref(false)
const error = ref<string | null>(null)
const loading = ref(false)

async function handleReset() {
  if (!auth) return
  loading.value = true
  error.value = null
  try {
    await sendPasswordResetEmail(auth, email.value)
    sent.value = true
  } catch (err: unknown) {
    const firebaseErr = err as { message?: string }
    error.value = firebaseErr.message || 'Failed to send reset email'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="w-full flex justify-center">
    <v-card elevation="2" class="pa-2 bg-transparent w-full">
      <v-card-title class="text-h6">Reset your password</v-card-title>
      <v-card-text v-if="!sent">
        <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = null">
          {{ error }}
        </v-alert>
        <p class="mb-4">Enter your email address and we'll send you a link to reset your password.</p>
        <v-form v-slot="{ isValid }">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            :rules="[
              (v: string) => !!v || 'Email is required',
              (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
            ]"
            required
          />
          <v-btn @click="handleReset" :disabled="!isValid" :loading="loading" color="primary" block class="mt-4">
            Send Reset Link
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-text v-else>
        <v-alert type="success">Check your email for a password reset link.</v-alert>
      </v-card-text>
      <v-card-text class="text-center">
        <v-btn variant="text" color="primary" @click="$emit('navigate-login')">Back to login</v-btn>
      </v-card-text>
    </v-card>
  </section>
</template>
