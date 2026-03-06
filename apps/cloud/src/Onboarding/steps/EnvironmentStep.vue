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

      <v-divider class="my-6"></v-divider>

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
</template>
