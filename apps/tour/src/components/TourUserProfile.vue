<template>
  <!-- Firebase User Profile -->
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
              {{ user.displayName || 'Tour User' }}
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

  <!-- Guest User Profile -->
  <v-menu v-else-if="guestStore.isGuestUser">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        class="mr-2"
      >
        <v-avatar size="32" color="primary">
          <v-icon icon="mdi-train" color="white"></v-icon>
        </v-avatar>
      </v-btn>
    </template>
    
    <v-card min-width="300">
      <v-card-text>
        <div class="d-flex align-center mb-3">
          <v-avatar size="40" color="primary" class="mr-3">
            <v-icon icon="mdi-train" color="white" size="24"></v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-medium">
              {{ guestStore.currentGuest?.username }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Guest User
            </div>
          </div>
        </div>
        
        <v-divider class="mb-3"></v-divider>
        
        <div class="text-body-2 text-medium-emphasis mb-2">
          Tour Status
        </div>
        <v-chip size="small" color="info" class="mb-3">
          <v-icon icon="mdi-train" class="mr-1"></v-icon>
          Guest Mode
        </v-chip>
        
        <div class="text-body-2 text-medium-emphasis mb-2">
          Member Since
        </div>
        <div class="text-body-2 mb-3">
          {{ formatDate(guestStore.currentGuest?.createdAt) }}
        </div>
      </v-card-text>
      
      <v-card-actions>
        <v-btn
          @click="showUserSwitcher = true"
          color="primary"
          variant="text"
          size="small"
        >
          <v-icon icon="mdi-account-switch" class="mr-1"></v-icon>
          Switch User
        </v-btn>
        
        <v-spacer></v-spacer>
        
        <v-btn
          @click="handleGuestSignOut"
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

  <!-- User Switcher Dialog -->
  <v-dialog v-model="showUserSwitcher" max-width="500">
    <v-card>
      <v-card-title class="text-h6">
        <v-icon icon="mdi-account-switch" class="mr-2"></v-icon>
        Choose a Different Username
      </v-card-title>
      
      <v-card-text>
        <p class="text-body-2 mb-4">
          Select a new train-themed username for your tour experience:
        </p>
        
        <v-select
          v-model="newUsername"
          :items="availableUsernames"
          label="New Username"
          variant="outlined"
          density="compact"
          class="mb-3"
          :menu-props="{ maxHeight: 200 }"
        >
          <template v-slot:append>
            <v-btn
              icon="mdi-dice-multiple"
              size="small"
              variant="text"
              @click="generateRandomUsername"
              title="Generate random username"
            ></v-btn>
          </template>
        </v-select>
        
        <v-alert
          v-if="usernameChangeError"
          type="error"
          variant="tonal"
          class="mb-3"
        >
          {{ usernameChangeError }}
        </v-alert>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="showUserSwitcher = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="handleUsernameChange"
          :loading="changingUsername"
        >
          Change Username
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import { useGuestStore } from '../stores/guest'

const router = useRouter()
const auth = useFirebaseAuth()
const user = useCurrentUser()
const guestStore = useGuestStore()

const showUserSwitcher = ref(false)
const newUsername = ref('')
const changingUsername = ref(false)
const usernameChangeError = ref('')

// Get available usernames
const availableUsernames = computed(() => guestStore.getAvailableUsernames)

// Generate random username
const generateRandomUsername = () => {
  newUsername.value = guestStore.getRandomUsername()
}

// Handle username change
const handleUsernameChange = async () => {
  if (!newUsername.value) {
    usernameChangeError.value = 'Please select a username'
    return
  }
  
  try {
    changingUsername.value = true
    usernameChangeError.value = ''
    
    // Create new guest user with new username
    guestStore.createGuestUser(newUsername.value)
    
    // Close dialog and show success
    showUserSwitcher.value = false
    newUsername.value = ''
    
    // Small delay to show the change
    setTimeout(() => {
      // Optionally refresh the page or update UI
      window.location.reload()
    }, 1000)
    
  } catch (err: any) {
    usernameChangeError.value = err.message || 'Failed to change username'
  } finally {
    changingUsername.value = false
  }
}

// Handle Firebase user sign out
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

// Handle guest user sign out
const handleGuestSignOut = () => {
  guestStore.clearGuestUser()
  router.push('/login')
}

// Format date for display
const formatDate = (date: Date | undefined): string => {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Initialize new username when dialog opens
const watchDialog = computed(() => {
  if (showUserSwitcher.value && !newUsername.value) {
    generateRandomUsername()
  }
  return showUserSwitcher.value
})
</script>