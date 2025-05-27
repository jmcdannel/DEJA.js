<script lang="ts">
import { GithubAuthProvider } from 'firebase/auth'
export const githubAuthProvider = new GithubAuthProvider()
</script>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRedirectResult, signInWithPopup } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'
import { FaGithubAlt, FaGoogle, FaMicrosoft, FaApple, FaFacebook } from 'vue3-icons/fa6'

const auth = useFirebaseAuth()

// display errors if any
const error = ref(null)

function handleGithubSignin() {
  if (!auth) {
    console.error('Firebase auth is not initialized')
    return
  }
  signInWithPopup(auth, githubAuthProvider).catch((reason) => {
    console.error('Failed signinRedirect', reason)
    error.value = reason
  })
}

onMounted(() => {
  if (!auth) {
    console.error('Firebase auth is not initialized')
    return
  }
  getRedirectResult(auth).catch((reason) => {
    console.error('Failed redirect result', reason)
    error.value = reason
  })
})
</script>

<template>
  <main class="flex flex-col mx-auto">    
    <template v-if="error">
      <div class="alert alert-error">
        {{ error }}
      </div>
    </template>
    <template v-else>
      <article class="flex flex-col space-y-4 items-start">
      <v-btn text="Sign in with GitHub" @click="handleGithubSignin" variant="tonal" color="deep-purple-lighten-2" block>
        <template #prepend>
          <FaGoogle />
        </template>
      </v-btn>
      <v-btn text="Sign in with Facebook" variant="tonal" color="deep-purple-lighten-2" disabled block>
        <template #prepend>
          <FaGithubAlt />
        </template>
      </v-btn>
      <v-btn text="Sign in with Google" variant="tonal" color="deep-purple-lighten-2" disabled block>
        <template #prepend>
          <FaGoogle />
        </template>
      </v-btn>
      <v-btn text="Sign in with Apple" variant="tonal" color="deep-purple-lighten-2" disabled block>
        <template #prepend>
          <FaApple />
        </template>
      </v-btn>
      <v-btn text="Sign in with Microsoft" variant="tonal" color="deep-purple-lighten-2" disabled block>
        <template #prepend>
          <FaMicrosoft />
        </template>
      </v-btn>
      </article>
    </template>
  </main>
</template>

<style>
  input[type="text"], input[type="password"] {
    background-color: var(--bg-color);
  }
  input[type="text"]:focus, input[type="password"]:focus {
    box-shadow: none;
  }

</style>