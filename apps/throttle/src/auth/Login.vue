<script lang="ts">
import { GithubAuthProvider } from 'firebase/auth'
export const githubAuthProvider = new GithubAuthProvider()
</script>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRedirectResult, signInWithPopup } from 'firebase/auth'
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import { useRouter } from 'vue-router'
import { FaGithubAlt, FaGoogle, FaMicrosoft, FaApple, FaFacebook } from 'vue3-icons/fa6'

const emit = defineEmits(['auth'])
const router = useRouter()
const auth = useFirebaseAuth()
const user = useCurrentUser()

// display errors if any
const error = ref<Error | null>(null)

async function handleGithubSignin() {
  // authComplete()
  try {
    if (!auth) throw new Error('Authentication not initialized')
    const resp = await signInWithPopup(auth, githubAuthProvider)
    console.log('Github signin success', resp)
    authComplete()
  } catch (err) {
    console.error('Failed signinRedirect', err)
    error.value = err as Error
  }
}

function authComplete() {
  emit('auth', {})
}

onMounted(() => {
  getRedirectResult(auth).catch((reason) => {
    console.error('Failed redirect result', reason)
    error.value = reason
  })
})
</script>

<template>
  <main class="flex flex-col max-w-screen-xm">
    <header class="flex flex-col space-y-4 items-start m-12">
      <h1
        class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-pink-600"
      >
        Welcom to DEJA Cloud
      </h1>
    </header>
    <pre>isAuthenticated: {{ Boolean(user) }}</pre>

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
      <h2
        class="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-800 to-indigo-600"
      >
        Sign in to continue.
      </h2>
      <article class="flex flex-col space-y-4 items-start m-12">
        <v-btn
          preset="secondary"
          border-color="primary"
          class="w-64"
          @click="handleGithubSignin"
          block="true"
        >
          <FaGithubAlt class="mr-2" />
          Sign in with GitHub
        </v-btn>
        <v-btn preset="secondary" border-color="primary" class="" block="true" disabled>
          <FaFacebook class="mr-2" />
          Sign in with Facebook
        </v-btn>
        <v-btn preset="secondary" border-color="primary" class="" block="true" disabled>
          <FaGoogle class="mr-2" />
          Sign in with Google
        </v-btn>
        <v-btn preset="secondary" border-color="primary" class="" block="true" disabled>
          <FaApple class="mr-2" />
          Sign in with Apple
        </v-btn>
        <v-btn preset="secondary" border-color="primary" class="" block="true" disabled>
          <FaMicrosoft class="mr-2" />
          Sign in with Microsoft
        </v-btn>
      </article>
    </template>
  </main>
</template>
