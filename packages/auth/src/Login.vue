<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getRedirectResult,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth'
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import { createLogger } from '@repo/utils'
import { Logo } from '@repo/ui'

const googleAuthProvider = new GoogleAuthProvider()
const githubAuthProvider = new GithubAuthProvider()

const log = createLogger('Auth')

const emit = defineEmits<{
  auth: []
  'navigate-signup': []
  'navigate-forgot-password': []
}>()

const auth = useFirebaseAuth()
const user = useCurrentUser()
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const emailLoading = ref(false)
const googleLoading = ref(false)
const githubLoading = ref(false)

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
]

const passwordRules = [(v: string) => !!v || 'Password is required']

async function handleGoogleSignin() {
  if (!auth) return
  googleLoading.value = true
  error.value = null
  try {
    const resp = await signInWithPopup(auth, googleAuthProvider)
    log.debug('Google signin success', resp)
    emit('auth')
  } catch (err: unknown) {
    const firebaseErr = err as { message?: string }
    log.error('Failed Google signin', firebaseErr)
    error.value = firebaseErr.message ?? 'Google sign-in failed'
  } finally {
    googleLoading.value = false
  }
}

async function handleGithubSignin() {
  if (!auth) return
  githubLoading.value = true
  error.value = null
  try {
    const resp = await signInWithPopup(auth, githubAuthProvider)
    log.debug('Github signin success', resp)
    emit('auth')
  } catch (err: unknown) {
    const firebaseErr = err as { message?: string }
    log.error('Failed Github signin', firebaseErr)
    error.value = firebaseErr.message ?? 'GitHub sign-in failed'
  } finally {
    githubLoading.value = false
  }
}

async function handleEmailSignin() {
  if (!auth) return
  emailLoading.value = true
  error.value = null
  try {
    const cred = await signInWithEmailAndPassword(auth, email.value, password.value)
    log.debug('Email signin success', cred.user)
    emit('auth')
  } catch (err: unknown) {
    const firebaseErr = err as { code?: string; message?: string }
    log.error('Failed email signin', firebaseErr.code, firebaseErr.message)
    error.value = firebaseErr.message ?? 'Sign-in failed'
  } finally {
    emailLoading.value = false
  }
}

onMounted(() => {
  if (!auth) return
  getRedirectResult(auth).catch((reason: unknown) => {
    const firebaseErr = reason as { message?: string }
    log.error('Failed redirect result', firebaseErr)
    error.value = firebaseErr.message ?? 'Redirect sign-in failed'
  })
})
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
            <Logo variant="cloud" app-name="Cloud" class="mb-4 transform scale-150" />
            <h1 class="text-4xl font-bold mt-4 mb-2">DEJA.js</h1>
            <p class="text-xl opacity-90 mb-10 font-medium">The modren DCC platform</p>
            <div class="flex gap-8 mb-8 opacity-60">
              <Logo variant="throttle" app-name="" />
              <Logo variant="monitor" app-name="" />
            </div>
          </div>
        </div>
      </v-col>

      <!-- Auth Form -->
      <v-col cols="12" md="7" class="d-flex align-center justify-center">
        <div class="w-full max-w-md px-6 py-8">
          <!-- Mobile branding header -->
          <div class="d-md-none flex flex-col items-center text-center mb-8">
            <Logo variant="cloud" app-name="Cloud" class="mb-2" />
          </div>

          <template v-if="user">
            <v-alert type="success" class="mb-4"> Sign in successful </v-alert>
          </template>

          <template v-else>
            <h2 class="text-h4 font-weight-bold mb-2">Welcome Back</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">Sign in to your control room</p>

            <v-alert
              v-if="error"
              type="error"
              class="mb-4"
              closable
              @click:close="error = null"
            >
              {{ error }}
            </v-alert>

            <!-- Social Auth -->
            <div class="flex flex-col gap-3 mb-6">
              <v-btn
                :loading="googleLoading"
                :disabled="githubLoading || emailLoading"
                prepend-icon="mdi-google"
                variant="outlined"
                size="large"
                block
                class="text-none"
                @click="handleGoogleSignin"
              >
                Continue with Google
              </v-btn>
              <v-btn
                :loading="githubLoading"
                :disabled="googleLoading || emailLoading"
                prepend-icon="mdi-github"
                variant="outlined"
                size="large"
                block
                class="text-none"
                @click="handleGithubSignin"
              >
                Continue with GitHub
              </v-btn>
            </div>

            <!-- Divider -->
            <div class="flex items-center gap-4 my-6">
              <v-divider />
              <span class="text-body-2 text-medium-emphasis whitespace-nowrap"
                >or continue with email</span
              >
              <v-divider />
            </div>

            <!-- Email Form -->
            <v-form @submit.prevent="handleEmailSignin">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                variant="outlined"
                :rules="emailRules"
                class="mb-2"
              />
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                variant="outlined"
                :rules="passwordRules"
              />
              <div class="flex justify-end mb-4">
                <v-btn
                  variant="text"
                  size="small"
                  class="text-none"
                  @click="emit('navigate-forgot-password')"
                >
                  Forgot password?
                </v-btn>
              </div>
              <v-btn
                type="submit"
                :loading="emailLoading"
                :disabled="googleLoading || githubLoading"
                color="primary"
                size="large"
                block
                elevation="2"
                class="text-none mb-4 font-weight-bold text-h6"
              >
                Sign In
              </v-btn>
            </v-form>

            <div class="text-center">
              <span class="text-body-2">Don't have an account?</span>
              <v-btn
                variant="text"
                color="primary"
                class="text-none"
                @click="emit('navigate-signup')"
              >
                Sign up
              </v-btn>
            </div>
          </template>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.auth-branding-panel {
  background: linear-gradient(135deg, #09090b 0%, #18181b 50%, #000000 100%);
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
