<script setup lang="ts">
import { ref } from 'vue'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'
import { Logo } from '@repo/ui'
import { getAuthErrorMessage } from './errors'

const emit = defineEmits<{
  'navigate-login': []
}>()

const auth = useFirebaseAuth()
const email = ref('')
const sent = ref(false)
const error = ref<string | null>(null)
const loading = ref(false)

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
]

async function handleReset() {
  if (!auth) return
  loading.value = true
  error.value = null
  try {
    await sendPasswordResetEmail(auth, email.value)
    sent.value = true
  } catch (err: unknown) {
    const message = getAuthErrorMessage(err)
    if (message !== null) {
      error.value = message
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Header -->
      <div class="flex flex-col items-center mb-8">
        <Logo size="xl" :show-icon="true" class="mb-2" />
        <p class="text-slate-400 text-sm">Reset your password</p>
      </div>

      <div class="auth-card">
        <template v-if="!sent">
          <v-alert
            v-if="error"
            type="error"
            class="mb-4"
            closable
            density="compact"
            @click:close="error = null"
          >
            {{ error }}
          </v-alert>

          <div class="text-center mb-6">
            <v-icon size="48" color="primary" class="mb-3">mdi-lock-reset</v-icon>
            <p class="text-slate-400 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <v-form @submit.prevent="handleReset">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              variant="outlined"
              density="comfortable"
              :rules="emailRules"
              class="mb-4"
            />
            <v-btn
              type="submit"
              :loading="loading"
              color="primary"
              size="large"
              block
              class="text-none font-weight-bold"
            >
              Send Reset Link
            </v-btn>
          </v-form>
        </template>

        <template v-else>
          <div class="text-center">
            <v-icon size="64" color="success" class="mb-4">mdi-email-check-outline</v-icon>
            <h2 class="text-h5 font-weight-bold text-sky-100 mb-2">Check Your Email</h2>
            <p class="text-slate-400 text-sm mb-2">
              We've sent a password reset link to
            </p>
            <p class="text-sky-300 font-weight-medium mb-4">{{ email }}</p>
          </div>
        </template>

        <div class="text-center mt-6">
          <v-btn
            variant="text"
            color="primary"
            class="text-none"
            prepend-icon="mdi-arrow-left"
            @click="emit('navigate-login')"
          >
            Back to sign in
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.auth-container {
  width: 100%;
  max-width: 420px;
}
.auth-card {
  position: relative;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid transparent;
  background-clip: padding-box;
}
.auth-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 17px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(148, 163, 184, 0.1) 40%, rgba(20, 184, 166, 0.2));
  z-index: -1;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 1px;
}
</style>
