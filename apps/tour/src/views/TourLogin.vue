<template>
  <div class="login-container">
    <v-container class="fill-height">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card elevation="8" class="pa-6">
            <v-card-text class="text-center">
              <TourLogo class="mb-6" style="width: 80px; height: 80px;" />
              
              <h1 class="text-h4 mb-2">Welcome to the Tour</h1>
              <p class="text-h6 text-medium-emphasis mb-6">
                Choose how you'd like to explore our model train layout
              </p>
              
              <!-- Loading State -->
              <div v-if="loading" class="text-center py-4">
                <v-progress-circular indeterminate class="mb-4"></v-progress-circular>
                <p>{{ loadingMessage }}</p>
              </div>
              
              <!-- Error State -->
              <v-alert v-if="error" type="error" class="mb-4">
                {{ error }}
              </v-alert>
              
              <!-- Success State -->
              <v-alert v-if="user || guestUser" type="success" class="mb-4">
                Welcome! Redirecting to the tour...
              </v-alert>
              
              <!-- Guest Access Section -->
              <div v-if="!user && !guestUser && !loading" class="guest-access mb-6">
                <v-card variant="tonal" color="primary" class="pa-4 mb-4">
                  <h3 class="text-h6 mb-3">🚂 Quick Guest Access</h3>
                  <p class="text-body-2 mb-4">
                    Start exploring immediately with a fun train-themed username!
                  </p>
                  
                  <!-- Username Selection -->
                  <v-select
                    v-model="selectedUsername"
                    :items="availableUsernames"
                    label="Choose your username"
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
                  
                  <v-btn
                    @click="handleGuestAccess"
                    color="primary"
                    size="large"
                    block
                    prepend-icon="mdi-train"
                  >
                    Start Tour as Guest
                  </v-btn>
                </v-card>
                
                <v-divider class="my-4">
                  <span class="text-caption text-medium-emphasis">OR</span>
                </v-divider>
              </div>
              
              <!-- Login Buttons -->
              <div v-if="!user && !guestUser && !loading" class="login-buttons">
                <h3 class="text-h6 mb-3">🔐 Sign in with Account</h3>
                <v-btn
                  @click="handleGithubSignin"
                  color="secondary"
                  size="large"
                  block
                  class="mb-3"
                  prepend-icon="mdi-github"
                >
                  Sign in with GitHub
                </v-btn>
                
                <v-btn
                  @click="handleGoogleSignin"
                  color="secondary"
                  size="large"
                  block
                  class="mb-4"
                  prepend-icon="mdi-google"
                >
                  Sign in with Google
                </v-btn>
                
                <p class="text-body-2 text-medium-emphasis">
                  Sign in with your account to save preferences and access additional features.
                </p>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- Info Cards -->
          <v-row class="mt-6">
            <v-col cols="12" sm="4" v-for="feature in features" :key="feature.title">
              <v-card variant="tonal" :color="feature.color" class="text-center pa-4">
                <v-icon :icon="feature.icon" size="32" class="mb-2"></v-icon>
                <h4 class="text-subtitle-1 mb-1">{{ feature.title }}</h4>
                <p class="text-body-2">{{ feature.description }}</p>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { GithubAuthProvider, GoogleAuthProvider, signInWithPopup, getRedirectResult } from 'firebase/auth'
import { useFirebaseAuth, useCurrentUser } from 'vuefire'
import { useGuestStore } from '../stores/guest'
import TourLogo from '../components/TourLogo.vue'

const router = useRouter()
const auth = useFirebaseAuth()
const user = useCurrentUser()
const guestStore = useGuestStore()

const loading = ref(false)
const loadingMessage = ref('')
const error = ref<string | null>(null)
const selectedUsername = ref<string>('')

const githubAuthProvider = new GithubAuthProvider()
const googleAuthProvider = new GoogleAuthProvider()

// Get available usernames from guest store
const availableUsernames = computed(() => guestStore.getAvailableUsernames)

// Get current guest user
const guestUser = computed(() => guestStore.currentGuest)

// Generate random username on component mount
const generateRandomUsername = () => {
  selectedUsername.value = guestStore.getRandomUsername()
}

const features = [
  {
    title: 'Interactive Effects',
    description: 'Control lights, sounds, and animations',
    icon: 'mdi-lightning-bolt',
    color: 'primary'
  },
  {
    title: 'Media Library',
    description: 'Watch videos and listen to audio tours',
    icon: 'mdi-video-library',
    color: 'accent'
  },
  {
    title: 'Technical Details',
    description: 'Learn how everything works',
    icon: 'mdi-cog',
    color: 'info'
  }
]

const handleGuestAccess = async () => {
  if (!selectedUsername.value) {
    error.value = 'Please select a username'
    return
  }
  
  try {
    loading.value = true
    loadingMessage.value = 'Creating your guest profile...'
    error.value = null
    
    // Create guest user
    const guestUser = guestStore.createGuestUser(selectedUsername.value)
    console.log('Guest user created:', guestUser)
    
    // Small delay to show success message
    setTimeout(() => {
      router.push('/')
    }, 1500)
    
  } catch (err: any) {
    console.error('Guest access failed:', err)
    error.value = err.message || 'Failed to create guest profile'
  } finally {
    loading.value = false
  }
}

const handleGithubSignin = async () => {
  if (!auth) {
    error.value = 'Authentication not available'
    return
  }
  
  try {
    loading.value = true
    loadingMessage.value = 'Signing in with GitHub...'
    error.value = null
    
    await signInWithPopup(auth, githubAuthProvider)
    console.log('GitHub signin success')
  } catch (err: any) {
    console.error('GitHub signin failed:', err)
    error.value = err.message || 'Failed to sign in with GitHub'
  } finally {
    loading.value = false
  }
}

const handleGoogleSignin = async () => {
  if (!auth) {
    error.value = 'Authentication not available'
    return
  }
  
  try {
    loading.value = true
    loadingMessage.value = 'Signing in with Google...'
    error.value = null
    
    await signInWithPopup(auth, googleAuthProvider)
    console.log('Google signin success')
  } catch (err: any) {
    console.error('Google signin failed:', err)
    error.value = err.message || 'Failed to sign in with Google'
  } finally {
    loading.value = false
  }
}

// Watch for successful authentication (Firebase or guest)
watch([user, () => guestStore.currentGuest], ([newUser, newGuest]) => {
  if (newUser || newGuest) {
    console.log('User authenticated, redirecting...')
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }
})

onMounted(async () => {
  // Initialize guest store
  guestStore.initialize()
  
  // Generate initial random username
  generateRandomUsername()
  
  if (!auth) {
    error.value = 'Authentication not available'
    return
  }
  
  try {
    // Handle redirect results
    await getRedirectResult(auth)
  } catch (err: any) {
    console.error('Redirect result error:', err)
    error.value = err.message || 'Authentication error'
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-primary), 0.1) 0%, 
    rgba(var(--v-theme-secondary), 0.1) 50%, 
    rgba(var(--v-theme-accent), 0.1) 100%
  );
}

.login-buttons {
  max-width: 300px;
  margin: 0 auto;
}

.guest-access {
  max-width: 400px;
  margin: 0 auto;
}
</style>