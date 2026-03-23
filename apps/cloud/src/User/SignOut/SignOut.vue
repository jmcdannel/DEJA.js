<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import { createLogger } from '@repo/utils'
import { useNotification } from '@repo/ui'

const log = createLogger('Auth')

const auth = useFirebaseAuth()
const user = useCurrentUser()
const { notify } = useNotification()

function handleSignOut() {
  if (auth) {
    signOut(auth).catch((reason) => {
      log.error('Failed signOut', reason)
      notify.error('Failed to sign out. Please try again.')
    })
  }
}
</script>
<template>
  <button
    class="block py-2 px-4 text-sm opacity-80 hover:opacity-100"
    @click="handleSignOut" 
    :disabled="!user">Sign out
  </button>
</template>
