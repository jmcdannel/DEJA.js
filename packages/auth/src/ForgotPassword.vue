<script setup lang="ts">
import { ref } from 'vue'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'

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
    const firebaseErr = err as { message?: string }
    error.value = firebaseErr.message ?? 'Failed to send reset email'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Branding Panel - hidden on mobile -->
      <v-col cols="12" md="5" class="d-none d-md-flex">
        <div
          class="auth-branding-panel w-full h-full flex flex-col items-center justify-center text-white relative overflow-hidden"
        >
          <div class="auth-branding-overlay absolute inset-0"></div>
          <div class="relative z-10 flex flex-col items-center text-center px-8">
            <v-icon size="80" color="white" class="mb-4">mdi-train</v-icon>
            <h1 class="text-4xl font-bold mb-2">DEJA.js</h1>
            <p class="text-lg opacity-80 mb-8">Model Railroad Control System</p>
            <div class="flex gap-4 mb-8 opacity-40">
              <v-icon size="24" color="white">mdi-signal-variant</v-icon>
              <v-icon size="24" color="white">mdi-railroad-light</v-icon>
              <v-icon size="24" color="white">mdi-swap-horizontal</v-icon>
            </div>
            <p class="text-md opacity-60 italic">"All Aboard! Take command of your layout."</p>
          </div>
        </div>
      </v-col>

      <!-- Reset Form -->
      <v-col cols="12" md="7" class="d-flex align-center justify-center">
        <div class="w-full max-w-md px-6 py-8">
          <!-- Mobile branding header -->
          <div class="d-md-none text-center mb-6">
            <v-icon size="48" color="primary">mdi-train</v-icon>
            <h2 class="text-2xl font-bold mt-2">DEJA.js</h2>
          </div>

          <template v-if="!sent">
            <h2 class="text-h4 font-weight-bold mb-2">Reset Password</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <v-alert
              v-if="error"
              type="error"
              class="mb-4"
              closable
              @click:close="error = null"
            >
              {{ error }}
            </v-alert>

            <v-form @submit.prevent="handleReset">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                variant="outlined"
                :rules="emailRules"
                class="mb-4"
              />
              <v-btn
                type="submit"
                :loading="loading"
                color="primary"
                size="large"
                block
                class="text-none mb-4"
              >
                Send Reset Link
              </v-btn>
            </v-form>
          </template>

          <template v-else>
            <div class="text-center">
              <v-icon size="64" color="success" class="mb-4">mdi-email-check-outline</v-icon>
              <h2 class="text-h4 font-weight-bold mb-2">Check Your Email</h2>
              <p class="text-body-1 text-medium-emphasis mb-6">
                We've sent a password reset link to <strong>{{ email }}</strong>.
              </p>
            </div>
          </template>

          <div class="text-center">
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
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.auth-branding-panel {
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #006064 100%);
  background-size: 200% 200%;
  animation: auth-gradient-shift 8s ease infinite;
}

@keyframes auth-gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.auth-branding-overlay {
  background-image: radial-gradient(
      circle at 20% 80%,
      rgba(255, 255, 255, 0.06) 0%,
      transparent 50%
    ),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.04) 0%, transparent 50%);
}
</style>
