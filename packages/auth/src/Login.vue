<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  getRedirectResult,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from 'firebase/auth'
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import { createLogger } from '@repo/utils'
import { Logo } from '@repo/ui'
import { useDemoAuth } from './useDemoAuth'

const googleAuthProvider = new GoogleAuthProvider()
const githubAuthProvider = new GithubAuthProvider()
const facebookAuthProvider = new FacebookAuthProvider()
const appleAuthProvider = new OAuthProvider('apple.com')
const microsoftAuthProvider = new OAuthProvider('microsoft.com')

const log = createLogger('Auth')

const emit = defineEmits<{
  auth: []
  'navigate-signup': []
  'navigate-forgot-password': []
}>()

const props = defineProps<{
  showTryDemo?: boolean
}>()

const auth = useFirebaseAuth()
const user = useCurrentUser()
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const emailLoading = ref(false)
const googleLoading = ref(false)
const githubLoading = ref(false)
const facebookLoading = ref(false)
const showEmailForm = ref(true)

const appleLoading = ref(false)
const microsoftLoading = ref(false)

const anyLoading = computed(() => emailLoading.value || googleLoading.value || githubLoading.value || facebookLoading.value || appleLoading.value || microsoftLoading.value)

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
]

const passwordRules = [(v: string) => !!v || 'Password is required']

const { signInAsDemo, isLoading: isDemoLoading, error: demoError } = useDemoAuth()

async function handleDemoLogin() {
  const success = await signInAsDemo()
  if (success) {
    emit('auth')
  }
}

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

async function handleFacebookSignin() {
  if (!auth) return
  facebookLoading.value = true
  error.value = null
  try {
    const resp = await signInWithPopup(auth, facebookAuthProvider)
    log.debug('Facebook signin success', resp)
    emit('auth')
  } catch (err: unknown) {
    const firebaseErr = err as { message?: string }
    log.error('Failed Facebook signin', firebaseErr)
    error.value = firebaseErr.message ?? 'Facebook sign-in failed'
  } finally {
    facebookLoading.value = false
  }
}

async function handleAppleSignin() {
  if (!auth) return
  appleLoading.value = true
  error.value = null
  try {
    const resp = await signInWithPopup(auth, appleAuthProvider)
    log.debug('Apple signin success', resp)
    emit('auth')
  } catch (err: unknown) {
    const firebaseErr = err as { message?: string }
    log.error('Failed Apple signin', firebaseErr)
    error.value = firebaseErr.message ?? 'Apple sign-in failed'
  } finally {
    appleLoading.value = false
  }
}

async function handleMicrosoftSignin() {
  if (!auth) return
  microsoftLoading.value = true
  error.value = null
  try {
    const resp = await signInWithPopup(auth, microsoftAuthProvider)
    log.debug('Microsoft signin success', resp)
    emit('auth')
  } catch (err: unknown) {
    const firebaseErr = err as { message?: string }
    log.error('Failed Microsoft signin', firebaseErr)
    error.value = firebaseErr.message ?? 'Microsoft sign-in failed'
  } finally {
    microsoftLoading.value = false
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
  <div class="auth-page">
    <div class="auth-container">
      <!-- Header -->
      <div class="flex flex-col items-center mb-8">
        <Logo size="xl" :show-icon="true" class="mb-2" />
        <p class="text-slate-400 text-sm">Sign in to your control room</p>
      </div>

      <div class="auth-card">
        <template v-if="user">
          <v-alert type="success" class="mb-4">Sign in successful</v-alert>
        </template>

        <template v-else>
          <h2 class="text-2xl font-semibold text-sky-100 text-center mb-4">Sign In</h2>
          <div class="text-center mb-5">
            <span class="text-body-2 text-slate-400">Don't have an account?</span>
            <v-btn
              variant="text"
              color="primary"
              class="text-none"
              @click="emit('navigate-signup')"
            >
              Sign up
            </v-btn>
          </div>

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

          <!-- Social Auth -->
          <div class="flex flex-col gap-3 mb-6">
            <button class="social-btn" :disabled="anyLoading" @click="handleGoogleSignin">
              <svg class="social-icon" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span>Continue with Google</span>
            </button>
            <button class="social-btn" :disabled="anyLoading" @click="handleGithubSignin">
              <svg class="social-icon" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="#ffffff"/></svg>
              <span>Continue with GitHub</span>
            </button>
            <button class="social-btn" :disabled="anyLoading" @click="handleFacebookSignin">
              <svg class="social-icon" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/></svg>
              <span>Continue with Facebook</span>
            </button>
            <button class="social-btn" :disabled="anyLoading" @click="handleAppleSignin">
              <svg class="social-icon" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#ffffff"/></svg>
              <span>Continue with Apple</span>
            </button>
            <button class="social-btn" :disabled="anyLoading" @click="handleMicrosoftSignin">
              <svg class="social-icon" viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>
              <span>Continue with Microsoft</span>
            </button>
          </div>

          <!-- Email toggle -->
          <button
            v-if="!showEmailForm"
            class="email-toggle"
            @click="showEmailForm = true"
          >
            <v-icon size="small" class="mr-1">mdi-email-outline</v-icon>
            Sign in with email
          </button>

          <!-- Email Form -->
          <template v-if="showEmailForm">
            <div class="divider-line my-5" />
            <v-form @submit.prevent="handleEmailSignin">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                variant="outlined"
                density="comfortable"
                :rules="emailRules"
                class="mb-2"
              />
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                variant="outlined"
                density="comfortable"
                :rules="passwordRules"
              />
              <div class="flex justify-end mb-3">
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
                :disabled="anyLoading && !emailLoading"
                color="primary"
                size="large"
                block
                class="text-none font-weight-bold"
              >
                Sign In
              </v-btn>
            </v-form>
          </template>

          <!-- Try Demo -->
          <v-divider v-if="props.showTryDemo" class="my-4" />
          <v-btn
            v-if="props.showTryDemo"
            variant="outlined"
            color="secondary"
            size="large"
            block
            :loading="isDemoLoading"
            @click="handleDemoLogin"
          >
            🚂 Try Demo
          </v-btn>
          <v-alert
            v-if="demoError"
            type="error"
            density="compact"
            class="mt-2"
          >
            {{ demoError }}
          </v-alert>
        </template>

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

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.4);
  color: #e0f2fe;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}
.social-btn:hover:not(:disabled) {
  border-color: rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.7);
}
.social-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.social-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.email-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  background: transparent;
  border: none;
  color: rgba(148, 163, 184, 0.6);
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.2s;
}
.email-toggle:hover {
  color: #38bdf8;
}

.divider-line {
  height: 1px;
  background: rgba(148, 163, 184, 0.12);
}
</style>
