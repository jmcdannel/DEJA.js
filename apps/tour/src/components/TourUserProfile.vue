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

<style scoped>
</style>
