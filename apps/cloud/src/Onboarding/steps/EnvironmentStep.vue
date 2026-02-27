<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

const layoutId = useStorage('@DEJA/layoutId', '')
const copied = ref(false)

const envBlock = [
  `LAYOUT_ID=${layoutId.value}`,
  `VITE_FIREBASE_API_KEY=${import.meta.env.VITE_FIREBASE_API_KEY || ''}`,
  `VITE_FIREBASE_AUTH_DOMAIN=${import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || ''}`,
  `VITE_FIREBASE_DATABASE_URL=${import.meta.env.VITE_FIREBASE_DATABASE_URL || ''}`,
  `VITE_FIREBASE_PROJECT_ID=${import.meta.env.VITE_FIREBASE_PROJECT_ID || ''}`,
  `VITE_FIREBASE_STORAGE_BUCKET=${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || ''}`,
  `VITE_FIREBASE_MESSAGING_SENDER_ID=${import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''}`,
  `VITE_FIREBASE_APP_ID=${import.meta.env.VITE_FIREBASE_APP_ID || ''}`,
].join('\n')

async function copyEnvBlock() {
  await navigator.clipboard.writeText(envBlock)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <v-card flat class="bg-transparent">
    <v-card-title class="text-h6">Server Environment Setup</v-card-title>
    <v-card-text>
      <p class="text-body-2 mb-4">
        To run a DEJA.js server locally, copy these environment variables into your <code>.env</code> file.
        This step is optional if you only plan to use the web interface.
      </p>

      <v-sheet class="pa-4 rounded-lg bg-[#0f172a] font-mono text-sm mb-4" style="white-space: pre-wrap; word-break: break-all;">{{ envBlock }}</v-sheet>

      <v-btn
        @click="copyEnvBlock"
        :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
        :color="copied ? 'success' : 'primary'"
        variant="outlined"
      >
        {{ copied ? 'Copied!' : 'Copy to Clipboard' }}
      </v-btn>

      <v-alert type="info" variant="tonal" class="mt-4">
        <p class="text-body-2">
          Your layout ID is <strong>{{ layoutId }}</strong>. Use this when configuring additional DEJA.js apps or devices.
        </p>
      </v-alert>
    </v-card-text>
  </v-card>
</template>
