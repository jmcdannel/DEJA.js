<template>
  <v-menu v-if="user">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        class="mr-2"
      >
        <v-avatar size="32">
          <v-img
            v-if="user.photoURL"
            :src="user.photoURL"
            :alt="user.displayName || 'User'"
          ></v-img>
          <v-icon v-else icon="mdi-account-circle"></v-icon>
        </v-avatar>
      </v-btn>
    </template>
    
    <v-card min-width="250">
      <v-card-text>
        <div class="d-flex align-center mb-3">
          <v-avatar size="40" class="mr-3">
            <v-img
              v-if="user.photoURL"
              :src="user.photoURL"
              :alt="user.displayName || 'User'"
            ></v-img>
            <v-icon v-else icon="mdi-account-circle"></v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-medium">
              {{ user.displayName || 'Tour Guest' }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ user.email }}
            </div>
          </div>
        </div>
        
        <v-divider class="mb-3"></v-divider>
        
        <div class="text-body-2 text-medium-emphasis mb-2">
          Tour Status
        </div>
        <v-chip size="small" color="success" class="mb-3">
          <v-icon icon="mdi-check-circle" class="mr-1"></v-icon>
          Signed In
        </v-chip>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          @click="handleSignOut"
          color="error"
          variant="text"
          size="small"
        >
          <v-icon icon="mdi-logout" class="mr-1"></v-icon>
          Sign Out
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'

const router = useRouter()
const auth = useFirebaseAuth()
const user = useCurrentUser()

const handleSignOut = async () => {
  if (!auth) {
    console.error('Firebase auth not available')
    return
  }
  
  try {
    await signOut(auth)
    console.log('User signed out')
    router.push('/login')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
</script>