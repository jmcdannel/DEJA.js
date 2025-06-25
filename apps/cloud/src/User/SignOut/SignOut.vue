<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'

const auth = useFirebaseAuth()
const user = useCurrentUser()

function handleSignOut() {
  if (auth) {
    signOut(auth).catch((reason) => {
      console.error('Failed signOut', reason)
    })
  }
}
</script>
<template>
  <button
    class="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
    @click="handleSignOut" 
    :disabled="!user">Sign out
  </button>
</template>
