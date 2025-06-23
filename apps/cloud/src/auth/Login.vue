<script>
import { GithubAuthProvider } from 'firebase/auth'
export const githubAuthProvider = new GithubAuthProvider()
</script>
<script setup>
import { ref, onMounted } from 'vue'
import { getRedirectResult, signInWithPopup } from 'firebase/auth'
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import { useRouter } from 'vue-router'

const emit = defineEmits(['auth'])
const router = useRouter()
const auth = useFirebaseAuth()
const user = useCurrentUser()

// display errors if any
const error = ref(null)

async function handleGithubSignin() {
  // authComplete()
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
  <main class="flex flex-col max-w-screen-xm m-12">
    <header class="flex flex-col space-y-4 items-start">
      <h1
        class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-pink-600"
      >
        Welcom to DEJA Cloud
      </h1>
    </header>

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
      <article class="flex flex-col space-y-4 items-start my-4">
        <v-btn
          @click="handleGithubSignin"
          prepend-icon="mdi-github">
          Sign in with GitHub
        </v-btn>
        <v-btn disabled>
          Sign in with Facebook
        </v-btn>
        <v-btn disabled>
          Sign in with Google
        </v-btn>
        <v-btn disabled>
          Sign in with Apple
        </v-btn>
        <v-btn disabled>
          Sign in with Microsoft
        </v-btn>
      </article>
    </template>
  </main>
</template>
