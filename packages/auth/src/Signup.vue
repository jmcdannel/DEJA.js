<script setup lang="ts">
import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'

const googleAuthProvider = new GoogleAuthProvider()
const githubAuthProvider = new GithubAuthProvider()

const emit = defineEmits<{
  signup: []
  'navigate-login': []
}>()

const auth = useFirebaseAuth()
const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

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

async function handleEmailSignup() {
  if (!auth) return
  loading.value = true
  error.value = null
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.value, password.value)
    await updateProfile(cred.user, { displayName: displayName.value })
    emit('signup')
  } catch (err: unknown) {
    const firebaseErr = err as { message?: string }
    error.value = firebaseErr.message || 'Signup failed'
  } finally {
    loading.value = false
  }
}

async function handleGoogleSignup() {
  if (!auth) return
  error.value = null
  try {
    await signInWithPopup(auth, googleAuthProvider)
    emit('signup')
  } catch (err: unknown) {
    const firebaseErr = err as { message?: string }
    error.value = firebaseErr.message || 'Google signup failed'
  }
}

async function handleGithubSignup() {
  if (!auth) return
  error.value = null
  try {
    await signInWithPopup(auth, githubAuthProvider)
    emit('signup')
  } catch (err: unknown) {
    const firebaseErr = err as { message?: string }
    error.value = firebaseErr.message || 'GitHub signup failed'
  }
}
</script>

<template>
  <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = null">
    {{ error }}
  </v-alert>

  <section class="w-full flex justify-center">
    <v-card elevation="2" class="pa-2 bg-transparent w-full">
      <v-card-title class="text-h6">Create your account</v-card-title>
      <v-card-text>
        <v-form v-slot="{ isValid }">
          <v-text-field v-model="displayName" label="Display Name" :rules="displayNameRules" required />
          <v-text-field v-model="email" label="Email" type="email" :rules="emailRules" required />
          <v-text-field v-model="password" label="Password" type="password" :rules="passwordRules" required />
          <v-text-field v-model="confirmPassword" label="Confirm Password" type="password" :rules="confirmPasswordRules" required />
          <v-btn
            type="button"
            @click="handleEmailSignup"
            :disabled="!isValid"
            :loading="loading"
            color="primary"
            block
            class="mt-4"
          >
            Create Account
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-text class="text-center">
        <span>Already have an account?</span>
        <v-btn variant="text" color="primary" @click="$emit('navigate-login')">Sign in</v-btn>
      </v-card-text>
    </v-card>
  </section>

  <article class="flex flex-col space-y-4 my-4 gap-2 w-full max-w-10">
    <v-btn @click="handleGithubSignup" prepend-icon="mdi-github" full-width>
      Sign up with GitHub
    </v-btn>
    <v-btn @click="handleGoogleSignup" prepend-icon="mdi-google" full-width>
      Sign up with Google
    </v-btn>
  </article>
</template>
