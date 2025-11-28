<script>
import { GithubAuthProvider } from 'firebase/auth'
import { GoogleAuthProvider } from 'firebase/auth'
export const githubAuthProvider = new GithubAuthProvider()
export const googleAuthProvider = new GoogleAuthProvider()
</script>
<script setup>
import { ref, onMounted } from 'vue'
import { getRedirectResult, signInWithPopup, getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import { useRouter } from 'vue-router'

const emit = defineEmits(['auth'])
const router = useRouter()
const fbauth = getAuth()
const auth = useFirebaseAuth()
const user = useCurrentUser()
const email = ref('')
const password = ref('')
const remember = ref(false)


// display errors if any
const error = ref(null)

async function handleGithubSignin() {
  try {
    if (!auth) {
      throw new Error('auth is null')
    }
    const resp = await signInWithPopup(auth, githubAuthProvider)
    console.log('Github signin success', resp)
    authComplete()
  } catch (err) {
    console.error('Failed signinRedirect', err)
    // error.value = err
  }
}

async function handleGoogleSignin() {
  try {
    if (!auth) {
      throw new Error('auth is null')
    }
    const resp = await signInWithPopup(auth, googleAuthProvider)
    console.log('Google signin success', resp)
    authComplete()
  } catch (err) {
    console.error('Failed signinRedirect', err)
    // error.value = err
  }
}

async function handleEmailSignin() {
  try {
  if (!auth) {
    throw new Error('auth is null')
  }
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      console.log('Email signin success', user)
      authComplete()
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Failed email signin', errorCode, errorMessage)
      error.value = errorMessage
    });
  } catch (err) {
    console.error('Failed email signin', err)
    // error.value = err
  }

  
}

function authComplete() {
  emit('auth', {})
}

onMounted(() => {
  if (!auth) {
    throw new Error('auth is null')
  }
  getRedirectResult(auth).catch((reason) => {
    console.error('Failed redirect result', reason)
    error.value = reason
  })
})
</script>

<template>
  <template v-if="error">
    <div class="alert alert-error">
      {{ error.message }}
    </div>
  </template>
  <template v-else-if="user">
    <div class="alert alert-success">
      Sign in success
    </div>
  </template>
  <template v-else-if="!user">
    <section class="w-full flex justify-center">
      <v-card elevation="2" class="pa-2 bg-transparent w-full">
        <v-card-title class="text-h6">Sign in with email</v-card-title>
        <v-card-text>
          <v-form ref="loginForm" v-slot="{ isValid }">
            <p>isValid:{{ isValid }}</p>
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Must be a valid email']"
              required
              dense
            />
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              :rules="[v => !!v || 'Password is required']"
              required
              dense
            />
            <div class="flex items-center justify-between my-2">
              <v-checkbox v-model="remember" label="Remember me" hide-details dense />
              <v-btn text small @click="$router.push('/forgot-password')">Forgot?</v-btn>
            </div>
            <v-row class="mt-4">
              <v-col cols="12" sm="6">
                <v-btn text small href="https://www.dejajs.com" target="_blank" rel="noopener" color="secondary">
                  Learn more
                </v-btn>
              </v-col>  
              <v-col cols="12" sm="6">
                <v-btn type="button" @click="handleEmailSignin" :disabled="!isValid" color="primary" block>
                  Sign in
                </v-btn>
              </v-col>            
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </section>
    <article class="flex flex-col space-y-4 my-4 gap-2 w-full max-w-10">
      <v-btn @click="handleGithubSignin" prepend-icon="mdi-github" full-width>
        Sign in with GitHub
      </v-btn>
      <v-btn @click="handleGoogleSignin" prepend-icon="mdi-google" full-width>
        Sign in with Google
      </v-btn>
      <v-btn disabled full-width>
        Sign in with Apple
      </v-btn>
      <v-btn disabled full-width>
        Sign in with Facebook
      </v-btn>
      <v-btn disabled full-width>
        Sign in with Microsoft
      </v-btn>
    </article>
  </template>
</template>
