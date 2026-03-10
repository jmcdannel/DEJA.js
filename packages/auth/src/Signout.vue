<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import { createLogger } from '@repo/utils'

const log = createLogger('Auth')

const auth = useFirebaseAuth()
const user = useCurrentUser()

function handleSignOut() {
  auth && signOut(auth).catch((reason) => {
    log.error('Failed signOut', reason)
  })
}
</script>

<template>
  <v-btn 
    @click="handleSignOut" 
    variant="outlined" 
    color="error" 
    :disabled="!user" 
    text="Sign out" 
  />
</template>
