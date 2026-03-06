<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrentUser, useCollection } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { doc, setDoc, serverTimestamp, collection, query, where } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { Signout } from '@repo/auth'

const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', '')

const userLayouts = useCollection(
  computed(() =>
    user.value?.email
      ? query(collection(db, 'layouts'), where('owner', '==', user.value.email))
      : null,
  ),
)
const primaryLayoutId = computed(() => userLayouts.value?.[0]?.id || layoutId.value)

const notificationSent = ref(false)
const notificationLoading = ref(false)
const notificationError = ref<string | null>(null)

const copied = ref(false)

const envBlock = computed(() => [
  `LAYOUT_ID=${primaryLayoutId.value}`,
  `VITE_FIREBASE_API_KEY=${import.meta.env.VITE_FIREBASE_API_KEY || ''}`,
  `VITE_FIREBASE_AUTH_DOMAIN=${import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || ''}`,
  `VITE_FIREBASE_DATABASE_URL=${import.meta.env.VITE_FIREBASE_DATABASE_URL || ''}`,
  `VITE_FIREBASE_PROJECT_ID=${import.meta.env.VITE_FIREBASE_PROJECT_ID || ''}`,
  `VITE_FIREBASE_STORAGE_BUCKET=${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || ''}`,
  `VITE_FIREBASE_MESSAGING_SENDER_ID=${import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''}`,
  `VITE_FIREBASE_APP_ID=${import.meta.env.VITE_FIREBASE_APP_ID || ''}`,
].join('\n'))

async function copyEnvBlock() {
  await navigator.clipboard.writeText(envBlock.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

async function sendApprovalNotification() {
  if (!user.value || !primaryLayoutId.value) return
  notificationLoading.value = true
  notificationError.value = null
  try {
    await setDoc(doc(db, 'approvalRequests', primaryLayoutId.value), {
      layoutId: primaryLayoutId.value,
      uid: user.value.uid,
      email: user.value.email,
      displayName: user.value.displayName,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
    notificationSent.value = true
  } catch (err: unknown) {
    const fbErr = err as { message?: string }
    notificationError.value = fbErr.message || 'Failed to send notification'
  } finally {
    notificationLoading.value = false
  }
}
</script>

<template>
  <v-container class="max-w-3xl mx-auto py-8">
    <!-- Approval Status -->
    <v-card class="mb-6">
      <v-card-title class="text-h5 d-flex align-center ga-2">
        <v-icon color="warning">mdi-clock-outline</v-icon>
        Awaiting Approval
      </v-card-title>
      <v-card-text>
        <p class="text-body-1 mb-4">
          Thanks for signing up{{ user?.displayName ? `, ${user.displayName}` : '' }}!
          Your layout <strong>{{ primaryLayoutId }}</strong> has been created and is pending admin approval.
          While you wait, you can set up your local environment below.
        </p>

        <v-alert v-if="notificationError" type="error" class="mb-4" closable @click:close="notificationError = null">
          {{ notificationError }}
        </v-alert>

        <v-alert v-if="notificationSent" type="success" variant="tonal" class="mb-4">
          Approval request sent! An admin will review your layout shortly.
        </v-alert>

        <v-btn
          v-if="!notificationSent"
          color="primary"
          :loading="notificationLoading"
          @click="sendApprovalNotification"
          prepend-icon="mdi-bell-ring-outline"
        >
          Notify Admin for Approval
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Environment Setup -->
    <v-card class="mb-6">
      <v-card-title class="text-h5 d-flex align-center ga-2">
        <v-icon color="primary">mdi-cog-outline</v-icon>
        Environment Setup
      </v-card-title>
      <v-card-text>
        <p class="text-body-2 mb-4">
          To run a DEJA.js server locally, use one of our quick install scripts.
          It will download the code, install dependencies, and help you configure your environment.
        </p>

        <div class="mb-6">
          <p class="font-weight-bold mb-1">macOS / Linux</p>
          <v-sheet class="pa-3 rounded-lg bg-[#0f172a] font-mono text-sm text-white mb-2" style="word-break: break-all;">
            curl -fsSL https://raw.githubusercontent.com/jmcdannel/DEJA.js/main/install.sh | bash
          </v-sheet>
        </div>

        <div class="mb-6">
          <p class="font-weight-bold mb-1">Windows (PowerShell)</p>
          <v-sheet class="pa-3 rounded-lg bg-[#0f172a] font-mono text-sm text-white mb-2" style="word-break: break-all;">
            irm https://raw.githubusercontent.com/jmcdannel/DEJA.js/main/install.ps1 | iex
          </v-sheet>
        </div>

        <v-divider class="my-6" />

        <h3 class="text-h6 mb-2">Your Credentials</h3>
        <p class="text-body-2 mb-4">
          During installation, you will be prompted for your <strong>Layout ID</strong> and <strong>Firebase Credentials</strong>. Copy the block below when requested:
        </p>

        <v-sheet class="pa-4 rounded-lg bg-[#0f172a] font-mono text-sm mb-4 text-white" style="white-space: pre-wrap; word-break: break-all;">{{ envBlock }}</v-sheet>

        <v-btn
          @click="copyEnvBlock"
          :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
          :color="copied ? 'success' : 'primary'"
          variant="outlined"
        >
          {{ copied ? 'Copied!' : 'Copy to Clipboard' }}
        </v-btn>
      </v-card-text>
    </v-card>

    <div class="text-center">
      <Signout />
    </div>
  </v-container>
</template>
