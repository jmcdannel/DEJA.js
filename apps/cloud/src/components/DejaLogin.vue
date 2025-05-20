<script>
import { GithubAuthProvider } from 'firebase/auth'
export const githubAuthProvider = new GithubAuthProvider()
</script>
<script setup>
import { ref, onMounted } from 'vue'
import { getRedirectResult, signInWithPopup } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'
import { FaGithubAlt, FaGoogle, FaMicrosoft, FaApple, FaFacebook } from 'vue3-icons/fa6'

const auth = useFirebaseAuth()

// display errors if any
const error = ref(null)

function handleGithubSignin() {
  signInWithPopup(auth, githubAuthProvider).catch((reason) => {
    console.error('Failed signinRedirect', reason)
    error.value = reason
  })
}

onMounted(() => {
  getRedirectResult(auth).catch((reason) => {
    console.error('Failed redirect result', reason)
    error.value = reason
  })
})
</script>

<template>
  <main class="flex flex-col h-screen max-w-screen-md mx-auto forest-background">
    
    <template v-if="error">
      <div class="alert alert-error">
        {{ error.message }}
      </div>
    </template>
    <template v-else>
      <article class="flex flex-col space-y-4 items-start">
        <button
          class="border bg-transparent border-cyan-800 text-cyan-400 py-1 px-2 font-normal text-sm rounded-md hover:bg-cyan-900 hover:bg-opacity-20 flex items-center"
          @click="handleGithubSignin"
          block="true"
        >
          <FaGithubAlt class="mr-2" />
          Sign in with GitHub
      </button>
        <!-- <VaButton preset="secondary" border-color="primary" class="" block="true" disabled>
          <FaFacebook class="mr-2" />
          Sign in with Facebook
        </VaButton>
        <VaButton preset="secondary" border-color="primary" class="" block="true" disabled>
          <FaGoogle class="mr-2" />
          Sign in with Google
        </VaButton>
        <VaButton preset="secondary" border-color="primary" class="" block="true" disabled>
          <FaApple class="mr-2" />
          Sign in with Apple
        </VaButton>
        <VaButton preset="secondary" border-color="primary" class="" block="true" disabled>
          <FaMicrosoft class="mr-2" />
          Sign in with Microsoft
        </VaButton> -->
      </article>
    </template>
  </main>
</template>
