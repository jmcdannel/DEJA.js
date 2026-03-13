<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import { useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'

const log = createLogger('Auth')

const auth = useFirebaseAuth()
const user = useCurrentUser()
const router = useRouter()

async function handleSignOut() {
  if (!auth) return
  try {
    await signOut(auth)
    router.push('/login')
  } catch (reason) {
    log.error('Failed signOut', reason)
  }
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
