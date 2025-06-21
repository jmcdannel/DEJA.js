<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'

const auth = useFirebaseAuth()
const user = useCurrentUser()

function handleSignOut() {
  auth && signOut(auth).catch((reason) => {
    console.error('Failed signOut', reason)
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
