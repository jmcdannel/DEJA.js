<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  type User,
} from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'

const googleAuthProvider = new GoogleAuthProvider()
const githubAuthProvider = new GithubAuthProvider()

const emit = defineEmits<{
  signup: [user: User]
  'navigate-login': []
}>()

const auth = useFirebaseAuth()
const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref<string | null>(null)
const emailLoading = ref(false)
const googleLoading = ref(false)
const githubLoading = ref(false)

const displayNameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => v.length >= 2 || 'Name must be at least 2 characters',
]
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
]
const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
]
const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm your password',
  (v: string) => v === password.value || 'Passwords do not match',
]

const passwordStrength = computed(() => {
  const p = password.value
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score += 1
  if (p.length >= 12) score += 1
  if (/[A-Z]/.test(p)) score += 1
  if (/\d/.test(p)) score += 1
  if (/[^A-Za-z0-9]/.test(p)) score += 1
  return score
})

const passwordStrengthColor = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'error'
  if (s <= 2) return 'warning'
  if (s <= 3) return 'info'
  return 'success'
})

const passwordStrengthLabel = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'Weak'
  if (s <= 2) return 'Fair'
  if (s <= 3) return 'Good'
  return 'Strong'
})

async function handleEmailSignup() {
  if (!auth) return
  emailLoading.value = true
  error.value = null
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value, password.value)
    await updateProfile(cred.user, { displayName: displayName.value })
    emit('signup', cred.user)
  } catch (err: unknown) {
    const firebaseErr = err as { message?: string }
    error.value = firebaseErr.message ?? 'Signup failed'
  } finally {
    emailLoading.value = false
  }
}

async function handleGoogleSignup() {
  if (!auth) return
  googleLoading.value = true
  error.value = null
  try {
    const cred = await signInWithPopup(auth, googleAuthProvider)
    emit('signup', cred.user)
  } catch (err: unknown) {
    const firebaseErr = err as { message?: string }
    error.value = firebaseErr.message ?? 'Google signup failed'
  } finally {
    googleLoading.value = false
  }
}

async function handleGithubSignup() {
  if (!auth) return
  githubLoading.value = true
  error.value = null
  try {
    const cred = await signInWithPopup(auth, githubAuthProvider)
    emit('signup', cred.user)
  } catch (err: unknown) {
    const firebaseErr = err as { message?: string }
    error.value = firebaseErr.message ?? 'GitHub signup failed'
  } finally {
    githubLoading.value = false
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
            <p class="text-md opacity-60 italic">"Your layout, your command."</p>
          </div>
        </div>
      </v-col>

      <!-- Auth Form -->
      <v-col cols="12" md="7" class="d-flex align-center justify-center">
        <div class="w-full max-w-md px-6 py-8">
          <!-- Mobile branding header -->
          <div class="d-md-none text-center mb-6">
            <v-icon size="48" color="primary">mdi-train</v-icon>
            <h2 class="text-2xl font-bold mt-2">DEJA.js</h2>
          </div>

          <h2 class="text-h4 font-weight-bold mb-2">Create Account</h2>
          <p class="text-body-1 text-medium-emphasis mb-6">Join the control room</p>

          <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = null">
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
              @click="handleGoogleSignup"
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
              @click="handleGithubSignup"
            >
              Continue with GitHub
            </v-btn>
          </div>

          <!-- Divider -->
          <div class="flex items-center gap-4 my-6">
            <v-divider />
            <span class="text-body-2 text-medium-emphasis whitespace-nowrap"
              >or sign up with email</span
            >
            <v-divider />
          </div>

          <!-- Email Form -->
          <v-form @submit.prevent="handleEmailSignup">
            <v-text-field
              v-model="displayName"
              label="Display Name"
              variant="outlined"
              :rules="displayNameRules"
              class="mb-2"
            />
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
              class="mb-1"
            />
            <!-- Password strength indicator -->
            <div v-if="password.length > 0" class="mb-3">
              <v-progress-linear
                :model-value="passwordStrength * 20"
                :color="passwordStrengthColor"
                height="4"
                rounded
              />
              <span class="text-caption" :class="`text-${passwordStrengthColor}`">
                {{ passwordStrengthLabel }}
              </span>
            </div>
            <v-text-field
              v-model="confirmPassword"
              label="Confirm Password"
              type="password"
              variant="outlined"
              :rules="confirmPasswordRules"
              class="mb-2"
            />
            <v-btn
              type="submit"
              :loading="emailLoading"
              :disabled="googleLoading || githubLoading"
              color="primary"
              size="large"
              block
              class="text-none mb-4"
            >
              Create Account
            </v-btn>
          </v-form>

          <div class="text-center">
            <span class="text-body-2">Already have an account?</span>
            <v-btn
              variant="text"
              color="primary"
              class="text-none"
              @click="emit('navigate-login')"
            >
              Sign in
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
